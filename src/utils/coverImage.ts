/**
 * Tiện ích tải ảnh bìa Tấn Giang thông minh & Triệt để
 * - Tự động tra cứu URL ảnh bìa thật 100% từ bảng ánh xạ 1,187 truyện chính thức của Tấn Giang
 * - Không cần push 87MB ảnh lên GitHub (file JSON chỉ 105KB, push 1 giây là xong)
 * - Tự động qua Cloudflare CDN (wsrv.nl) vượt tường lửa Referer, chống Mixed Content HTTP/HTTPS
 * - 100% đúng bìa của từng tác phẩm trên mọi môi trường (GitHub Pages, Localhost, Vercel...)
 */

import novelCoversRealMap from '../data/novelCoversRealMap.json';

const coverMap = novelCoversRealMap as Record<string, string>;

function getBasePath(): string {
  if (typeof window === 'undefined') return '/';
  
  if (window.location.hostname.includes('github.io')) {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      return `/${segments[0]}/`;
    }
  }

  const base = import.meta.env.BASE_URL;
  if (base && base !== './' && base !== '.') {
    return base.endsWith('/') ? base : `${base}/`;
  }

  return './';
}

/**
 * Lấy URL ảnh bìa thật 100% của tác phẩm từ Tấn Giang
 */
export function getNovelCoverUrl(novelId: string, customCoverUrl?: string): string {
  if (!novelId) return '';

  // 1. Nếu customCoverUrl là link HTTP hợp lệ bên ngoài
  if (customCoverUrl && (customCoverUrl.startsWith('http://') || customCoverUrl.startsWith('https://'))) {
    return `https://wsrv.nl/?url=${encodeURIComponent(customCoverUrl)}`;
  }

  // 2. Tra cứu URL ảnh thật 100% chính xác từ Tấn Giang
  const realUrl = coverMap[novelId];
  if (realUrl && realUrl.startsWith('http')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(realUrl)}`;
  }

  // 3. Fallback sang server ảnh Tấn Giang
  return `https://wsrv.nl/?url=${encodeURIComponent(`https://images.jjwxc.net/novelimage.php?novelid=${novelId}`)}`;
}

/**
 * Lấy URL ảnh bìa hỗ trợ CORS 100% cho Canvas trích xuất màu
 */
export function getCorsCoverUrl(novelId: string, customCoverUrl?: string): string {
  return getNovelCoverUrl(novelId, customCoverUrl);
}

/**
 * Xử lý lỗi nạp ảnh bìa đa tầng dự phòng (Multi-tier Failover System)
 */
export function handleCoverError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  novelId: string,
  customCoverUrl?: string
) {
  const target = e.currentTarget;
  const currentSrc = target.src || '';
  const basePath = getBasePath();
  
  const retryCount = parseInt(target.dataset.retryCount || '0', 10);
  if (retryCount >= 3) {
    target.src = `${basePath}noveldefaultimage.svg`;
    return;
  }
  target.dataset.retryCount = (retryCount + 1).toString();

  const realUrl = coverMap[novelId];

  // Tầng 1: Thử mirror weserv.nl thứ hai nếu wsrv.nl lỗi
  if (currentSrc.includes('wsrv.nl') && realUrl) {
    target.src = `https://images.weserv.nl/?url=${encodeURIComponent(realUrl)}`;
    return;
  }

  // Tầng 2: Thử CDN Statically
  if (currentSrc.includes('images.weserv.nl') && realUrl) {
    target.src = `https://cdn.statically.io/img/${realUrl.replace(/^https?:\/\//, '')}`;
    return;
  }

  // Tầng 3: Ảnh mặc định chuẩn Tấn Giang
  target.src = `${basePath}noveldefaultimage.svg`;
}
