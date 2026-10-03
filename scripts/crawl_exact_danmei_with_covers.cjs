const fs = require('fs');
const path = require('path');

const RANKING_CONFIGS = [
  {
    id: 'zongfen',
    name: '总分排行榜',
    nameViGuide: 'Top Mọi Thời Đại',
    fullName: '总分排行榜 (Bảng tổng điểm tích lũy lịch sử)',
    desc: 'Bảng xếp hạng tổng điểm tích lũy Đam Mỹ cao nhất mọi thời đại trong lịch sử Tấn Giang',
    channel: '纯爱 (Only Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=7&t=1',
    limit: 200
  },
  {
    id: 'bawang',
    name: '霸王票总榜',
    nameViGuide: 'Được Yêu Thích Nhất',
    fullName: '霸王票总榜 (Top ủng hộ ném mìn / đại pháo)',
    desc: 'Bảng xếp hạng truyện Đam Mỹ được độc giả bỏ tiền thật ném mìn, đại pháo ủng hộ nhiều nhất',
    channel: '纯爱 (Only Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=13&t=1',
    limit: 100
  },
  {
    id: 'wanjie',
    name: '完结金榜',
    nameViGuide: 'Truyện Đã Hoàn',
    fullName: '完结金榜 (Top truyện hoàn thành bán chạy 30 ngày)',
    desc: 'Bảng xếp hạng truyện Đam Mỹ đã hoàn thành bán chạy nhất trong 30 ngày qua trên Tấn Giang',
    channel: '纯爱 (Only Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=16&t=1',
    limit: 100
  },
  {
    id: 'vip',
    name: 'VIP金榜',
    nameViGuide: 'Bán Chạy Tuần',
    fullName: 'VIP金榜 (Top truyện VIP bán chạy)',
    desc: 'Bảng xếp hạng truyện Đam Mỹ VIP bán chạy nhất trên Tấn Giang',
    channel: '纯爱 (Only Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=2&t=1',
    limit: 100
  },
  {
    id: 'yuedu',
    name: '月度排行榜',
    nameViGuide: 'Bảng Xếp Hạng Tháng',
    fullName: '月度排行榜 (Top truyện nổi bật theo tháng)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ mới nổi bật nhất đăng tải từ 11 đến 40 ngày',
    channel: '纯爱 (Only Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=5&t=1',
    limit: 100
  },
  {
    id: 'jidu',
    name: '季度排行榜',
    nameViGuide: 'Bảng Xếp Hạng Quý',
    fullName: '季度排行榜 (Top truyện nổi bật theo quý)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ nổi bật đăng tải từ 41 đến 130 ngày trên Tấn Giang',
    channel: '纯爱 (Only Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=4&t=1',
    limit: 100
  },
  {
    id: 'bannian',
    name: '半年排行榜',
    nameViGuide: 'Bảng Xếp Hạng Nửa Năm',
    fullName: '半年排行榜 (Top truyện nổi bật nửa năm)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ duy trì độ hot hàng đầu trong nửa năm qua',
    channel: '纯爱 (Only Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=6&t=1',
    limit: 100
  },
  {
    id: 'xinjin',
    name: '新晋作者榜',
    nameViGuide: 'Tác Giả Mới',
    fullName: '新晋作者榜 (Cây bút mới triển vọng)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ của tác giả mới tạo tài khoản trong vòng 30 ngày',
    channel: '纯爱 (Only Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=3&t=1',
    limit: 100
  }
];

const COVERS_DIR = path.join(__dirname, 'public', 'covers');
if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.jjwxc.net/'
      }
    });
    if (res.ok) {
      const buf = await res.arrayBuffer();
      return new TextDecoder('gb18030').decode(buf);
    }
  } catch (e) {
    console.error(`Lỗi fetch ${url}:`, e.message);
  }
  return null;
}

function parseDanmeiTable(html, limit = 100) {
  if (!html) return [];
  const trMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  const list = [];
  const seenIds = new Set();

  for (const tr of trMatches) {
    if (!tr.includes('onebook.php?novelid=')) continue;

    const novelLinkM = tr.match(/<a[^>]+href=[\"'][^\"']*onebook\.php\?novelid=(\d+)[^\"']*[\"'][^>]*>([\s\S]*?)<\/a>/i);
    const authorLinkM = tr.match(/<a[^>]+href=[\"'][^\"']*oneauthor\.php\?authorid=(\d+)[^\"']*[\"'][^>]*>([\s\S]*?)<\/a>/i);
    if (!novelLinkM) continue;

    const novelId = novelLinkM[1].trim();
    if (seenIds.has(novelId)) continue;

    // Tách tên truyện thật sạch sẽ (loại bỏ tooltip văn án nếu có)
    let rawTitle = novelLinkM[2].replace(/<[^>]+>/g, '').trim();
    let title = rawTitle;
    if (rawTitle.includes('\n') || rawTitle.length > 50) {
      // Nếu tên bị dính văn án tooltip, tìm đoạn tên ngắn phía sau dấu đóng ngoặc hoặc lấy dòng cuối
      const parts = rawTitle.split(/\n+/).map(p => p.trim()).filter(Boolean);
      title = parts[parts.length - 1] || parts[0];
      if (title.length > 30) {
        title = title.substring(0, 30);
      }
    }

    let author = authorLinkM ? authorLinkM[2].replace(/<[^>]+>/g, '').trim() : '';

    // Lấy các ô dữ liệu td
    const tds = (tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map(td => td.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim());

    // Kiểm tra thể loại: tuyệt đối loại bỏ ngôn tình
    const genre = tds[3] || '原创-纯爱';
    if (genre.includes('言情')) continue;

    const status = tds[4] || (tr.includes('完结') ? '完结' : '连载');
    const wordCount = tds[5] ? tds[5].replace(/\D/g, '') : '';
    const score = tds[6] ? tds[6].replace(/\s+/g, '') : '';
    const publishDate = tds[7] || '';

    // Lấy văn án tooltip nếu có
    const tooltipM = tr.match(/class=[\"']tooltip[\"'][^>]*>([\s\S]*?)<\/a>/i) || tr.match(/title=[\"']([^\"']+)[\"']/i);
    let intro = tooltipM ? tooltipM[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() : '';
    if (intro.length > 400) intro = intro.substring(0, 400) + '...';

    seenIds.add(novelId);
    list.push({
      rank: list.length + 1,
      novelId,
      title,
      author: author || 'Tấn Giang',
      genre,
      status: status.includes('完结') ? '完结' : '连载',
      wordCount: wordCount ? Number(wordCount).toLocaleString('en-US') : '',
      score: score ? Number(score).toLocaleString('en-US') : '',
      publishDate,
      intro,
      coverUrl: '',
      jjwxcUrl: `https://www.jjwxc.net/onebook.php?novelid=${novelId}`
    });

    if (list.length >= limit) break;
  }

  return list;
}

// Hàm lấy thông tin và ảnh bìa thật 100% từ JJWXC Android API
async function fetchAndSaveRealCover(novelId) {
  try {
    const res = await fetch(`https://app.jjwxc.net/androidapi/novelbasicinfo?novelId=${novelId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) return null;
    const data = await res.json();
    let coverUrl = data.novelCover || data.originalCover || '';
    if (coverUrl.startsWith('//')) coverUrl = 'https:' + coverUrl;
    else if (coverUrl.startsWith('http://')) coverUrl = 'https://' + coverUrl.slice(7);

    let intro = data.novelIntro ? data.novelIntro.replace(/&lt;br\s*\/?&gt;|<br\s*\/?>/gi, '\n').replace(/&nbsp;/gi, ' ').replace(/<[^>]+>/g, '').trim() : '';

    // Tải ảnh bìa về lưu đĩa public/covers/${novelId}.jpg nếu có coverUrl
    if (coverUrl && coverUrl.startsWith('http')) {
      const imgRes = await fetch(coverUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': coverUrl.includes('sinaimg.cn') ? 'https://weibo.com' : 'https://www.jjwxc.net/'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (imgRes.ok) {
        const buf = Buffer.from(await imgRes.arrayBuffer());
        if (buf.length > 500) {
          const targetPath = path.join(COVERS_DIR, `${novelId}.jpg`);
          fs.writeFileSync(targetPath, buf);
        }
      }
    }

    return {
      novelId,
      authorName: data.authorName,
      novelName: data.novelName,
      coverUrl,
      intro
    };
  } catch (e) {
    // bỏ qua lỗi
    return null;
  }
}

async function run() {
  console.log('🚀 Bắt đầu cào 100% ONLY ĐAM MỸ với tham số t=1...');

  const finalRankings = {};
  const allUniqueNovels = new Map();

  for (const cfg of RANKING_CONFIGS) {
    console.log(`\n⏳ Đang cào ${cfg.fullName} [${cfg.url}]...`);
    const html = await fetchHtml(cfg.url);
    const items = parseDanmeiTable(html, cfg.limit);
    console.log(`-> Tìm thấy ${items.length} truyện Đam Mỹ hợp lệ!`);

    finalRankings[cfg.id] = {
      id: cfg.id,
      name: cfg.name,
      fullName: cfg.fullName,
      desc: cfg.desc,
      channel: cfg.channel,
      items
    };

    items.forEach(it => {
      if (!allUniqueNovels.has(it.novelId)) {
        allUniqueNovels.set(it.novelId, it);
      }
    });
  }

  console.log(`\n📦 Tổng cộng có ${allUniqueNovels.size} tác phẩm Đam Mỹ độc nhất. Đang cập nhật ảnh bìa thật và thông tin từ Android API...`);

  const uniqueIds = Array.from(allUniqueNovels.keys());
  const BATCH_SIZE = 25;
  let downloadedCount = 0;

  for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
    const chunk = uniqueIds.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(chunk.map(id => fetchAndSaveRealCover(id)));

    results.forEach(res => {
      if (res) {
        const novel = allUniqueNovels.get(res.novelId);
        if (novel) {
          if (res.authorName) novel.author = res.authorName;
          if (res.novelName && res.novelName.length < 50) novel.title = res.novelName;
          if (res.coverUrl) {
            novel.coverUrl = res.coverUrl;
            downloadedCount++;
          }
          if (res.intro && res.intro.length > 20) {
            novel.intro = res.intro.substring(0, 300) + '...';
          }
        }
      }
    });

    process.stdout.write(`\r-> Đã xử lý: ${Math.min(i + BATCH_SIZE, uniqueIds.length)} / ${uniqueIds.length} truyện (Tải được: ${downloadedCount} bìa thật)...`);
  }

  // Đồng bộ lại vào finalRankings
  for (const k in finalRankings) {
    for (const item of finalRankings[k].items) {
      const u = allUniqueNovels.get(item.novelId);
      if (u) {
        item.title = u.title;
        item.author = u.author;
        item.coverUrl = u.coverUrl;
        if (u.intro) item.intro = u.intro;
      }
    }
  }

  const outData = {
    crawledAt: new Date().toISOString(),
    source: 'JJWXC Official Topten - 100% ONLY ĐAM MỸ (t=1)',
    totalRankings: Object.keys(finalRankings).length,
    totalItems: uniqueIds.length,
    rankings: finalRankings
  };

  const outFile = path.join(__dirname, 'src', 'data', 'jjwxcRealData.json');
  fs.writeFileSync(outFile, JSON.stringify(outData, null, 2), 'utf-8');
  console.log(`\n\n🎉 HOÀN TẤT THÀNH CÔNG! Đã lưu dữ liệu vào ${outFile}`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
