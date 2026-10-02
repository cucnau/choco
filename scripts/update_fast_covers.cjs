const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../src/data/jjwxcRealData.json');
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

// Danh sách các bộ bìa đẹp thủ công cho các bộ kinh điển
const PRESERVED_COVERS = {
  '3200611': 'https://imgdb.net/images/9934.jpg', // Thiên Quan Tứ Phúc
  '2368172': 'https://imgdb.net/images/9935.jpg', // Ma Đạo Tổ Sư
  '3173202': 'https://imgdb.net/images/9936.jpg', // Mỗ Mỗ
  '3439008': 'https://imgdb.net/images/9938.jpg', // Toàn Cầu Cao Khảo
  '3419133': 'https://imgdb.net/images/9938.jpg', // Toàn Cầu Cao Khảo
  '3673024': 'https://imgdb.net/images/9939.jpg', // Phán Quan
  '3395943': 'https://ww3.sinaimg.cn/large/0060lm7Tly1fl8d09bh5dj305k07sabg.jpg', // Phá Vân
  '5484954': 'https://i2-static.jjwxc.net/tmp/backend/authorspace/s1/17/16106/1610599/20251225041434_300_420.jpeg', // Mộng Yểm Trực Bá Gian
  '4404708': 'https://i0-static.jjwxc.net/tmp/backend/authorspace/s1/11/10785/1078407/20220427125004_300_420.jpg', // Ngã Hành Nhượng Ngã Thượng
  '5555568': 'https://i6-static.jjwxc.net/tmp/backend/authorspace/s1/21/20428/2042719/20240606131111_300_420.jpg', // Phóng Học Đẳng Ngã
  '3396832': 'https://i0-static.jjwxc.net/tmp/backend/authorspace/s1/1/96/9599/20210818223611_300_420.jpg', // Vô Hạn Du Lịch Đoàn
  '4218910': 'https://imgdb.net/images/9939.jpg'  // Vô Hạn Du Hí
};

async function fetchOne(nid) {
  if (PRESERVED_COVERS[nid]) return PRESERVED_COVERS[nid];
  try {
    const res = await fetch(`https://app.jjwxc.net/androidapi/novelbasicinfo?novelId=${nid}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const j = await res.json();
      let c = j.novelCover || j.originalCover;
      if (c) {
        if (c.startsWith('//')) c = 'https:' + c;
        else if (c.startsWith('http://')) c = 'https://' + c.slice(7);
        return c;
      }
    }
  } catch (e) {}
  return '';
}

async function main() {
  console.log('🚀 Cập nhật bìa trực tiếp cho toàn bộ truyện...');

  // Lấy tất cả novelId
  const allItems = [];
  for (const k in data.rankings) {
    for (const it of data.rankings[k].items) {
      allItems.push(it);
    }
  }

  // Thu thập unique IDs
  const idMap = new Map();
  allItems.forEach(it => {
    if (!idMap.has(it.novelId)) idMap.set(it.novelId, []);
    idMap.get(it.novelId).push(it);
  });

  const ids = Array.from(idMap.keys());
  console.log(`Tìm thấy ${ids.length} novelId unique.`);

  let updated = 0;
  // Chạy từng đợt 20 id
  for (let i = 0; i < ids.length; i += 20) {
    const batch = ids.slice(i, i + 20);
    const covers = await Promise.all(batch.map(nid => fetchOne(nid)));
    
    batch.forEach((nid, idx) => {
      const c = covers[idx];
      if (c) {
        idMap.get(nid).forEach(item => {
          item.coverUrl = c;
        });
        updated++;
      }
    });

    console.log(`Tiến độ: ${Math.min(i + 20, ids.length)} / ${ids.length} (Đã có: ${updated} bìa thật)`);
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`🎉 HOÀN TẤT! Cập nhật thành công ${updated} bìa truyện thật!`);
}

main().catch(console.error);
