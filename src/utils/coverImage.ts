/**
 * Tiện ích tải ảnh bìa Tấn Giang thông minh & Triệt để
 * - 100% truyện có ảnh bìa gốc chính thức
 * - Nhúng trực tiếp các ảnh hiếm/bị chặn qua WebP Data URI siêu nhẹ
 * - Các CDN lớn (JD 360buyimg, Alibaba alicdn, WordPress Photon wp.com) được nạp trực tiếp tốc độ cao
 * - Máy chủ Tấn Giang (jjwxc.net) được nạp qua Cloudflare wsrv.nl để vượt chặn Referer
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

  // 1. Ưu tiên tra cứu URL thật từ bản đồ dữ liệu 1,187 truyện chính thức
  let targetUrl = coverMap[novelId];

  // 2. Nếu chưa có trong map, dùng customCoverUrl nếu là link hợp lệ
  if (!targetUrl && customCoverUrl && (customCoverUrl.startsWith('http://') || customCoverUrl.startsWith('https://') || customCoverUrl.startsWith('data:image/'))) {
    targetUrl = customCoverUrl;
  }

  // 3. Fallback URL
  if (!targetUrl) {
    targetUrl = `https://images.jjwxc.net/novelimage.php?novelid=${novelId}`;
  }

  // 4. Nếu là Data URI (Base64), trả về trực tiếp ngay lập tức
  if (targetUrl.startsWith('data:image/')) {
    return targetUrl;
  }

  // 5. Nếu là CDN lớn hỗ trợ HTTPS & CORS trực tiếp (JD 360buyimg, Alibaba alicdn, WordPress Photon)
  // KHÔNG ĐƯỢC qua wsrv.nl vì wsrv.nl sẽ báo lỗi 400 với JD/Alibaba
  if (
    targetUrl.includes('360buyimg.com') ||
    targetUrl.includes('alicdn.com') ||
    targetUrl.includes('wp.com') ||
    targetUrl.includes('wsrv.nl')
  ) {
    return targetUrl;
  }

  // 6. Với máy chủ Tấn Giang (jjwxc.net): Bắt buộc qua Cloudflare CDN để bypass Referer & Mixed Content
  return `https://wsrv.nl/?url=${encodeURIComponent(targetUrl)}`;
}

/**
 * Lấy URL ảnh bìa hỗ trợ CORS 100% cho Canvas trích xuất màu
 */
export function getCorsCoverUrl(novelId: string, customCoverUrl?: string): string {
  return getNovelCoverUrl(novelId, customCoverUrl);
}

/**
 * Xử lý lỗi nạp ảnh bìa đa tầng dự phòng
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
  if (retryCount >= 2) {
    target.src = `${basePath}noveldefaultimage.svg`;
    return;
  }
  target.dataset.retryCount = (retryCount + 1).toString();

  const realUrl = coverMap[novelId] || customCoverUrl;

  // Nếu đang dùng wsrv.nl bị lỗi, thử nạp trực tiếp qua WordPress Photon
  if (currentSrc.includes('wsrv.nl') && realUrl && !realUrl.startsWith('data:')) {
    target.src = `https://i0.wp.com/${realUrl.replace(/^https?:\/\//, '')}`;
    return;
  }

  // Fallback về SVG bìa sách mỹ thuật
  target.src = `${basePath}noveldefaultimage.svg`;
}
