const fs = require('fs');
const path = require('path');

// Định nghĩa 8 BXH ONLY ĐAM MỸ (Thuần Ái) của Tấn Giang
const DANMEI_RANKINGS = [
  {
    id: 'zongfen',
    name: '总分排行榜',
    fullName: '总分排行榜 (Bảng tổng điểm tích lũy lịch sử)',
    desc: 'Bảng xếp hạng tổng điểm tích lũy Đam Mỹ cao nhất mọi thời đại trong lịch sử Tấn Giang',
    channel: '纯爱 (Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=7&t=2',
    sortCriteria: 'Xếp hạng từ cao xuống thấp theo Tổng điểm tích lũy Đam Mỹ',
    metricLabel: 'Tổng điểm tích lũy'
  },
  {
    id: 'bawang',
    name: '霸王票总榜',
    fullName: '霸王票总榜 (Top ủng hộ ném mìn / đại pháo)',
    desc: 'Bảng xếp hạng truyện Đam Mỹ được độc giả bỏ tiền thật ném mìn, đại pháo ủng hộ nhiều nhất',
    channel: '纯爱 (Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=13&t=2',
    sortCriteria: 'Xếp hạng theo Tổng số Bá Vương Phiếu (ném mìn / đại pháo bằng tiền thật)',
    metricLabel: 'Điểm tích lũy (Xếp theo Bá Vương Phiếu)'
  },
  {
    id: 'wanjie_jinbang',
    name: '完结金榜',
    fullName: '完结金榜 (Top truyện hoàn thành bán chạy 30 ngày)',
    desc: 'Bảng xếp hạng truyện Đam Mỹ đã hoàn thành bán chạy nhất trong 30 ngày qua trên Tấn Giang',
    channel: '纯爱 (Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=20',
    fallbackFilter: 'completed',
    sortCriteria: 'Xếp hạng theo Doanh thu bán chương VIP 30 ngày của truyện Đam Mỹ đã hoàn',
    metricLabel: 'Điểm tích lũy (Xếp theo Doanh thu hoàn)'
  },
  {
    id: 'vip_jinbang',
    name: 'VIP金榜',
    fullName: 'VIP金榜 (Top truyện VIP bán chạy)',
    desc: 'Bảng xếp hạng truyện Đam Mỹ VIP bán chạy nhất trên Tấn Giang',
    channel: '纯爱 (Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=4&t=2',
    sortCriteria: 'Xếp hạng theo Doanh thu bán chương VIP trong tuần của truyện Đam Mỹ',
    metricLabel: 'Điểm tích lũy (Xếp theo Doanh thu VIP)'
  },
  {
    id: 'yuedu',
    name: '月度排行榜',
    fullName: '月度排行榜 (Top truyện nổi bật theo tháng)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ mới nổi bật nhất đăng tải từ 11 đến 40 ngày',
    channel: '纯爱 (Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=5&t=2',
    sortCriteria: 'Xếp hạng theo Điểm tổng hợp tác phẩm Đam Mỹ mới (11-40 ngày)',
    metricLabel: 'Điểm tích lũy (Xếp theo Top Tháng)'
  },
  {
    id: 'jidu',
    name: '季度排行榜',
    fullName: '季度排行榜 (Top truyện nổi bật theo quý)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ nổi bật đăng tải từ 41 đến 130 ngày trên Tấn Giang',
    channel: '纯爱 (Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=4&t=2',
    sortCriteria: 'Xếp hạng theo Điểm tổng hợp tác phẩm Đam Mỹ mới (41-130 ngày)',
    metricLabel: 'Điểm tích lũy (Xếp theo Top Quý)'
  },
  {
    id: 'bannian',
    name: '半年排行榜',
    fullName: '半年排行榜 (Top truyện nổi bật nửa năm)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ duy trì độ hot hàng đầu trong nửa năm qua',
    channel: '纯爱 (Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=6&t=2',
    sortCriteria: 'Xếp hạng theo Điểm tổng hợp duy trì độ hot Đam Mỹ trong 6 tháng',
    metricLabel: 'Điểm tích lũy (Xếp theo Top Nửa Năm)'
  },
  {
    id: 'xinjin',
    name: '新晋作者榜',
    fullName: '新晋作者榜 (Cây bút mới triển vọng)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ của tác giả mới tạo tài khoản trong vòng 30 ngày',
    channel: '纯爱 (Đam Mỹ)',
    url: 'https://www.jjwxc.net/topten.php?orderstr=3&t=2',
    sortCriteria: 'Xếp hạng theo Điểm tăng trưởng 30 ngày đầu của tác giả mới Đam Mỹ',
    metricLabel: 'Điểm tích lũy (Xếp theo Điểm Tân Tấn)'
  }
];

// Map bìa tranh vẽ đẹp đã lưu để giữ chất lượng cao nhất cho các bộ nổi tiếng
const PRESERVED_COVERS = {
  '3200611': 'https://imgdb.net/images/9934.jpg', // Thiên Quan Tứ Phúc
  '2368172': 'https://imgdb.net/images/9935.jpg', // Ma Đạo Tổ Sư
  '3173202': 'https://imgdb.net/images/9936.jpg', // Mỗ Mỗ
  '3395943': 'https://i9-static.jjwxc.net/novelimage.php?novelid=3395943', // Phá Vân
  '3439008': 'https://imgdb.net/images/9938.jpg', // Toàn Cầu Cao Khảo
  '4218910': 'https://i9-static.jjwxc.net/novelimage.php?novelid=4218910', // Ngã Tại Vô Hạn Du Hí
  '3673024': 'https://imgdb.net/images/9939.jpg', // Phán Quan
  '5637328': 'https://i9-static.jjwxc.net/novelimage.php?novelid=5637328'  // Ma Tôn
};

async function fetchHtmlWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
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
      console.warn(`Lỗi fetch ${url}, thử lại...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

function parseDanmeiOnly(html, maxLimit = 200, mustBeCompleted = false) {
  if (!html) return [];
  const trMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  const items = [];
  const seenIds = new Set();

  for (const tr of trMatches) {
    if (tr.includes('onebook.php?novelid=')) {
      const titleM = tr.match(/<a[^>]+href=[\"'][^\"']*onebook\.php\?novelid=(\d+)[^\"']*[\"'][^>]*>([\s\S]*?)<\/a>/i);
      const authorM = tr.match(/<a[^>]+href=[\"'][^\"']*oneauthor\.php\?authorid=(\d+)[^\"']*[\"'][^>]*>([\s\S]*?)<\/a>/i);
      
      if (titleM && authorM) {
        const novelId = titleM[1];
        if (seenIds.has(novelId)) continue;

        let title = titleM[2].replace(/<[^>]+>/g, '').trim();
        let author = authorM[2].replace(/<[^>]+>/g, '').trim();

        // Lấy tất cả ô dữ liệu
        const cells = (tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [])
          .map(c => c.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim());

        const genre = cells[3] || '';
        
        // 🔒 ĐIỀU KIỆN TIÊN QUYẾT: CHỈ LẤY ĐAM MỸ / THUẦN ÁI (纯爱 / 耽美)!
        // TUYỆT ĐỐI LOẠI BỎ NGÔN TÌNH (言情), BÁCH HỢP (百合), VÔ CP (无CP)
        const isDanmei = (genre.includes('纯爱') || genre.includes('耽美')) && !genre.includes('言情');
        if (!isDanmei) {
          continue;
        }

        const status = cells[4] || '完结';
        if (mustBeCompleted && !status.includes('完结')) {
          continue;
        }

        let wordCount = cells[5] || '';
        const wcMatch = wordCount.match(/\d+/);
        if (wcMatch) wordCount = wcMatch[0];

        let score = cells[6] || '';
        score = score.replace(/&nbsp;/g, '').trim();

        const publishDate = cells[7] || '';

        // Văn án tóm tắt
        const introM = tr.match(/class=[\"']tooltip[\"'][^>]*>([\s\S]*?)<\/a>/i) || tr.match(/title=[\"']([^\"']+)[\"']/i);
        let intro = introM ? introM[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() : '';
        if (intro.length > 300) intro = intro.substring(0, 300) + '...';

        let coverUrl = PRESERVED_COVERS[novelId] || `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;

        seenIds.add(novelId);
        items.push({
          rank: items.length + 1,
          novelId,
          title,
          author,
          genre,
          status,
          wordCount,
          score,
          publishDate,
          intro,
          coverUrl,
          jjwxcUrl: `https://www.jjwxc.net/onebook.php?novelid=${novelId}`
        });

        if (items.length >= maxLimit) break;
      }
    }
  }

  return items;
}

async function main() {
  console.log('🚀 Bắt đầu cào toàn bộ BXH Tấn Giang: 100% ONLY ĐAM MỸ (THUẦN ÁI)...');

  const resultRankings = {};
  let totalDanmeiNovels = 0;

  for (const config of DANMEI_RANKINGS) {
    console.log(`\n⏳ Đang cào ${config.fullName}...`);
    const html = await fetchHtmlWithRetry(config.url);
    const mustBeCompleted = config.id === 'wanjie_jinbang';
    const limit = config.id === 'xinjin' ? 100 : 200;
    
    let items = parseDanmeiOnly(html, limit, mustBeCompleted);

    // Nếu bảng hoàn kết kim bảng từ orderstr=20 cần bổ sung thêm các truyện hoàn từ orderstr=7 & orderstr=6
    if (config.id === 'wanjie_jinbang' && items.length < 50) {
      console.log('Bổ sung thêm truyện hoàn từ các bảng Đam Mỹ...');
      const extraUrls = [
        'https://www.jjwxc.net/topten.php?orderstr=6&t=2',
        'https://www.jjwxc.net/topten.php?orderstr=7&t=2',
        'https://www.jjwxc.net/topten.php?orderstr=4&t=2'
      ];
      for (const eu of extraUrls) {
        if (items.length >= 100) break;
        const eHtml = await fetchHtmlWithRetry(eu);
        const eItems = parseDanmeiOnly(eHtml, 100, true);
        const existingIds = new Set(items.map(it => it.novelId));
        for (const e of eItems) {
          if (!existingIds.has(e.novelId)) {
            existingIds.add(e.novelId);
            e.rank = items.length + 1;
            items.push(e);
          }
        }
      }
    }

    console.log(`✅ ${config.name}: Lấy thành công ${items.length} truyện Đam Mỹ! (Top 1: ${items[0]?.title})`);
    
    resultRankings[config.id] = {
      id: config.id,
      name: config.name,
      fullName: config.fullName,
      desc: config.desc,
      channel: config.channel,
      items: items
    };

    totalDanmeiNovels += items.length;
  }

  const outputPath = path.join(__dirname, '../src/data/jjwxcRealData.json');
  const finalOutput = {
    crawledAt: new Date().toISOString(),
    source: 'JJWXC Official Topten - 100% ONLY ĐAM MỸ (THUẦN ÁI)',
    totalRankings: Object.keys(resultRankings).length,
    totalItems: totalDanmeiNovels,
    rankings: resultRankings
  };

  fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2), 'utf-8');
  console.log(`\n🎉 HOÀN TẤT 100%! Đã lưu ${totalDanmeiNovels} tác phẩm ONLY ĐAM MỸ vào ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
