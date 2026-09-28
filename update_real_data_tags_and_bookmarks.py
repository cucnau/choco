import json, urllib.request, re, html, time
from concurrent.futures import ThreadPoolExecutor

print("=== BẮT ĐẦU CẬP NHẬT TAGS, BOOKMARKS, RATING VÀ GIỚI THIỆU CHUẨN XÁC ===")

with open('src/data/jjwxcRealData.json', 'r', encoding='utf-8') as f:
    master_data = json.load(f)

all_novels = master_data.get('allNovels', [])
all_novels_map = {str(n['novelId']): n for n in all_novels}

def clean_intro_text(raw_intro):
    if not raw_intro:
        return ""
    text = html.unescape(str(raw_intro))
    text = html.unescape(text)
    text = re.sub(r'<\s*br\s*/?\s*>', '\n', text, flags=re.I)
    text = re.sub(r'</?\s*p\s*>', '\n', text, flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = text.replace('\u0000', '').replace('\u3000', ' ')
    
    # Tự động ngắt đoạn chống dính chữ trong giới thiệu
    text = re.sub(r'([^\n])([\[【［])', r'\1\n\n\2', text)
    text = re.sub(r'([\]】］])\s*([^\n\[【［\s])', r'\1\n\n\2', text)
    text = re.sub(r'([。！？!?])\s*(["“])', r'\1\n\2', text)
    text = re.sub(r'(["”])\s*([^\n"”\s])', r'\1\n\2', text)
    for kw in ['立意[：:]', '一句话简介[：:]', '主角[：:]', '配角[：:]', '其它[：:]', '内容标签[：:]', '搜索关键字[：:]', '排雷[：:]', 'ps[：:]', 'tip[：:]']:
        text = re.sub(rf'([^\n])\s*({kw})', r'\1\n\n\2', text)
        
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def clean_digits(val):
    if not val:
        return "0"
    s = str(val).replace('\u0000', '').strip()
    digits = re.sub(r'[^\d]', '', s)
    return digits if digits else "0"

headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Accept': 'application/json, text/plain, */*'
}

# 1. Tìm các truyện trong allNovels cần cập nhật từ API (bookmarks == 0 hoặc tags chứa '原创' hoặc '-')
need_update_nids = []
for n in all_novels:
    nid = str(n.get('novelId'))
    has_bad_tag = any('原创' in t or '-' in t for t in n.get('tags', []))
    no_bookmark = not n.get('bookmarks') or n.get('bookmarks') == 0
    if has_bad_tag or no_bookmark or not n.get('rating'):
        need_update_nids.append(nid)

print(f"-> Tìm thấy {len(need_update_nids)} truyện cần đồng bộ lại Bookmark, Tag gốc và Đánh giá từ Tấn Giang...")

def fetch_details(nid):
    api_url = f'https://app.jjwxc.net/androidapi/novelbasicinfo?novelId={nid}'
    for attempt in range(3):
        try:
            req = urllib.request.Request(api_url, headers=headers)
            with urllib.request.urlopen(req, timeout=7) as res:
                data = json.loads(res.read().decode('utf-8', errors='ignore'))
            
            raw_tags = data.get('novelTags', '')
            if raw_tags:
                parsed_tags = [t.strip() for t in re.split(r'[,/，、\s]+', raw_tags) if t.strip() and not t.strip().startswith('原创-') and '-' not in t.strip()]
            else:
                raw_class = data.get('novelClass', '')
                parsed_tags = [t.strip() for t in re.split(r'[\s/]+', raw_class) if t.strip() and not t.strip().startswith('原创-') and '-' not in t.strip()]
            
            bm = int(clean_digits(data.get('novelbefavoritedcount') or data.get('bfCount') or 0))
            
            raw_review = str(data.get('novelReviewScore', ''))
            review_match = re.search(r'(\d+(?:\.\d+)?)', raw_review)
            rating_val = float(review_match.group(1)) if review_match else None
            
            clean_intro = clean_intro_text(data.get('novelIntro', ''))
            
            res_dict = {
                'bookmarks': bm,
                'tags': parsed_tags
            }
            if rating_val is not None:
                res_dict['rating'] = rating_val
            if clean_intro and len(clean_intro) > 30:
                res_dict['intro'] = clean_intro
            return nid, res_dict
        except Exception:
            time.sleep(0.3)
    return nid, {}

# Fetch song song 50 workers
if need_update_nids:
    with ThreadPoolExecutor(max_workers=50) as executor:
        results = list(executor.map(fetch_details, need_update_nids))
        updated_count = 0
        for nid, info in results:
            if info and nid in all_novels_map:
                novel = all_novels_map[nid]
                if 'bookmarks' in info:
                    novel['bookmarks'] = info['bookmarks']
                if info.get('tags'):
                    novel['tags'] = info['tags']
                if info.get('rating') is not None:
                    novel['rating'] = info['rating']
                if info.get('intro'):
                    novel['intro'] = info['intro']
                updated_count += 1
        print(f"-> Đã cập nhật thành công {updated_count} truyện từ API Tấn Giang!")

# 2. Xử lý làm sạch toàn diện cho TẤT CẢ các truyện còn lại:
# - Lọc sạch mọi tag bẩn '原创-' hoặc có dấu '-'
# - Format lại intro chống dính đoạn
for n in all_novels:
    clean_tags = [t.strip() for t in n.get('tags', []) if t and not t.strip().startswith('原创-') and '-' not in t.strip()]
    n['tags'] = clean_tags
    if n.get('intro'):
        n['intro'] = clean_intro_text(n['intro'])

# 3. Đồng bộ lại vào tagRankings
tag_rankings = master_data.get('tagRankings', {})
for tag_id, items in tag_rankings.items():
    for item in items:
        nid = str(item.get('novelId'))
        if nid in all_novels_map:
            updated = all_novels_map[nid]
            item['bookmarks'] = updated.get('bookmarks', item.get('bookmarks', 0))
            item['tags'] = updated.get('tags', item.get('tags', []))
            if updated.get('rating'):
                item['rating'] = updated['rating']
            if updated.get('intro'):
                item['intro'] = updated['intro']
        else:
            # Lọc sạch tag cho item nếu không có trong all_novels_map
            item['tags'] = [t.strip() for t in item.get('tags', []) if t and not t.strip().startswith('原创-') and '-' not in t.strip()]
            if item.get('intro'):
                item['intro'] = clean_intro_text(item['intro'])

# 4. Ghi đè vào file JSON
print("-> Đang ghi đè vào src/data/jjwxcRealData.json...")
master_data['allNovels'] = list(all_novels_map.values())
master_data['tagRankings'] = tag_rankings

with open('src/data/jjwxcRealData.json', 'w', encoding='utf-8') as f:
    json.dump(master_data, f, ensure_ascii=False, indent=2)

print("=== HOÀN TẤT CẬP NHẬT TAGS, BOOKMARKS, RATING VÀ GIỚI THIỆU! ===")
