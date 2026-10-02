async function verifyDanmeiRankings() {
  const configs = [
    { id: 'zongfen', name: 'Tổng Phân', url: 'https://www.jjwxc.net/topten.php?orderstr=7&t=2' },
    { id: 'bawang', name: 'Bá Vương Phiếu', url: 'https://www.jjwxc.net/topten.php?orderstr=13&t=2' },
    { id: 'wanjie_jinbang', name: 'Hoàn Kết Kim Bảng', url: 'https://www.jjwxc.net/topten.php?orderstr=16&t=2' },
    { id: 'vip_jinbang', name: 'VIP Kim Bảng (Thu nhập)', url: 'https://www.jjwxc.net/topten.php?orderstr=12&t=2' },
    { id: 'yuedu', name: 'Nguyệt Bảng (Tháng)', url: 'https://www.jjwxc.net/topten.php?orderstr=5&t=2' },
    { id: 'jidu', name: 'Quý Bảng (Quý)', url: 'https://www.jjwxc.net/topten.php?orderstr=4&t=2' },
    { id: 'bannian', name: 'Bán Niên Bảng', url: 'https://www.jjwxc.net/topten.php?orderstr=6&t=2' },
    { id: 'xinjin', name: 'Tân Tấn Tác Giả', url: 'https://www.jjwxc.net/topten.php?orderstr=3&t=2' }
  ];

  for (const c of configs) {
    const res = await fetch(c.url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.jjwxc.net/' } });
    const buf = await res.arrayBuffer();
    const text = new TextDecoder('gb18030').decode(buf);
    const books = [];
    const trMatches = text.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
    for (const tr of trMatches) {
      if (tr.includes('onebook.php?novelid=')) {
        const m = tr.match(/onebook\.php\?novelid=(\d+)[^>]*>([\s\S]*?)<\/a>/i);
        const a = tr.match(/oneauthor\.php\?authorid=(\d+)[^>]*>([\s\S]*?)<\/a>/i);
        if (m && a) {
          books.push({
            title: m[2].replace(/<[^>]+>/g, '').trim(),
            author: a[2].replace(/<[^>]+>/g, '').trim()
          });
        }
      }
    }
    console.log(`=== ${c.name} (${c.id}) [Total: ${books.length}] ===`);
    books.slice(0, 5).forEach((b, i) => console.log(`  #${i+1}: ${b.title} (${b.author})`));
  }
}
verifyDanmeiRankings();
