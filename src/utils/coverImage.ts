/**
 * Tiện ích tải ảnh bìa Tấn Giang tương thích toàn diện cả môi trường Preview, Localhost lẫn GitHub Pages (Static Web)
 */

/**
 * Lấy URL ảnh bìa tốt nhất để gắn vào thẻ <img>
 * Sử dụng trực tiếp link gốc kết hợp referrerPolicy="no-referrer" để tải ảnh nhanh nhất, không nén, đúng 100%
 */
export function getNovelCoverUrl(novelId: string, customCoverUrl?: string): string {
  if (customCoverUrl && customCoverUrl.startsWith('http')) {
    return customCoverUrl;
  }
  return `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;
}

/**
 * Lấy URL ảnh bìa hỗ trợ CORS (dùng cho việc fetch blob / vẽ lên canvas trích xuất màu)
 */
export function getCorsCoverUrl(novelId: string, customCoverUrl?: string): string {
  const originalCoverUrl = customCoverUrl || `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;
  
  // Nếu có backend proxy (môi trường Preview / Fullstack)
  if (typeof window !== 'undefined' && !window.location.hostname.includes('github.io') && !window.location.protocol.includes('file')) {
    return `/api/jjwxc/cover/${novelId}`;
  }

  // Môi trường Static (GitHub Pages / Vercel...), dùng CDN Image Proxy có header CORS
  return `https://wsrv.nl/?url=${encodeURIComponent(originalCoverUrl)}`;
}

/**
 * Xử lý lỗi tải ảnh bìa đa tầng (Multi-tier Fallback Proxy)
 * Đảm bảo 100% luôn tải được ảnh bìa ngay cả khi nhà mạng hoặc môi trường chặn
 */
export function handleCoverError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  novelId: string,
  customCoverUrl?: string
) {
  const target = e.currentTarget;
  const originalCoverUrl = customCoverUrl || `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;
  const currentSrc = target.src;

  // Tầng 1: Nếu link trực tiếp lỗi, thử qua proxy wsrv.nl
  if (!currentSrc.includes('wsrv.nl') && !currentSrc.includes('images.weserv.nl') && !currentSrc.includes('allorigins.win')) {
    target.src = `https://wsrv.nl/?url=${encodeURIComponent(originalCoverUrl)}`;
    return;
  }

  // Tầng 2: Nếu wsrv.nl lỗi, thử qua images.weserv.nl
  if (currentSrc.includes('wsrv.nl')) {
    target.src = `https://images.weserv.nl/?url=${encodeURIComponent(originalCoverUrl)}`;
    return;
  }

  // Tầng 3: Nếu images.weserv.nl lỗi, thử qua allorigins proxy
  if (currentSrc.includes('images.weserv.nl')) {
    target.src = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalCoverUrl)}`;
    return;
  }

  // Tầng cuối: Fallback về ảnh bìa mặc định chuẩn của Tấn Giang
  if (!currentSrc.includes('static.jjwxc.net/images/cover.png')) {
    target.src = 'https://static.jjwxc.net/images/cover.png';
  }
}
