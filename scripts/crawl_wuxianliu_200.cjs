const fs = require('fs');
const path = require('path');

const SORT_CRITERIA_LIST = [
  {
    id: 'score',
    sortType: '2',
    name: 'Điểm tích lũy',
    nameZh: '积分',
    desc: 'Xếp theo tổng điểm tích lũy (tích phân) cao nhất lịch sử trên Tấn Giang',
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

// Lấy map điểm chính xác từ jjwxcRealData.json nếu có
const REAL_DATA_PATH = path.join(__dirname, '../src/data/jjwxcRealData.json');
let exactRealScores = {};
if (fs.existsSync(REAL_DATA_PATH)) {
  try {
    const rd = JSON.parse(fs.readFileSync(REAL_DATA_PATH, 'utf-8'));
    for (const k in rd.rankings) {
      for (const it of rd.rankings[k].items || []) {
        if (it.novelId && it.score && /^[\d,]+$/.test(it.score)) {
          exactRealScores[it.novelId] = it.score;
        }
      }
    }
  } catch (e) {}
}

function formatToFullNumber(val) {
  if (!val) return '';
  const str = String(val).trim();
  if (/^[\d,]+$/.test(str)) {
    const n = Number(str.replace(/,/g, ''));
    return !isNaN(n) && n > 0 ? n.toLocaleString('en-US') : str;
  }
  if (str.includes('亿')) {
    const num = parseFloat(str.replace(/亿/g, '').replace(/,/g, ''));
    if (!isNaN(num)) {
      return Math.round(num * 100_000_000).toLocaleString('en-US');
    }
  }
  if (str.includes('万') || str.toLowerCase().includes('w')) {
    const num = parseFloat(str.replace(/万|w/gi, '').replace(/,/g, ''));
    if (!isNaN(num)) {
      return Math.round(num * 10_000).toLocaleString('en-US');
    }
  }
  return str;
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

// Bóc đúng 50 truyện DUY NHẤT của 1 trang, không bị duplicate do Tấn Giang render 2 table trùng lặp
function parseAssortPage(html) {
  if (!html) return [];
  const rowRegex = /href=[\"']\/book2\/(\d+)[\"'][^>]*>([^<]+)<\/a>》\s*---\s*<a\s+href=[\"']\/wapauthor\/(\d+)[\"'][^>]*>([^<]+)<\/a>/gi;
  const list = [];
  const seenThisPage = new Set();
  let m;

  while ((m = rowRegex.exec(html)) !== null) {
    const novelId = m[1].trim();
    if (!seenThisPage.has(novelId)) {
      seenThisPage.add(novelId);
      list.push({
        novelId,
        title: m[2].trim(),
        authorId: m[3].trim(),
        author: m[4].trim(),
        genre: '原创-纯爱-无限流',
        status: '连载',
        wordCount: '',
        score: '',
        intro: '',
        coverUrl: coversMap[novelId] || `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`,
        jjwxcUrl: `https://www.jjwxc.net/onebook.php?novelid=${novelId}`
      });
    }
  }

  return list;
}

async function fetchNovelBasicInfo(novelId) {
  try {
    const res = await fetch(`https://app.jjwxc.net/androidapi/novelbasicinfo?novelId=${novelId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 12)' },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('🚀 Bắt đầu crawl BXH Vô Hạn Lưu chuẩn xác 200 truyện duy nhất cho 6 tiêu chí...');
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
    
    const criterionItems = [];
    const criterionSeen = new Set();

    // Mỗi trang có 50 truyện -> Cào 4 trang (page 1, 2, 3, 4) để đủ 200 truyện chuẩn
    for (let page = 1; page <= 4; page++) {
      const html = await fetchAssortPage(criterion.sortType, page);
      const items = parseAssortPage(html);
      let added = 0;
      for (const item of items) {
        if (!criterionSeen.has(item.novelId)) {
          criterionSeen.add(item.novelId);
          criterionItems.push({
            ...item,
            rank: criterionItems.length + 1
          });
          allNovelIds.add(item.novelId);
          added++;
        }
      }
      console.log(`   + Trang ${page}: Bóc được ${items.length} truyện (thêm mới: ${added}) -> Tổng tích lũy: ${criterionItems.length}`);
      await new Promise(r => setTimeout(r, 400));
    }

    const final200 = criterionItems.slice(0, 200);
    console.log(`   => Tiêu chí "${criterion.name}": Đủ ${final200.length} truyện duy nhất!`);

    result.rankings[criterion.id] = {
      id: criterion.id,
      sortType: criterion.sortType,
      name: criterion.name,
      nameZh: criterion.nameZh,
      desc: criterion.desc,
      metricLabel: criterion.metricLabel,
      total: final200.length,
      items: final200
    };
  }

  console.log(`\n📚 Tổng cộng thu thập được: ${allNovelIds.size} tiểu thuyết Vô Hạn Lưu duy nhất.`);
  console.log('⚡ Tiến hành nạp ĐẦY ĐỦ THÔNG TIN THẬT & BÌA THẬT 100% cho toàn bộ các truyện...');

  const idArray = Array.from(allNovelIds);
  let processedCount = 0;
  const CHUNK_SIZE = 8; // Batch 8 request đồng thời

  for (let i = 0; i < idArray.length; i += CHUNK_SIZE) {
    const chunk = idArray.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map(async (novelId) => {
      const info = await fetchNovelBasicInfo(novelId);
      if (info) {
        let cover = info.novelCover || info.originalCover || '';
        if (cover.startsWith('//')) cover = 'https:' + cover;
        else if (cover.startsWith('http://')) cover = 'https://' + cover.slice(7);
        if (cover) {
          coversMap[novelId] = cover;
        }

        let intro = info.novelIntro ? info.novelIntro
          .replace(/&lt;br\s*\/?&gt;|<br\s*\/?>/gi, '\n')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&quot;/gi, '"')
          .replace(/&amp;/gi, '&')
          .replace(/<[^>]+>/g, '')
          .trim() : '';

        // Điểm số: ưu tiên lấy điểm chuẩn xác từng đơn vị trực tiếp từ Tấn Giang
        let exactScore = exactRealScores[novelId];
        if (!exactScore) {
          try {
            const bRes = await fetch('https://m.jjwxc.net/book2/' + novelId, {
              headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' },
              signal: AbortSignal.timeout(4000)
            });
            if (bRes.ok) {
              const bBuf = await bRes.arrayBuffer();
              const bText = new TextDecoder('gb18030').decode(bBuf);
              const bM = bText.match(/作品积分[：:\s]*([\d,]+)/);
              if (bM) {
                const n = Number(bM[1].replace(/,/g, ''));
                if (!isNaN(n) && n > 0) exactScore = n.toLocaleString('en-US');
              }
            }
          } catch (e) {}
        }
        let fullScore = exactScore || formatToFullNumber(info.novelScore || '');
        let fullWordCount = formatToFullNumber(info.novelSize || info.novelsizeformat || '');
        let isDone = (info.novelStep === '2' || info.novelStep === 2);

        novelDetailsMap.set(novelId, {
          title: info.novelName || undefined,
          author: info.authorName || undefined,
          coverUrl: cover || coversMap[novelId] || `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`,
          intro: intro,
          wordCount: fullWordCount,
          score: fullScore,
          favorites: formatToFullNumber(info.novelbefavoritedcount || info.novelbefavoritedcountformat || ''),
          reviewScore: info.novelReviewScore || '',
          status: isDone ? '完结' : '连载',
          genre: info.novelClass || '原创-纯爱-无限流'
        });
      }
    }));

    processedCount += chunk.length;
    if (processedCount % 40 === 0 || processedCount >= idArray.length) {
      console.log(`   Đã nạp chi tiết: ${processedCount}/${idArray.length}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('🔄 Đang gắn thông tin đầy đủ vào toàn bộ danh sách 6 tiêu chí...');
  for (const criterion of SORT_CRITERIA_LIST) {
    result.rankings[criterion.id].items = result.rankings[criterion.id].items.map(item => {
      const details = novelDetailsMap.get(item.novelId);
      if (details) {
        return {
          ...item,
          title: details.title || item.title,
          author: details.author || item.author,
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
