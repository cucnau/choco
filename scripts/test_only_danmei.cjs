async function testOnlyDanmei() {
  const configs = [
    { id: 'zongfen', name: 'Tổng Phân Bảng', url: 'https://www.jjwxc.net/topten.php?orderstr=7&t=2' },
    { id: 'bawang', name: 'Bá Vương Phiếu', url: 'https://www.jjwxc.net/topten.php?orderstr=13&t=2' },
    { id: 'wanjie_jinbang', name: 'Hoàn Kết Kim Bảng', url: 'https://www.jjwxc.net/topten.php?orderstr=16&t=2' },
    { id: 'vip_jinbang', name: 'VIP Kim Bảng', url: 'https://www.jjwxc.net/topten.php?orderstr=12&t=2' }
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
        const cells = (tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || []).map(cell => cell.replace(/<[^>]+>/g, '').trim());
        const genre = cells[3] || '';
        
        // CHỈ LẤY THUẦN ÁI / ĐAM MỸ (纯爱)
        if (genre.includes('纯爱') || genre.includes('耽美')) {
          books.push({
            rank: books.length + 1,
            title: m ? m[2].replace(/<[^>]+>/g, '').trim() : '',
            author: a ? a[2].replace(/<[^>]+>/g, '').trim() : '',
            genre: genre
          });
        }
      }
    }
    console.log(`=== ONLY ĐAM MỸ: ${c.name} (${c.id}) [Total: ${books.length}] ===`);
    books.slice(0, 8).forEach(b => console.log(`  #${b.rank}: ${b.title} (${b.author}) - ${b.genre}`));
  }
}
testOnlyDanmei();
