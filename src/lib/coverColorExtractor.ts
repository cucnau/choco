/**
 * Tiện ích trích xuất bảng màu Canva từ ảnh bìa truyện (Client-side Canvas - KHÔNG DÙNG AI)
 * Thiết kế chuẩn Glassmorphism trong trẻo, tinh tế, cao cấp
 * Tuyệt đối không dùng bóng chữ đen lem nhem; bảo đảm độ trong sáng, tương phản sắc nét tự nhiên.
 */

export interface CanvaPalette {
  colors: string[];          // Danh sách các màu thực tế trích xuất từ bìa (mã HEX)
  bg: string;                // Màu nền chính của modal
  cardBg: string;            // Màu nền các thẻ / khối nội dung
  border: string;            // Màu viền
  text: string;              // Màu chữ chính (sắc nét, thanh lịch, dễ đọc)
  textMuted: string;         // Màu chữ phụ (trang nhã, rõ ràng)
  accent: string;            // Màu điểm nhấn (nút, badge, link)
  accentHover: string;       // Màu khi hover nút
  accentText: string;        // Màu chữ bên trong nút accent (tương phản cao với accent)
  isDarkTheme: boolean;      // Nền bìa là tone sáng hay tối
}

export function hexToRgba(hex: string | undefined, alpha: number = 1): string {
  if (!hex || typeof hex !== 'string') return `rgba(255, 255, 255, ${alpha})`;
  const cleanHex = hex.replace('#', '').trim();
  let r = 255, g = 255, b = 255;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16) || 255;
    g = parseInt(cleanHex[1] + cleanHex[1], 16) || 255;
    b = parseInt(cleanHex[2] + cleanHex[2], 16) || 255;
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.substring(0, 2), 16) || 255;
    g = parseInt(cleanHex.substring(2, 4), 16) || 255;
    b = parseInt(cleanHex.substring(4, 6), 16) || 255;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    return [
      parseInt(cleanHex[0] + cleanHex[0], 16) || 0,
      parseInt(cleanHex[1] + cleanHex[1], 16) || 0,
      parseInt(cleanHex[2] + cleanHex[2], 16) || 0
    ];
  }
  return [
    parseInt(cleanHex.substring(0, 2), 16) || 0,
    parseInt(cleanHex.substring(2, 4), 16) || 0,
    parseInt(cleanHex.substring(4, 6), 16) || 0
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getBrightness(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// Bảng màu mặc định nếu không load được ảnh
const FALLBACK_PALETTE: CanvaPalette = {
  colors: ['#f8fafc', '#e2e8f0', '#94a3b8', '#059669', '#0f172a'],
  bg: '#f8fafc',
  cardBg: '#ffffff',
  border: '#e2e8f0',
  text: '#1e293b',
  textMuted: '#64748b',
  accent: '#059669',
  accentHover: '#047857',
  accentText: '#ffffff',
  isDarkTheme: false
};

const paletteCache = new Map<string, CanvaPalette>();

export async function extractPaletteFromImage(
  imageSrc: string,
  cacheKey?: string
): Promise<CanvaPalette> {
  const key = cacheKey || imageSrc;
  if (paletteCache.has(key)) {
    return paletteCache.get(key)!;
  }

  try {
    const res = await fetch(imageSrc);
    if (!res.ok) throw new Error('Không thể tải ảnh');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = objectUrl;
    });

    URL.revokeObjectURL(objectUrl);

    const sampleSize = 80;
    const canvas = document.createElement('canvas');
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return FALLBACK_PALETTE;

    ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
    const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

    // 1. Lượng tử hóa màu
    const colorMap = new Map<string, { rSum: number; gSum: number; bSum: number; count: number }>();
    const step = 2;

    for (let y = 0; y < sampleSize; y += step) {
      for (let x = 0; x < sampleSize; x += step) {
        const idx = (y * sampleSize + x) * 4;
        const a = imgData[idx + 3];
        if (a < 180) continue;

        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];

        const qR = Math.round(r / 18) * 18;
        const qG = Math.round(g / 18) * 18;
        const qB = Math.round(b / 18) * 18;
        const bucketKey = `${qR},${qG},${qB}`;

        const existing = colorMap.get(bucketKey);
        if (existing) {
          existing.rSum += r;
          existing.gSum += g;
          existing.bSum += b;
          existing.count++;
        } else {
          colorMap.set(bucketKey, { rSum: r, gSum: g, bSum: b, count: 1 });
        }
      }
    }

    const rawClusters: Array<{ r: number; g: number; b: number; count: number; hex: string; brightness: number; sat: number }> = [];
    colorMap.forEach((val) => {
      const r = Math.round(val.rSum / val.count);
      const g = Math.round(val.gSum / val.count);
      const b = Math.round(val.bSum / val.count);
      rawClusters.push({
        r,
        g,
        b,
        count: val.count,
        hex: rgbToHex(r, g, b),
        brightness: getBrightness(r, g, b),
        sat: getSaturation(r, g, b)
      });
    });

    rawClusters.sort((a, b) => b.count - a.count);

    // 2. Gom màu gần nhau
    const distinctColors: typeof rawClusters = [];
    for (const cluster of rawClusters) {
      let isSimilar = false;
      for (const existing of distinctColors) {
        if (colorDistance(cluster.r, cluster.g, cluster.b, existing.r, existing.g, existing.b) < 38) {
          existing.count += cluster.count;
          isSimilar = true;
          break;
        }
      }
      if (!isSimilar) {
        distinctColors.push(cluster);
      }
      if (distinctColors.length >= 10) break;
    }

    distinctColors.sort((a, b) => b.count - a.count);
    const topColors = distinctColors.slice(0, 5);
    if (topColors.length === 0) return FALLBACK_PALETTE;

    const hexPalette = topColors.map(c => c.hex);

    // 3. Phân tích các màu đặc trưng từ bìa
    const dominant = topColors[0];
    const sortedByLight = [...topColors].sort((a, b) => a.brightness - b.brightness);
    const darkest = sortedByLight[0];
    const lightest = sortedByLight[sortedByLight.length - 1];

    // Màu rực rỡ nhất làm điểm nhấn
    const sortedBySat = [...topColors].sort((a, b) => b.sat - a.sat);
    let vibrant = sortedBySat[0];
    if (vibrant.sat < 0.2) {
      // Nếu top 5 màu ít bão hòa, quét tìm trong toàn bộ distinctColors xem có màu nhấn rực rỡ không (ví dụ nét chữ hồng/đỏ/xanh trên bìa đen trắng)
      const colorfulFromAll = distinctColors.find(c => c.sat >= 0.25);
      if (colorfulFromAll) {
        vibrant = colorfulFromAll;
      } else {
        // Nếu bìa thuần đen trắng hoàn toàn, dùng màu ngọc bích sang trọng làm điểm nhấn
        vibrant = {
          r: 16, g: 185, b: 129,
          count: 1,
          hex: '#10b981',
          brightness: 130,
          sat: 0.8
        };
      }
    }

    // Xác định tone màu tổng thể của bìa
    const isDarkTheme = dominant.brightness < 80;

    let bg: string;
    let cardBg: string;
    let border: string;
    let text: string;
    let textMuted: string;
    let accent: string;
    let accentHover: string;
    let accentText: string;

    if (!isDarkTheme) {
      // === BÌA SÁNG / PASTEL / TRẮNG / VÀNG NHẠT (Chiếm phần lớn truyện) ===
      bg = dominant.hex; // Dùng màu ấm gốc của bìa làm sắc thái kính
      cardBg = lightest.hex;
      border = rgbToHex(
        Math.min(255, Math.round(dominant.r * 0.85 + 20)),
        Math.min(255, Math.round(dominant.g * 0.85 + 20)),
        Math.min(255, Math.round(dominant.b * 0.85 + 20))
      );

      // Chữ màu than chì thư pháp (sắc nét, sang trọng, tương phản cực chuẩn trên nền kính sáng)
      text = darkest.brightness < 60 ? darkest.hex : '#1e293b';
      textMuted = '#64748b';

      accent = vibrant.hex;
      accentHover = rgbToHex(
        Math.max(0, Math.round(vibrant.r * 0.85)),
        Math.max(0, Math.round(vibrant.g * 0.85)),
        Math.max(0, Math.round(vibrant.b * 0.85))
      );
      // Chữ bên trong nút accent: Trắng nếu nút đậm, Đen nếu nút sáng
      accentText = vibrant.brightness > 145 ? '#0f172a' : '#ffffff';
    } else {
      // === BÌA TỐI / ĐEN / HUYỀN ẢO ===
      bg = dominant.hex;
      cardBg = rgbToHex(
        Math.min(255, Math.round(dominant.r + 25)),
        Math.min(255, Math.round(dominant.g + 25)),
        Math.min(255, Math.round(dominant.b + 25))
      );
      border = rgbToHex(
        Math.min(255, Math.round(dominant.r + 45)),
        Math.min(255, Math.round(dominant.g + 45)),
        Math.min(255, Math.round(dominant.b + 45))
      );

      // Chữ trắng ngà thanh thoát
      text = '#f8fafc';
      textMuted = '#94a3b8';

      accent = vibrant.hex;
      accentHover = rgbToHex(
        Math.min(255, Math.round(vibrant.r * 1.15)),
        Math.min(255, Math.round(vibrant.g * 1.15)),
        Math.min(255, Math.round(vibrant.b * 1.15))
      );
      accentText = vibrant.brightness > 145 ? '#0f172a' : '#ffffff';
    }

    const palette: CanvaPalette = {
      colors: hexPalette,
      bg,
      cardBg,
      border,
      text,
      textMuted,
      accent,
      accentHover,
      accentText,
      isDarkTheme
    };

    paletteCache.set(key, palette);
    return palette;
  } catch (err) {
    console.warn('Lỗi trích xuất màu Canva:', err);
    return FALLBACK_PALETTE;
  }
}
