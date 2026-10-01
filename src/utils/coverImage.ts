/**
 * Tiện ích tải ảnh bìa Tấn Giang thông minh & tương thích 100% cả Preview, Localhost và GitHub Pages
 */

/**
 * Tạo URL ảnh bìa tối ưu theo từng nguồn máy chủ
 */
export function getNovelCoverUrl(novelId: string, customCoverUrl?: string): string {
  const targetUrl = (customCoverUrl && customCoverUrl.startsWith('http'))
    ? customCoverUrl
    : `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;

  // Nếu là ảnh từ các CDN mở (JD, ImgDB, GTI...) -> Tải trực tiếp cực nhanh
  if (targetUrl.includes('360buyimg.com') || targetUrl.includes('imgdb.cn') || targetUrl.includes('gti.asia')) {
    return targetUrl;
  }

  // Nếu đang ở Preview / Fullstack và có backend
  const isBrowser = typeof window !== 'undefined';
  const isStatic = isBrowser && (
    window.location.hostname.includes('github.io') ||
    window.location.protocol === 'file:'
  );

  // Trên GitHub Pages, dùng CDN Cloudflare Image Proxy (wsrv.nl)
  if (isStatic) {
    return `https://wsrv.nl/?url=${encodeURIComponent(targetUrl)}`;
  }

  // Môi trường Preview / Dev: dùng proxy backend của app hoặc wsrv.nl
  if (targetUrl.includes('jjwxc.net')) {
    return `/api/jjwxc/cover/${novelId}`;
  }

  return targetUrl;
}

/**
 * Lấy URL ảnh bìa hỗ trợ CORS (dùng cho canvas trích xuất màu Canva)
 */
export function getCorsCoverUrl(novelId: string, customCoverUrl?: string): string {
  const targetUrl = (customCoverUrl && customCoverUrl.startsWith('http'))
    ? customCoverUrl
    : `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;

  if (typeof window !== 'undefined' && !window.location.hostname.includes('github.io') && !window.location.protocol.includes('file')) {
    return `/api/jjwxc/cover/${novelId}`;
  }

  return `https://wsrv.nl/?url=${encodeURIComponent(targetUrl)}`;
}

/**
 * Xử lý lỗi tải ảnh bìa đa tầng (Multi-tier Smart Fallback)
 * Luôn đảm bảo hiển thị ảnh bìa tốt nhất dù ở bất kỳ mạng nào
 */
export function handleCoverError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  novelId: string,
  customCoverUrl?: string
) {
  const target = e.currentTarget;
  const originalCoverUrl = customCoverUrl || `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;
  const currentSrc = target.src;

  // Tầng 1: Nếu link /api/ lỗi hoặc link trực tiếp lỗi, thử qua CDN wsrv.nl
  if (currentSrc.includes('/api/jjwxc/cover/') || (!currentSrc.includes('wsrv.nl') && !currentSrc.includes('images.weserv.nl'))) {
    target.src = `https://wsrv.nl/?url=${encodeURIComponent(originalCoverUrl)}`;
    return;
  }

  // Tầng 2: Nếu wsrv.nl lỗi, thử trực tiếp link gốc không qua proxy
  if (currentSrc.includes('wsrv.nl') && originalCoverUrl.startsWith('http')) {
    target.src = originalCoverUrl;
    return;
  }

  // Tầng 3: Thử qua images.weserv.nl
  if (!currentSrc.includes('images.weserv.nl')) {
    target.src = `https://images.weserv.nl/?url=${encodeURIComponent(originalCoverUrl)}`;
    return;
  }

  // Tầng 4: Thử link novelimage chuẩn
  if (!currentSrc.includes('novelimage.php')) {
    target.src = `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;
    return;
  }

  // Tầng cuối: Fallback về ảnh placeholder Tấn Giang
  if (!currentSrc.includes('static.jjwxc.net/images/cover.png')) {
    target.src = 'https://static.jjwxc.net/images/cover.png';
  }
}
