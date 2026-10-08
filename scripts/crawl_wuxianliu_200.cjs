const fs = require('fs');
const path = require('path');

const SORT_CRITERIA_LIST = [
  {
    id: 'score',
    sortType: '2',
    name: 'Điểm tích lũy',
    nameZh: '积分',
    desc: 'Bảng xếp hạng Vô Hạn Lưu xếp theo điểm tích lũy (tích phân) cao nhất lịch sử trên Tấn Giang',
    metricLabel: 'Điểm tích lũy'
  },
  {
    id: 'latest_update',
    sortType: '1',
    name: 'Mới cập nhật',
    nameZh: '最近更新',
    desc: 'Bảng xếp hạng Vô Hạn Lưu cập nhật theo thời gian ra chương mới nhất gần đây',
    metricLabel: 'Cập nhật'
  },
  {
    id: 'latest_publish',
    sortType: '3',
    name: 'Mới đăng tải',
    nameZh: '最新发表',
    desc: 'Bảng xếp hạng Vô Hạn Lưu mới ra mắt, sắp xếp theo thời gian đăng tải / phát hành tác phẩm',
    metricLabel: 'Ngày đăng tải'
  },
  {
    id: 'word_count',
    sortType: '5',
    name: 'Số chữ',
    nameZh: '字数',
    desc: 'Bảng xếp hạng Vô Hạn Lưu đồ sộ nhất, sắp xếp từ số lượng chữ nhiều nhất đến ít nhất',
    metricLabel: 'Số chữ'
  },
  {
    id: 'favorites',
    sortType: '4',
    name: 'Lượt lưu truyện',
    nameZh: '收藏数',
    desc: 'Bảng xếp hạng Vô Hạn Lưu được độc giả lưu vào giá sách (收藏) nhiều nhất trên Tấn Giang',
    metricLabel: 'Lượt lưu truyện'
  },
  {
    id: 'completed_high_score',
    sortType: '10',
    name: 'Hoàn thành điểm cao',
    nameZh: '完结高分',
    desc: 'Bảng xếp hạng các tác phẩm Vô Hạn Lưu đã hoàn thành trọn vẹn và đạt điểm số đánh giá cao nhất',
    metricLabel: 'Điểm đánh giá'
  }
];

const COVERS_MAP_PATH = path.join(__dirname, '../src/data/novelCoversRealMap.json');
let coversMap = {};
if (fs.existsSync(COVERS_MAP_PATH)) {
  try {
    coversMap = JSON.parse(fs.readFileSync(COVERS_MAP_PATH, 'utf-8'));
  } catch (e) {}
}

async function fetchAssortPage(sortType, page, retries = 3) {
  const url = `https://m.jjwxc.net/assort?xx2=2&bq=83&sortType=${sortType}&page=${page}`;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
          'Referer': 'https://m.jjwxc.net/'
        },
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const text = new TextDecoder('gb18030').decode(buf);
        return text;
      }
    } catch (e) {
      console.warn(`Lỗi fetch ${url} (lần ${i + 1}):`, e.message);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

function parseAssortHtml(html, startRank = 1) {
  if (!html) return [];
  // Regex bóc tách danh sách truyện:
  // <tr><td>《<a ... href="/book2/(\d+)">TITLE</a>》 --- <a href="/wapauthor/(\d+)">AUTHOR</a></td></tr>
  const rowRegex = /href=[\"']\/book2\/(\d+)[\"'][^>]*>([^<]+)<\/a>》\s*---\s*<a\s+href=[\"']\/wapauthor\/(\d+)[\"'][^>]*>([^<]+)<\/a>/gi;
  const list = [];
  let m;
  let currentRank = startRank;

  while ((m = rowRegex.exec(html)) !== null) {
    const novelId = m[1].trim();
    const title = m[2].trim();
    const authorId = m[3].trim();
    const author = m[4].trim();

    list.push({
      rank: currentRank++,
      novelId,
      title,
      author,
      authorId,
      genre: '原创-纯爱-无限流',
      status: '连载',
      wordCount: '',
      score: '',
      intro: '',
      coverUrl: coversMap[novelId] || `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`,
      jjwxcUrl: `https://www.jjwxc.net/onebook.php?novelid=${novelId}`
    });
  }

  return list;
}

async function fetchNovelBasicInfo(novelId) {
  try {
    const res = await fetch(`https://app.jjwxc.net/androidapi/novelbasicinfo?novelId=${novelId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 12)' },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('🚀 Bắt đầu crawl BXH Vô Hạn Lưu (200 truyện x 6 tiêu chí Tấn Giang)...');
  const result = {
    metadata: {
      tag: '无限流',
      tagVi: 'Vô hạn lưu',
      bq: '83',
      channelId: '2',
      crawledAt: new Date().toISOString(),
      source: '晋江文学城 (jjwxc.net)',
      totalCriteria: SORT_CRITERIA_LIST.length
    },
    rankings: {}
  };

  const allNovelIds = new Set();
  const novelDetailsMap = new Map();

  for (const criterion of SORT_CRITERIA_LIST) {
    console.log(`\n📌 Đang cào tiêu chí: ${criterion.name} (${criterion.nameZh}) - sortType: ${criterion.sortType}...`);
    
    // Page 1: 1 - 100
    const htmlPage1 = await fetchAssortPage(criterion.sortType, 1);
    const itemsPage1 = parseAssortHtml(htmlPage1, 1);
    console.log(`   + Trang 1: Bóc được ${itemsPage1.length} truyện`);

    // Page 2: 101 - 200
    await new Promise(r => setTimeout(r, 600));
    const htmlPage2 = await fetchAssortPage(criterion.sortType, 2);
    const itemsPage2 = parseAssortHtml(htmlPage2, 101);
    console.log(`   + Trang 2: Bóc được ${itemsPage2.length} truyện`);

    const fullItems = [...itemsPage1, ...itemsPage2].slice(0, 200);
    console.log(`   => Tổng tiêu chí "${criterion.name}": ${fullItems.length}/200 truyện`);

    fullItems.forEach(item => allNovelIds.add(item.novelId));

    result.rankings[criterion.id] = {
      id: criterion.id,
      sortType: criterion.sortType,
      name: criterion.name,
      nameZh: criterion.nameZh,
      desc: criterion.desc,
      metricLabel: criterion.metricLabel,
      total: fullItems.length,
      items: fullItems
    };
  }

  console.log(`\n📚 Tổng số tiểu thuyết Vô Hạn Lưu thu thập được: ${allNovelIds.size} truyện duy nhất.`);
  console.log('⚡ Tiến hành bổ sung bìa và văn án chi tiết cho top truyện...');

  // Bổ sung chi tiết cho các truyện (ưu tiên top 50 mỗi bảng)
  const priorityIds = new Set();
  for (const criterion of SORT_CRITERIA_LIST) {
    result.rankings[criterion.id].items.slice(0, 40).forEach(i => priorityIds.add(i.novelId));
  }
  console.log(`🎯 Số truyện ưu tiên cập nhật chi tiết cao: ${priorityIds.size}`);

  let processedCount = 0;
  const idArray = Array.from(priorityIds);
  const CHUNK_SIZE = 5;

  for (let i = 0; i < idArray.length; i += CHUNK_SIZE) {
    const chunk = idArray.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map(async (novelId) => {
      const info = await fetchNovelBasicInfo(novelId);
      if (info) {
        let cover = info.novelCover || info.originalCover || '';
        if (cover.startsWith('//')) cover = 'https:' + cover;
        else if (cover.startsWith('http://')) cover = 'https://' + cover.slice(7);
        if (cover) coversMap[novelId] = cover;

        let intro = info.novelIntro ? info.novelIntro.replace(/&lt;br\s*\/?&gt;|<br\s*\/?>/gi, '\n').replace(/&nbsp;/gi, ' ').replace(/<[^>]+>/g, '').trim() : '';

        novelDetailsMap.set(novelId, {
          coverUrl: cover || coversMap[novelId] || `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`,
          intro: intro,
          wordCount: info.novelSize || (info.novelsizeformat ? info.novelsizeformat : ''),
          score: info.novelScore || '',
          favorites: info.novelbefavoritedcount || info.novelbefavoritedcountformat || '',
          reviewScore: info.novelReviewScore || '',
          status: info.novelStep === '2' ? '完结' : '连载',
          genre: info.novelClass || '原创-纯爱-无限流'
        });
      }
    }));

    processedCount += chunk.length;
    if (processedCount % 20 === 0 || processedCount >= idArray.length) {
      console.log(`   Đã nạp chi tiết: ${processedCount}/${idArray.length}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  // Gắn ngược lại thông tin đã làm giàu vào các items của từng tiêu chí
  for (const criterion of SORT_CRITERIA_LIST) {
    result.rankings[criterion.id].items = result.rankings[criterion.id].items.map(item => {
      const details = novelDetailsMap.get(item.novelId);
      if (details) {
        return {
          ...item,
          coverUrl: details.coverUrl || item.coverUrl,
          intro: details.intro || item.intro,
          wordCount: details.wordCount || item.wordCount,
          score: details.score || item.score,
          status: details.status || item.status,
          genre: details.genre || item.genre
        };
      }
      return item;
    });
  }

  // Lưu file JSON
  const outputPath = path.join(__dirname, '../src/data/jjwxcWuxianliuRankingsData.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n✅ Đã lưu dữ liệu hoàn chỉnh vào ${outputPath}`);

  // Lưu lại cover map cập nhật
  fs.writeFileSync(COVERS_MAP_PATH, JSON.stringify(coversMap, null, 2), 'utf-8');
  console.log('✅ Đã cập nhật novelCoversRealMap.json!');
}

main().catch(err => {
  console.error('Lỗi nghiêm trọng:', err);
  process.exit(1);
});
