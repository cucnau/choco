/**
 * Tiện ích tải ảnh bìa Tấn Giang thông minh
 * Hỗ trợ 100% môi trường: Localhost, Server Full-Stack, và GitHub Pages (Static Hosting)
 */

function getBasePath(): string {
  if (typeof window === 'undefined') return '/';
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * Tạo URL ảnh bìa chuẩn xác nhất của tác phẩm từ Tấn Giang
 * Ưu tiên:
 * 1. Asset tĩnh nội bộ tương thích Base URL (GitHub Pages subpath hoặc root)
 * 2. CDN Proxy toàn cầu (Cloudflare Image Proxy)
 */
export function getNovelCoverUrl(novelId: string, customCoverUrl?: string): string {
  if (!novelId) return '';

  const basePath = getBasePath();
  // Ưu tiên ảnh thật trong asset tĩnh local
  return `${basePath}covers/${novelId}.jpg`;
}

/**
 * Lấy URL ảnh bìa hỗ trợ CORS (dùng cho canvas trích xuất màu Canva)
 */
export function getCorsCoverUrl(novelId: string, customCoverUrl?: string): string {
  if (!novelId) return '';

  const basePath = getBasePath();
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    if (customCoverUrl && (customCoverUrl.startsWith('http://') || customCoverUrl.startsWith('https://'))) {
      return `https://wsrv.nl/?url=${encodeURIComponent(customCoverUrl)}`;
    }
    return `https://wsrv.nl/?url=${encodeURIComponent(`http://static.jjwxc.net/novelimage.php?novelid=${novelId}`)}`;
  }

  return `${basePath}covers/${novelId}.jpg`;
}

/**
 * Xử lý lỗi nạp ảnh bìa thông minh đa tầng (Bulletproof Fallback System)
 * Tự động chuyển qua các CDN Proxy và server proxy dự phòng nếu môi trường GitHub Pages chưa có file tĩnh
 */
export function handleCoverError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  novelId: string,
  customCoverUrl?: string
) {
  const target = e.currentTarget;
  const currentSrc = target.src || '';
  
  // Tránh lặp vô hạn nếu đã thử hết mọi phương án
  const retryCount = parseInt(target.dataset.retryCount || '0', 10);
  if (retryCount >= 4) return;
  target.dataset.retryCount = (retryCount + 1).toString();

  const jjwxcTargetHttp = `http://static.jjwxc.net/novelimage.php?novelid=${novelId}`;
  const jjwxcTargetHttps = `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;

  // Tầng 1: Nếu file tĩnh /covers/ bị lỗi 404 (do deploy GitHub Pages không có folder covers)
  if (currentSrc.includes('/covers/')) {
    if (customCoverUrl && customCoverUrl.startsWith('http')) {
      target.src = `https://wsrv.nl/?url=${encodeURIComponent(customCoverUrl)}`;
      return;
    }
    target.src = `https://wsrv.nl/?url=${encodeURIComponent(jjwxcTargetHttp)}`;
    return;
  }

  // Tầng 2: Nếu wsrv.nl gặp trục trặc mạng
  if (currentSrc.includes('wsrv.nl')) {
    target.src = `https://images.weserv.nl/?url=${encodeURIComponent(jjwxcTargetHttps)}`;
    return;
  }

  // Tầng 3: Thử proxy nội bộ backend (nếu có server Node.js)
  if (currentSrc.includes('images.weserv.nl')) {
    const basePath = getBasePath();
    target.src = `${basePath}api/jjwxc/cover/${novelId}`;
    return;
  }

  // Tầng 4: Fallback cuối cùng sang AllOrigins
  if (currentSrc.includes('/api/jjwxc/cover/')) {
    target.src = `https://api.allorigins.win/raw?url=${encodeURIComponent(jjwxcTargetHttps)}`;
    return;
  }
}





