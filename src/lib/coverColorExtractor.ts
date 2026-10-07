/**
 * Tiện ích trích xuất bảng màu sống động theo bìa truyện (True Color Palette Adaptation)
 * Bìa màu gì thì TOÀN BỘ các thành phần trên giao diện thay đổi theo màu phân tích được từ bìa:
 * - Nền modal: Chuyển sắc trực tiếp từ các mã màu chủ đạo của bức tranh bìa.
 * - Thẻ thông tin & Khung văn án: Nhuộm theo sắc thái của tranh bìa.
 * - Nút bấm, Huy hiệu & Viền: Sử dụng các mã màu điểm nhấn trích từ bìa.
 * - Tuyệt đối không dùng nền đen trắng mặc định!
 */

export interface CanvaPalette {
  colors: string[];          // Danh sách các mã màu HEX thực tế từ bìa (5 - 6 màu)
  dominant: string;          // Màu chiếm diện tích lớn nhất trên bìa
  secondaryBg: string;      // Màu không gian thứ hai của bìa
  accent: string;            // Màu điểm nhấn rực rỡ nhất (hoa, dưa hấu, nét vẽ...)
  secondary: string;         // Màu điểm nhấn thứ 2
  isLightCover: boolean;     // Bìa thuộc tone màu sáng hay tối
  modalBg: string;           // Dải gradient nền modal theo đúng mã màu của bìa
  cardBg: string;            // Màu nền thẻ thông tin theo mã màu bìa
  cardBorder: string;        // Màu viền thẻ theo mã màu bìa
  textPrimary: string;       // Màu chữ chính tương phản chuẩn với nền bìa
  textSecondary: string;     // Màu chữ phụ
  textMuted: string;         // Màu chữ nhãn
  introBg: string;           // Nền khung văn án
  introBorder: string;       // Viền khung văn án
  glow: string;              // Màu hào quang phát sáng
  glowSubtle: string;        // Hào quang mờ dịu
  accentGradient: string;    // Dải gradient cho nút bấm từ mã màu bìa
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

export function hexToRgba(hex: string | undefined, alpha: number = 1): string {
  if (!hex || typeof hex !== 'string') return `rgba(2, 132, 199, ${alpha})`;
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

// Xây dựng Palette giao diện đồng bộ 100% từ các mã màu thực tế của bìa
function buildPaletteFromCoverColors(
  colors: string[],
  c1: string, // Màu nền 1 của tranh
  c2: string, // Màu nền 2 của tranh
  accent: string,
  secondary: string
): CanvaPalette {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const [ar, ag, ab] = hexToRgb(accent);

  const br1 = getBrightness(r1, g1, b1);
  const br2 = getBrightness(r2, g2, b2);
  const avgBr = (br1 + br2) / 2;

  const isLightCover = avgBr >= 125;

  if (isLightCover) {
    // === BÌA TONE SÁNG (Vàng kem, lam nhạt, hồng phấn, xanh pastel...) ===
    // Nền modal là gradient chuyển màu giữa chính 2 màu của tranh bìa!
    // Làm dịu nhẹ để êm mắt nhưng giữ trọn 100% sắc thái của tranh:
    const tint1 = rgbToHex(
      Math.min(255, Math.round(r1 * 0.45 + 255 * 0.55)),
      Math.min(255, Math.round(g1 * 0.45 + 255 * 0.55)),
      Math.min(255, Math.round(b1 * 0.45 + 255 * 0.55))
    );
    const tint2 = rgbToHex(
      Math.min(255, Math.round(r2 * 0.45 + 255 * 0.55)),
      Math.min(255, Math.round(g2 * 0.45 + 255 * 0.55)),
      Math.min(255, Math.round(b2 * 0.45 + 255 * 0.55))
    );

    return {
      colors,
      dominant: c1,
      secondaryBg: c2,
      accent,
      secondary,
      isLightCover: true,
      modalBg: `linear-gradient(145deg, ${tint1} 0%, ${tint2} 100%)`,
      cardBg: 'rgba(255, 255, 255, 0.78)',
      cardBorder: hexToRgba(accent, 0.25),
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      introBg: 'rgba(255, 255, 255, 0.82)',
      introBorder: hexToRgba(secondary, 0.2),
      glow: `rgba(${ar}, ${ag}, ${ab}, 0.4)`,
      glowSubtle: `rgba(${r1}, ${g1}, ${b1}, 0.25)`,
      accentGradient: `linear-gradient(135deg, ${accent} 0%, ${secondary} 100%)`
    };
  } else {
    // === BÌA TONE TỐI (Tím than, lam sẫm, dạ lan, đỏ thẫm...) ===
    // Nền modal là gradient chuyển màu giữa 2 màu tối thực tế của bìa:
    const dark1 = rgbToHex(
      Math.max(10, Math.round(r1 * 0.75 + 10)),
      Math.max(10, Math.round(g1 * 0.75 + 10)),
      Math.max(15, Math.round(b1 * 0.75 + 15))
    );
    const dark2 = rgbToHex(
      Math.max(8, Math.round(r2 * 0.55 + 8)),
      Math.max(8, Math.round(g2 * 0.55 + 8)),
      Math.max(12, Math.round(b2 * 0.55 + 12))
    );

    return {
      colors,
      dominant: c1,
      secondaryBg: c2,
      accent,
      secondary,
      isLightCover: false,
      modalBg: `linear-gradient(150deg, ${dark1} 0%, ${dark2} 100%)`,
      cardBg: 'rgba(0, 0, 0, 0.32)',
      cardBorder: hexToRgba(accent, 0.35),
      textPrimary: '#ffffff',
      textSecondary: '#f1f5f9',
      textMuted: '#94a3b8',
      introBg: 'rgba(0, 0, 0, 0.45)',
      introBorder: hexToRgba(secondary, 0.25),
      glow: `rgba(${ar}, ${ag}, ${ab}, 0.55)`,
      glowSubtle: `rgba(${r1}, ${g1}, ${b1}, 0.3)`,
      accentGradient: `linear-gradient(135deg, ${accent} 0%, ${secondary} 100%)`
    };
  }
}

const paletteCache = new Map<string, CanvaPalette>();

export async function extractPaletteFromImage(
  imageSrc: string,
  cacheKey?: string
): Promise<CanvaPalette> {
  const key = cacheKey || imageSrc;
  if (paletteCache.has(key)) {
    return paletteCache.get(key)!;
  }

  // Fallback phong cách nghệ thuật nếu không nạp được ảnh
  if (!imageSrc || imageSrc.includes('.svg')) {
    const pal = buildPaletteFromCoverColors(
      ['#fef08a', '#38bdf8', '#f43f5e', '#0284c7', '#ffffff'],
      '#fef3c7',
      '#e0f2fe',
      '#0284c7',
      '#f43f5e'
    );
    paletteCache.set(key, pal);
    return pal;
  }

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = imageSrc;
    });

    const sampleSize = 64;
    const canvas = document.createElement('canvas');
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas not available');

    ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
    const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

    // Lượng tử hóa màu sắc thực tế
    const colorBuckets = new Map<string, { rSum: number; gSum: number; bSum: number; count: number }>();

    for (let y = 0; y < sampleSize; y += 2) {
      for (let x = 0; x < sampleSize; x += 2) {
        const idx = (y * sampleSize + x) * 4;
        const a = imgData[idx + 3];
        if (a < 160) continue;

        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];

        // Lượng tử hóa theo nấc 18 để bắt trọn sắc thái
        const qR = Math.round(r / 18) * 18;
        const qG = Math.round(g / 18) * 18;
        const qB = Math.round(b / 18) * 18;
        const bucketKey = `${qR},${qG},${qB}`;

        const existing = colorBuckets.get(bucketKey);
        if (existing) {
          existing.rSum += r;
          existing.gSum += g;
          existing.bSum += b;
          existing.count++;
        } else {
          colorBuckets.set(bucketKey, { rSum: r, gSum: g, bSum: b, count: 1 });
        }
      }
    }

    interface Cluster {
      r: number;
      g: number;
      b: number;
      hex: string;
      sat: number;
      bright: number;
      count: number;
    }

    const rawClusters: Cluster[] = [];
    colorBuckets.forEach((val) => {
      const r = Math.round(val.rSum / val.count);
      const g = Math.round(val.gSum / val.count);
      const b = Math.round(val.bSum / val.count);
      rawClusters.push({
        r,
        g,
        b,
        hex: rgbToHex(r, g, b),
        sat: getSaturation(r, g, b),
        bright: getBrightness(r, g, b),
        count: val.count
      });
    });

    if (rawClusters.length === 0) {
      const pal = buildPaletteFromCoverColors(
        ['#fef08a', '#38bdf8', '#f43f5e', '#0284c7', '#ffffff'],
        '#fef3c7',
        '#e0f2fe',
        '#0284c7',
        '#f43f5e'
      );
      paletteCache.set(key, pal);
      return pal;
    }

    // 1. Sắp xếp theo diện tích chiếm trên tranh (Pixel Count) để tìm màu nền 1 & 2
    rawClusters.sort((a, b) => b.count - a.count);
    const dominantCluster = rawClusters[0];
    const dominantHex = dominantCluster.hex;

    // Lọc các màu riêng biệt (Distinct)
    const distinctColors: Cluster[] = [];
    for (const c of rawClusters) {
      let isDuplicate = false;
      for (const ex of distinctColors) {
        if (colorDistance(c.r, c.g, c.b, ex.r, ex.g, ex.b) < 36) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        distinctColors.push(c);
      }
      if (distinctColors.length >= 6) break;
    }

    const colors = distinctColors.map(c => c.hex);

    // Màu nền thứ 2 của tranh
    const secondBgCluster = distinctColors.find(c => c.hex !== dominantHex) || distinctColors[0];
    const secondaryBgHex = secondBgCluster.hex;

    // 2. Tìm màu điểm nhấn (Accent - màu bão hòa nhất trên tranh, ví dụ dưa hấu đỏ, biển xanh, hoa, quả)
    const sortedBySat = [...distinctColors].sort((a, b) => b.sat - a.sat);
    const topAccent = sortedBySat.find(c => c.sat > 0.22) || sortedBySat[0];
    const secondAccent = sortedBySat.find(c => c !== topAccent && c.sat > 0.18) || distinctColors[1] || topAccent;

    const accentHex = topAccent.hex;
    const secondaryHex = secondAccent.hex;

    const palette = buildPaletteFromCoverColors(
      colors,
      dominantHex,
      secondaryBgHex,
      accentHex,
      secondaryHex
    );

    paletteCache.set(key, palette);
    return palette;
  } catch {
    const pal = buildPaletteFromCoverColors(
      ['#fef08a', '#38bdf8', '#f43f5e', '#0284c7', '#ffffff'],
      '#fef3c7',
      '#e0f2fe',
      '#0284c7',
      '#f43f5e'
    );
    paletteCache.set(key, pal);
    return pal;
  }
}
