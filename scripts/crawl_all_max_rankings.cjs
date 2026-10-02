const fs = require('fs');
const path = require('path');

const RANKINGS_CONFIG = [
  {
    id: 'zongfen',
    orderstr: '3',
    name: '总分排行榜',
    fullName: '总分排行榜 (Bảng tổng điểm tích lũy lịch sử)',
    desc: 'Bảng xếp hạng tổng điểm tích lũy cao nhất mọi thời đại trong lịch sử Tấn Giang',
    channel: '纯爱 / 非言情站',
    sortCriteria: 'Xếp hạng từ cao xuống thấp theo Tổng điểm tích lũy lịch sử',
    metricLabel: 'Tổng điểm tích lũy'
  },
  {
    id: 'bawang',
    orderstr: '7',
    name: '霸王票总榜',
    fullName: '霸王票总榜 (Top ủng hộ ném mìn / đại pháo)',
    desc: 'Bảng xếp hạng truyện được độc giả bỏ tiền thật ném mìn, đại pháo ủng hộ nhiều nhất',
    channel: '纯爱 / 非言情站',
    sortCriteria: 'Xếp hạng theo Tổng số Bá Vương Phiếu (ném mìn / đại pháo bằng tiền thật)',
    metricLabel: 'Điểm tích lũy (Xếp theo Bá Vương Phiếu)'
  },
  {
    id: 'wanjie_jinbang',
    orderstr: '13',
    name: '完结金榜',
    fullName: '完结金榜 (Top truyện hoàn thành bán chạy 30 ngày)',
    desc: 'Bảng xếp hạng truyện đã hoàn thành bán chạy nhất trong 30 ngày qua trên Tấn Giang',
    channel: '纯爱 / 非言情站',
    sortCriteria: 'Xếp hạng theo Doanh thu bán chương VIP 30 ngày của truyện đã hoàn',
    metricLabel: 'Điểm tích lũy (Xếp theo Doanh thu hoàn)'
  },
  {
    id: 'vip_jinbang',
    orderstr: '11',
    name: 'VIP金榜',
    fullName: 'VIP金榜 (Top truyện VIP bán chạy)',
    desc: 'Bảng xếp hạng truyện VIP bán chạy nhất trên Tấn Giang',
    channel: '纯爱 / 非言情站',
    sortCriteria: 'Xếp hạng theo Doanh thu bán chương VIP trong tuần',
    metricLabel: 'Điểm tích lũy (Xếp theo Doanh thu VIP)'
  },
  {
    id: 'yuedu',
    orderstr: '4',
    name: '月度排行榜',
    fullName: '月度排行榜 (Top truyện nổi bật theo tháng)',
    desc: 'Bảng xếp hạng tác phẩm mới nổi bật nhất đăng tải từ 11 đến 40 ngày',
    channel: '纯爱 / 非言情站',
    sortCriteria: 'Xếp hạng theo Điểm tổng hợp tác phẩm mới (11-40 ngày)',
    metricLabel: 'Điểm tích lũy (Xếp theo Top Tháng)'
  },
  {
    id: 'jidu',
    orderstr: '5',
    name: '季度排行榜',
    fullName: '季度排行榜 (Top truyện nổi bật theo quý)',
    desc: 'Bảng xếp hạng tác phẩm nổi bật đăng tải từ 41 đến 130 ngày trên Tấn Giang',
    channel: '纯爱 / 非言情站',
    sortCriteria: 'Xếp hạng theo Điểm tổng hợp tác phẩm mới (41-130 ngày)',
    metricLabel: 'Điểm tích lũy (Xếp theo Top Quý)'
  },
  {
    id: 'bannian',
    orderstr: '6',
    name: '半年排行榜',
    fullName: '半年排行榜 (Top truyện nổi bật nửa năm)',
    desc: 'Bảng xếp hạng tác phẩm duy trì độ hot hàng đầu trong nửa năm qua',
    channel: '纯爱 / 非言情站',
    sortCriteria: 'Xếp hạng theo Điểm tổng hợp duy trì độ hot trong 6 tháng',
    metricLabel: 'Điểm tích lũy (Xếp theo Top Nửa Năm)'
  },
  {
    id: 'xinjin',
    orderstr: '2',
    name: '新晋作者榜',
    fullName: '新晋作者榜 (Cây bút mới triển vọng)',
    desc: 'Bảng xếp hạng tác phẩm của tác giả mới tạo tài khoản trong vòng 30 ngày',
    channel: '纯爱 / 非言情站',
    sortCriteria: 'Xếp hạng theo Điểm tăng trưởng 30 ngày đầu của tác giả mới',
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
      console.warn(`Lỗi fetch ${url}, thử lại lần ${i + 1}...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

function parseToptenHtml(html, categoryId) {
  if (!html) return [];
  const trMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  const items = [];

  for (const tr of trMatches) {
    if (tr.includes('onebook.php?novelid=')) {
      const titleM = tr.match(/<a[^>]+href=[\"'][^\"']*onebook\.php\?novelid=(\d+)[^\"']*[\"'][^>]*>([\s\S]*?)<\/a>/i);
      const authorM = tr.match(/<a[^>]+href=[\"'][^\"']*oneauthor\.php\?authorid=(\d+)[^\"']*[\"'][^>]*>([\s\S]*?)<\/a>/i);
      
      if (titleM && authorM) {
        const novelId = titleM[1];
        let title = titleM[2].replace(/<[^>]+>/g, '').trim();
        let author = authorM[2].replace(/<[^>]+>/g, '').trim();

        // Lấy tất cả ô dữ liệu
        const cells = (tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [])
          .map(c => c.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim());

        const genre = cells[3] || '原创-纯爱';
        const status = cells[4] || '完结';
        
        let wordCount = cells[5] || '';
        const wcMatch = wordCount.match(/\d+/);
        if (wcMatch) wordCount = wcMatch[0];

        let score = cells[6] || '';
        score = score.replace(/&nbsp;/g, '').trim();

        const publishDate = cells[7] || '';

        // Lấy văn án tóm tắt
        const introM = tr.match(/class=[\"']tooltip[\"'][^>]*>([\s\S]*?)<\/a>/i) || tr.match(/title=[\"']([^\"']+)[\"']/i);
        let intro = introM ? introM[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() : '';
        if (intro.length > 300) intro = intro.substring(0, 300) + '...';

        // Bìa chuẩn
        let coverUrl = PRESERVED_COVERS[novelId] || `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;

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
      }
    }
  }

  return items;
}

async function main() {
  console.log('🚀 Bắt đầu cào toàn bộ bảng xếp hạng gốc Tấn Giang với số lượng MAX...');

  const outputPath = path.join(__dirname, '../src/data/jjwxcRealData.json');
  let currentData = {};
  if (fs.existsSync(outputPath)) {
    try {
      currentData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    } catch (e) {}
  }

  const resultRankings = {};
  let totalNovelsAcrossRankings = 0;

  for (const config of RANKINGS_CONFIG) {
    console.log(`\n⏳ Đang cào bảng: ${config.fullName} (orderstr=${config.orderstr})...`);
    
    // Thử cào trang topten chính
    const url = `https://www.jjwxc.net/topten.php?orderstr=${config.orderstr}`;
    const html = await fetchHtmlWithRetry(url);
    let items = parseToptenHtml(html, config.id);

    // Nếu bảng hiện có ít hơn dữ liệu cũ mà dữ liệu cũ tốt hơn, kết hợp
    if (items.length === 0 && currentData.rankings && currentData.rankings[config.id]) {
      console.log(`⚠️ Không lấy được bảng ${config.id}, giữ lại dữ liệu cũ.`);
      items = currentData.rankings[config.id].items;
    } else {
      console.log(`✅ Lấy thành công ${items.length} truyện cho ${config.fullName}! (Hạng #1: ${items[0]?.title || 'N/A'})`);
    }

    resultRankings[config.id] = {
      id: config.id,
      name: config.name,
      fullName: config.fullName,
      desc: config.desc,
      channel: config.channel,
      items: items
    };

    totalNovelsAcrossRankings += items.length;
  }

  const finalOutput = {
    crawledAt: new Date().toISOString(),
    source: 'JJWXC Official Topten (Toàn bộ danh sách tối đa theo BXH gốc)',
    totalRankings: Object.keys(resultRankings).length,
    totalItems: totalNovelsAcrossRankings,
    rankings: resultRankings
  };

  fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2), 'utf-8');
  console.log(`\n🎉 HOÀN TẤT! Đã lưu toàn bộ ${totalNovelsAcrossRankings} truyện của các BXH gốc vào src/data/jjwxcRealData.json`);
}

main().catch(err => {
  console.error('Lỗi khi chạy crawler:', err);
  process.exit(1);
});
