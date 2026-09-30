/**
 * Tiện ích lấy URL ảnh bìa Tấn Giang tương thích cả môi trường Preview lẫn GitHub Pages (Static Web)
 */

export function getNovelCoverUrl(novelId: string, customCoverUrl?: string): string {
  const originalCoverUrl = customCoverUrl || `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;

  // Kiểm tra nếu đang chạy trên GitHub Pages (*.github.io) hoặc static web hosting
  const isStaticDeploy = typeof window !== 'undefined' && (
    window.location.hostname.includes('github.io') ||
    window.location.protocol === 'file:'
  );

  if (isStaticDeploy) {
    // Trên GitHub Pages không có server backend Express, dùng CDN Image Proxy có hỗ trợ CORS và vượt tường lửa chống hotlinking của Tấn Giang
    return `https://images.weserv.nl/?url=${encodeURIComponent(originalCoverUrl)}&default=https%3A%2F%2Fstatic.jjwxc.net%2Fimages%2Fcover.png`;
  }

  // Môi trường Dev / Preview có backend proxy
  return `/api/jjwxc/cover/${novelId}`;
}

export function handleCoverError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  novelId: string,
  customCoverUrl?: string
) {
  const target = e.currentTarget;
  const originalCoverUrl = customCoverUrl || `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;
  const weservUrl = `https://images.weserv.nl/?url=${encodeURIComponent(originalCoverUrl)}&default=https%3A%2F%2Fstatic.jjwxc.net%2Fimages%2Fcover.png`;

  // Nếu đang thử gọi /api/... mà lỗi (do deploy lên GitHub Pages hoặc server tắt), chuyển sang weserv proxy
  if (target.src.includes('/api/jjwxc/cover/')) {
    target.src = weservUrl;
    return;
  }

  // Nếu weserv cũng lỗi hoặc đang là original URL, fallback về ảnh placeholder chuẩn Tấn Giang
  if (!target.src.includes('static.jjwxc.net/images/cover.png')) {
    target.src = 'https://static.jjwxc.net/images/cover.png';
  }
}
