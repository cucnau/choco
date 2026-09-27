import urllib.request
import re
import json
import time
import socket
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

socket.setdefaulttimeout(10)

api_headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
}

print("=== BẮT ĐẦU CẬP NHẬT BÌA GỐC TÁC GIẢ & TRẠNG THÁI THỜI GIAN THỰC ===")

with open('src/data/jjwxcRealData.json', 'r', encoding='utf-8') as f:
    master_data = json.load(f)

all_novels_map = {str(n['novelId']): n for n in master_data.get('allNovels', [])}

# Gom toàn bộ novelId hiện có trong file để kiểm tra và cập nhật lại bìa gốc
target_nids = set(all_novels_map.keys())

for tag_id, items in master_data.get('tagRankings', {}).items():
    for item in items:
        target_nids.add(str(item['novelId']))

for rk_id, rank_obj in master_data.get('rankings', {}).items():
    for item in rank_obj.get('items', []):
        target_nids.add(str(item['novelId']))

target_nids_list = list(target_nids)
print(f"-> Tổng cộng có {len(target_nids_list)} truyện sẽ được nạp lại bìa gốc và trạng thái thực.")

def fetch_live_cover_and_status(nid):
    api_url = f'https://app.jjwxc.net/androidapi/novelbasicinfo?novelId={nid}'
    for attempt in range(2):
        try:
            req = urllib.request.Request(api_url, headers=api_headers)
            with urllib.request.urlopen(req, timeout=8) as res:
                data = json.loads(res.read().decode('utf-8', errors='ignore'))

            # 1. Trạng thái thực
            step = str(data.get('novelStep', '1'))
            status = '完结' if step == '2' else ('暂停' if step == '3' else '连载')

            # 2. Bìa gốc tác giả (kèm coverid)
            cover_url = data.get('novelCover', '').strip()
            is_author_cover = False

            if cover_url:
                if cover_url.startswith('//'): cover_url = 'https:' + cover_url
                elif cover_url.startswith('http://'): cover_url = 'https://' + cover_url[7:]
                if any(k in cover_url for k in ['coverid=', 'authorspace', 'sccover', 'authorimagespace', 'sinaimg', 'weibo', 'oss']):
                    is_author_cover = True
            else:
                cover_url = f'https://i9-static.jjwxc.net/novelimage.php?novelid={nid}'

            # 3. Số chữ & Bookmark mới nhất
            word_count = str(data.get('novelSize', ''))
            bookmarks = int(data.get('bfCount', 0) or 0)

            return nid, status, cover_url, is_author_cover, word_count, bookmarks
        except Exception:
            time.sleep(0.3)

    return nid, '', '', False, '', 0

print("-> Đang cập nhật bìa gốc qua API Tấn Giang (30 luồng song song)...")
start_time = time.time()
with ThreadPoolExecutor(max_workers=30) as executor:
    results = list(executor.map(fetch_live_cover_and_status, target_nids_list))

print(f"-> Quét xong trong {time.time() - start_time:.2f}s!")

author_covers_count = 0
status_completed = 0

for nid, status, cover_url, is_author_cover, word_count, bookmarks in results:
    if nid not in all_novels_map:
        continue
    novel = all_novels_map[nid]

    if status:
        novel['status'] = status
        if status == '完结':
            status_completed += 1

    if cover_url:
        novel['coverUrl'] = cover_url
        novel['isAuthorCover'] = is_author_cover
        if is_author_cover:
            author_covers_count += 1

    if word_count:
        novel['wordCount'] = word_count
    if bookmarks:
        novel['bookmarks'] = bookmarks

print(f"  + Số truyện tìm thấy bìa vẽ riêng của tác giả/NXB: {author_covers_count}")
print(f"  + Số truyện đã hoàn thành: {status_completed}")

# Đồng bộ ngược vào tagRankings
for tag_id, items in master_data.get('tagRankings', {}).items():
    for item in items:
        nid = str(item['novelId'])
        if nid in all_novels_map:
            updated = all_novels_map[nid]
            item['status'] = updated.get('status', item.get('status'))
            item['coverUrl'] = updated.get('coverUrl', item.get('coverUrl'))
            item['isAuthorCover'] = updated.get('isAuthorCover', False)
            if updated.get('wordCount'): item['wordCount'] = updated['wordCount']
            if updated.get('bookmarks'): item['bookmarks'] = updated['bookmarks']

# Đồng bộ ngược vào 9 BXH chính
for rk_id, rank_obj in master_data.get('rankings', {}).items():
    for item in rank_obj.get('items', []):
        nid = str(item['novelId'])
        if nid in all_novels_map:
            updated = all_novels_map[nid]
            item['status'] = updated.get('status', item.get('status'))
            item['coverUrl'] = updated.get('coverUrl', item.get('coverUrl'))
            item['isAuthorCover'] = updated.get('isAuthorCover', False)
            if updated.get('wordCount'): item['wordCount'] = updated['wordCount']
            if updated.get('bookmarks'): item['bookmarks'] = updated['bookmarks']

master_data['allNovels'] = list(all_novels_map.values())
master_data['crawledAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

print("-> Ghi đè vào src/data/jjwxcRealData.json...")
with open('src/data/jjwxcRealData.json', 'w', encoding='utf-8') as f:
    json.dump(master_data, f, ensure_ascii=False, indent=2)

print("=== HOÀN TẤT ĐỒNG BỘ 100% BÌA GỐC TÁC GIẢ! ===")