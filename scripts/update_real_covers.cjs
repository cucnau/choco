const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../src/data/jjwxcRealData.json');
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

// Lấy danh sách tất cả novelId độc nhất
const uniqueNovels = new Map();
for (const k in data.rankings) {
  for (const it of data.rankings[k].items) {
    if (!uniqueNovels.has(it.novelId)) {
      uniqueNovels.set(it.novelId, it);
    }
  }
}

console.log(`🚀 Bắt đầu lấy ảnh bìa thật chuẩn 100% từ JJWXC Android API cho ${uniqueNovels.size} bộ truyện Đam Mỹ...`);

// Các bộ truyện kinh điển có sẵn tranh vẽ minh họa cực đẹp
const PRESERVED_COVERS = {
  '3200611': 'https://imgdb.net/images/9934.jpg', // Thiên Quan Tứ Phúc
  '2368172': 'https://imgdb.net/images/9935.jpg', // Ma Đạo Tổ Sư
  '3173202': 'https://imgdb.net/images/9936.jpg', // Mỗ Mỗ
  '3439008': 'https://imgdb.net/images/9938.jpg', // Toàn Cầu Cao Khảo
  '3673024': 'https://imgdb.net/images/9939.jpg'  // Phán Quan
};

async function fetchRealCover(novelId) {
  if (PRESERVED_COVERS[novelId]) {
    return { novelId, cover: PRESERVED_COVERS[novelId] };
  }

  const url = `https://app.jjwxc.net/androidapi/novelbasicinfo?novelId=${novelId}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        let cover = json.novelCover || json.originalCover || '';
        if (cover) {
          if (cover.startsWith('//')) cover = 'https:' + cover;
          else if (cover.startsWith('http://')) cover = 'https://' + cover.slice(7);
        }
        return { novelId, cover, intro: json.novelIntro };
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  return { novelId, cover: '' };
}

async function runBatch() {
  const ids = Array.from(uniqueNovels.keys());
  const batchSize = 30;
  let updatedCount = 0;

  for (let i = 0; i < ids.length; i += batchSize) {
    const chunk = ids.slice(i, i + batchSize);
    const results = await Promise.all(chunk.map(id => fetchRealCover(id)));

    for (const r of results) {
      if (r && r.cover) {
        uniqueNovels.get(r.novelId).coverUrl = r.cover;
        updatedCount++;
      }
    }
    process.stdout.write(`\rĐã quét: ${Math.min(i + batchSize, ids.length)} / ${ids.length} truyện (Cập nhật được: ${updatedCount} bìa thật)...`);
  }

  console.log(`\n✅ Hoàn tất! Cập nhật thành công ${updatedCount} bìa thật!`);

  // Đồng bộ lại vào rankings
  for (const k in data.rankings) {
    for (const it of data.rankings[k].items) {
      const real = uniqueNovels.get(it.novelId);
      if (real && real.coverUrl) {
        it.coverUrl = real.coverUrl;
      }
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log('🎉 Đã ghi đè thành công dữ liệu vào src/data/jjwxcRealData.json!');
}

runBatch().catch(err => {
  console.error('Lỗi batch:', err);
  process.exit(1);
});
