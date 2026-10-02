/**
 * Tiện ích tải ảnh bìa Tấn Giang thông minh, đảm bảo 100% BÌA ĐÚNG của từng tác phẩm
 */

/**
 * Tạo URL ảnh bìa chuẩn xác nhất của tác phẩm từ Tấn Giang
 * Đi thẳng qua asset tĩnh nội bộ (/covers/:novelId.jpg)
 */
export function getNovelCoverUrl(novelId: string, _customCoverUrl?: string): string {
  return `/covers/${novelId}.jpg`;
}

/**
 * Lấy URL ảnh bìa hỗ trợ CORS (dùng cho canvas trích xuất màu Canva)
 */
export function getCorsCoverUrl(novelId: string, _customCoverUrl?: string): string {
  return `/covers/${novelId}.jpg`;
}

/**
 * Xử lý lỗi tải ảnh bìa: Thử fallback sang Proxy Backend nếu file tĩnh chưa kịp nạp
 */
export function handleCoverError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  novelId: string,
  customCoverUrl?: string
) {
  const target = e.currentTarget;
  const currentSrc = target.src;

  // Nếu file tĩnh bị lỗi, fallback sang proxy API
  if (currentSrc.includes('/covers/')) {
    target.src = `/api/jjwxc/cover/${novelId}`;
    return;
  }

  // Nếu API proxy cũng lỗi, fallback sang Cloudflare Image Proxy
  if (currentSrc.includes('/api/jjwxc/cover/')) {
    if (customCoverUrl && customCoverUrl.startsWith('http')) {
      target.src = `https://wsrv.nl/?url=${encodeURIComponent(customCoverUrl)}`;
      return;
    }
    const targetUrl = `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;
    target.src = `https://wsrv.nl/?url=${encodeURIComponent(targetUrl)}`;
    return;
  }
}





