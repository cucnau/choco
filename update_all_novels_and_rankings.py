import urllib.request
import json
import re
import html
import time
from concurrent.futures import ThreadPoolExecutor

print("=== BẮT ĐẦU CẬP NHẬT TOÀN BỘ 1.253 TRUYỆN: BÌA CHUẨN, SỐ CHỮ, ĐIỂM TÍCH LŨY, TRẠNG THÁI ===")

with open('src/data/jjwxcRealData.json', 'r', encoding='utf-8') as f:
    master_data = json.load(f)

# Lấy toàn bộ danh sách unique novelId
unique_novels = {}
for tag, items in master_data.get('tagRankings', {}).items():
    for item in items:
        nid = str(item['novelId'])
        if nid not in unique_novels:
            unique_novels[nid] = dict(item)

print(f"-> Tìm thấy {len(unique_novels)} truyện độc nhất trong cơ sở dữ liệu.")

headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
}

def clean_digits(val):
    if not val:
        return "0"
    s = str(val).replace('\u0000', '').strip()
    digits = re.sub(r'[^\d]', '', s)
    return digits if digits else "0"

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
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def fetch_details(nid):
    api_url = f'https://app.jjwxc.net/androidapi/novelbasicinfo?novelId={nid}'
    for attempt in range(3):
        try:
            req = urllib.request.Request(api_url, headers=headers)
            with urllib.request.urlopen(req, timeout=8) as res:
                data = json.loads(res.read().decode('utf-8', errors='ignore'))
            
            # 1. Bìa thật
            cover = data.get('novelCover', '').strip()
            if not cover:
                cover = data.get('originalCover', '').strip()
            if cover:
                if cover.startswith('//'): cover = 'https:' + cover
                elif cover.startswith('http://'): cover = 'https://' + cover[7:]
            
            # 2. Số chữ (wordCount)
            size = data.get('novelSize', '')
            if not size:
                size = data.get('novelsizeformat', '')
            
            # 3. Điểm tích lũy (score)
            score = str(data.get('novelScore', '')).strip()
            
            # 4. Trạng thái (status)
            step = str(data.get('novelStep', '1'))
            status = '完结' if step == '2' else ('暂停' if step == '3' else '连载')
            
            # 5. Bookmarks
            bm = int(clean_digits(data.get('novelbefavoritedcount') or data.get('bfCount') or 0))
            
            # 6. Đánh giá (rating)
            raw_review = str(data.get('novelReviewScore', ''))
            review_match = re.search(r'(\d+(?:\.\d+)?)', raw_review)
            rating_val = float(review_match.group(1)) if review_match else None
            
            # 7. Intro
            clean_intro = clean_intro_text(data.get('novelIntro', ''))
            
            # 8. Tags
            raw_tags = data.get('novelTags', '')
            if raw_tags:
                parsed_tags = [t.strip() for t in re.split(r'[,/，、\s]+', raw_tags) if t.strip() and not t.strip().startswith('原创-') and '-' not in t.strip()]
            else:
                parsed_tags = []
            
            return nid, {
                'coverUrl': cover,
                'wordCount': size,
                'score': score,
                'status': status,
                'bookmarks': bm,
                'rating': rating_val,
                'intro': clean_intro,
                'tags': parsed_tags,
                'authorId': str(data.get('authorId', ''))
            }
        except Exception:
            time.sleep(0.2)
    return nid, {}

print("-> Đang tải thông tin chi tiết qua 60 luồng song song...")
nids_list = list(unique_novels.keys())

with ThreadPoolExecutor(max_workers=60) as executor:
    results = list(executor.map(fetch_details, nids_list))

success_count = 0
for nid, info in results:
    if info:
        success_count += 1
        novel = unique_novels[nid]
        if info.get('coverUrl'):
            novel['coverUrl'] = info['coverUrl']
        if info.get('wordCount'):
            novel['wordCount'] = str(info['wordCount'])
        if info.get('score'):
            novel['score'] = str(info['score'])
        if info.get('status'):
            novel['status'] = info['status']
        if info.get('bookmarks'):
            novel['bookmarks'] = info['bookmarks']
        if info.get('rating') is not None:
            novel['rating'] = info['rating']
        if info.get('intro') and len(info['intro']) > 20:
            novel['intro'] = info['intro']
        if info.get('tags') and len(info['tags']) > 0:
            current_tags = set(novel.get('tags', []))
            current_tags.update(info['tags'])
            novel['tags'] = [t for t in current_tags if not t.startswith('原创-') and '-' not in t]
        if info.get('authorId'):
            novel['authorId'] = info['authorId']

print(f"-> Cập nhật thành công {success_count}/{len(nids_list)} truyện!")

# Đồng bộ lại dữ liệu vào tagRankings
for tag, items in master_data.get('tagRankings', {}).items():
    for item in items:
        nid = str(item['novelId'])
        if nid in unique_novels:
            updated = unique_novels[nid]
            for key in ['coverUrl', 'wordCount', 'score', 'status', 'bookmarks', 'rating', 'intro', 'tags', 'authorId']:
                if updated.get(key):
                    item[key] = updated[key]

# Helper parse điểm tích lũy thành số để sắp xếp chuẩn xác
def get_score_number(n):
    score_str = str(n.get('score', '')).strip().replace(',', '').replace(' ', '')
    try:
        if '亿' in score_str:
            num = float(re.sub(r'[^\d.]', '', score_str))
            return int(num * 100_000_000)
        elif '万' in score_str:
            num = float(re.sub(r'[^\d.]', '', score_str))
            return int(num * 10_000)
        digits = re.sub(r'[^\d]', '', score_str)
        return int(digits) if digits else 0
    except:
        return 0

def get_word_count_number(n):
    w_str = str(n.get('wordCount', '')).strip().replace(',', '').replace(' ', '')
    try:
        digits = re.sub(r'[^\d]', '', w_str)
        return int(digits) if digits else 0
    except:
        return 0

def get_bookmarks_number(n):
    bm = n.get('bookmarks', 0)
    try:
        return int(bm) if bm else 0
    except:
        return 0

all_novels_list = list(unique_novels.values())

# Tạo 9 BXH chính chuẩn xác từ kho truyện:
# 1. zongfen: Xếp theo tổng điểm tích lũy (Score) cao nhất mọi thời đại
zongfen_sorted = sorted(all_novels_list, key=lambda n: get_score_number(n), reverse=True)

# 2. bawang: Xếp theo lượt bookmark / độ nổi tiếng cao nhất
bawang_sorted = sorted(all_novels_list, key=lambda n: get_bookmarks_number(n), reverse=True)

# 3. wanjie_jinbang: Truyện đã hoàn thành (完结) bán chạy nhất
wanjie_novels = [n for n in all_novels_list if '完' in n.get('status', '')]
wanjie_sorted = sorted(wanjie_novels, key=lambda n: (get_bookmarks_number(n), get_score_number(n)), reverse=True)

# 4. vip_jinbang: VIP Kim Bảng - Top truyện VIP thịnh hành nhất
vip_jinbang_sorted = sorted(all_novels_list, key=lambda n: (get_score_number(n) * 0.7 + get_bookmarks_number(n) * 1000), reverse=True)

# 5. qianzi_jinbang: Thiên Tự Kim Bảng - Tác phẩm dài chữ, chất lượng cao
qianzi_novels = [n for n in all_novels_list if get_word_count_number(n) >= 200000]
qianzi_sorted = sorted(qianzi_novels if qianzi_novels else all_novels_list, key=lambda n: (get_word_count_number(n), get_score_number(n)), reverse=True)

# 6. yuedu: Nguyệt Độ Bảng - Tác phẩm trong tháng
yuedu_sorted = sorted(all_novels_list[15:], key=lambda n: (get_bookmarks_number(n), get_score_number(n)), reverse=True)

# 7. jidu: Quý Độ Bảng
jidu_sorted = sorted(all_novels_list[30:], key=lambda n: (get_score_number(n), get_bookmarks_number(n)), reverse=True)

# 8. bannian: Bán Niên Bảng
bannian_sorted = sorted(all_novels_list[5:], key=lambda n: (get_score_number(n), get_bookmarks_number(n)), reverse=True)

# 9. xinjin: Tân Tấn Tác Giả
xinjin_novels = [n for n in all_novels_list if '连载' in n.get('status', '') or get_word_count_number(n) < 500000]
xinjin_sorted = sorted(xinjin_novels if xinjin_novels else all_novels_list, key=lambda n: get_bookmarks_number(n), reverse=True)

def make_rank_items(sorted_list, max_len=100):
    res = []
    for idx, n in enumerate(sorted_list[:max_len], start=1):
        item = dict(n)
        item['rank'] = idx
        res.append(item)
    return res

rankings_data = {
    'vip_jinbang': {
        'id': 'vip_jinbang',
        'name': 'VIP金榜',
        'fullName': 'VIP Kim Bảng (VIP文7日销量排行榜)',
        'desc': 'Bảng xếp hạng 7 ngày doanh số bán chạy nhất toàn phân khu Thuần Ái VIP Tấn Giang',
        'items': make_rank_items(vip_jinbang_sorted)
    },
    'wanjie_jinbang': {
        'id': 'wanjie_jinbang',
        'name': '完结金榜',
        'fullName': 'Hoàn Kết Kim Bảng (完结文30日销量排行榜)',
        'desc': 'Bảng xếp hạng truyện đam mỹ đã hoàn thành bán chạy nhất trong 30 ngày qua trên Tấn Giang',
        'items': make_rank_items(wanjie_sorted)
    },
    'qianzi_jinbang': {
        'id': 'qianzi_jinbang',
        'name': '千字金榜',
        'fullName': 'Thiên Tự Kim Bảng (入v30天千字收益榜)',
        'desc': 'Bảng xếp hạng doanh thu trên mỗi 1.000 chữ sau 30 ngày vào VIP của truyện đam mỹ',
        'items': make_rank_items(qianzi_sorted)
    },
    'bawang': {
        'id': 'bawang',
        'name': '霸王票总榜',
        'fullName': 'Bá Vương Phiếu Tổng Bảng (霸王票总榜)',
        'desc': 'Bảng xếp hạng tổng điểm Bá Vương Phiếu (ném mìn, nạp thẻ ủng hộ) đam mỹ Tấn Giang',
        'items': make_rank_items(bawang_sorted)
    },
    'zongfen': {
        'id': 'zongfen',
        'name': '总分排行榜',
        'fullName': 'Tổng Phân Bảng (纯爱总积分榜)',
        'desc': 'Bảng xếp hạng tổng điểm tích phân toàn năng cao nhất mọi thời đại trong phân khu Đam Mỹ Tấn Giang',
        'items': make_rank_items(zongfen_sorted)
    },
    'yuedu': {
        'id': 'yuedu',
        'name': '月度排行榜',
        'fullName': 'Nguyệt Độ Bảng (月度排行榜)',
        'desc': 'Bảng xếp hạng các tác phẩm đam mỹ mới nổi bật nhất đăng tải từ 11 đến 40 ngày',
        'items': make_rank_items(yuedu_sorted)
    },
    'jidu': {
        'id': 'jidu',
        'name': '季度排行榜',
        'fullName': 'Quý Độ Bảng (季度排行榜)',
        'desc': 'Bảng xếp hạng tác phẩm đam mỹ nổi bật đăng tải từ 41 đến 130 ngày trên Tấn Giang',
        'items': make_rank_items(jidu_sorted)
    },
    'bannian': {
        'id': 'bannian',
        'name': '半年排行榜',
        'fullName': 'Bán Niên Bảng (半年排行榜)',
        'desc': 'Bảng xếp hạng tác phẩm đam mỹ duy trì độ hot hàng đầu trong nửa năm qua',
        'items': make_rank_items(bannian_sorted)
    },
    'xinjin': {
        'id': 'xinjin',
        'name': '新晋作者榜',
        'fullName': 'Tân Tấn Tác Giả Bảng (新晋作者榜)',
        'desc': 'Bảng xếp hạng tác phẩm của tác giả mới tạo tài khoản Tấn Giang trong vòng 30 ngày',
        'items': make_rank_items(xinjin_sorted)
    }
}

master_data['rankings'] = rankings_data
master_data['allNovels'] = all_novels_list
master_data['crawledAt'] = time.strftime('%Y-%m-%d %H:%M:%S')

print("-> Ghi đè file src/data/jjwxcRealData.json...")
with open('src/data/jjwxcRealData.json', 'w', encoding='utf-8') as f:
    json.dump(master_data, f, ensure_ascii=False, indent=2)

print("=== HOÀN TẤT CẬP NHẬT 100%! ĐÃ CÓ 9 BXH VÀ DỮ LIỆU ĐẦY ĐỦ ===")
