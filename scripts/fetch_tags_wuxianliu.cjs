const fs = require('fs');
const path = require('path');

const wuxianliuPath = path.join(__dirname, '../src/data/jjwxcWuxianliuRankingsData.json');
const tagsMapPath = path.join(__dirname, '../src/data/novelTagsRealMap.json');

async function main() {
  const data = JSON.parse(fs.readFileSync(wuxianliuPath, 'utf-8'));
  const allNovelIds = new Set();
  for (const key of Object.keys(data.rankings)) {
    data.rankings[key].items.forEach(i => allNovelIds.add(i.novelId));
  }

  let tagsMap = {};
  if (fs.existsSync(tagsMapPath)) {
    try {
      tagsMap = JSON.parse(fs.readFileSync(tagsMapPath, 'utf-8'));
    } catch (e) {}
  }

  const idsToFetch = Array.from(allNovelIds).filter(id => !tagsMap[id]);
  console.log(`Cần nạp tag cho ${idsToFetch.length} truyện (đã có ${Object.keys(tagsMap).length})...`);

  const CHUNK_SIZE = 12;
  for (let i = 0; i < idsToFetch.length; i += CHUNK_SIZE) {
    const chunk = idsToFetch.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map(async (novelId) => {
      try {
        const res = await fetch(`https://app.jjwxc.net/androidapi/novelbasicinfo?novelId=${novelId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          const json = await res.json();
          if (json && json.novelTags) {
            const rawTags = json.novelTags.split(',').map(t => t.trim()).filter(Boolean);
            if (rawTags.length > 0) {
              tagsMap[novelId] = rawTags;
            }
          }
        }
      } catch (e) {}
    }));

    if ((i + chunk.length) % 60 === 0 || i + chunk.length >= idsToFetch.length) {
      console.log(`Đã xử lý ${i + chunk.length}/${idsToFetch.length}`);
    }
    await new Promise(r => setTimeout(r, 100));
  }

  fs.writeFileSync(tagsMapPath, JSON.stringify(tagsMap, null, 2), 'utf-8');

  // Gán tags vào jjwxcWuxianliuRankingsData.json
  for (const key of Object.keys(data.rankings)) {
    data.rankings[key].items.forEach(item => {
      if (tagsMap[item.novelId]) {
        item.tags = tagsMap[item.novelId];
      }
    });
  }

  fs.writeFileSync(wuxianliuPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('✅ Hoàn tất nạp tags cho toàn bộ truyện!');
}

main();
