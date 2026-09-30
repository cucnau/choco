/**
 * Tiện ích trích xuất bảng màu Canva từ ảnh bìa truyện (Client-side Canvas - KHÔNG DÙNG AI)
 * Trích xuất các màu sắc thực tế của ảnh bìa (Canva Photo Colors) và áp dụng trực tiếp cho giao diện
 */

export interface CanvaPalette {
  colors: string[];          // Danh sách các màu thực tế trích xuất từ bìa (mã HEX)
  bg: string;                // Màu nền chính của modal
  cardBg: string;            // Màu nền các thẻ / khối nội dung
  border: string;            // Màu viền
  text: string;              // Màu chữ chính (đảm bảo độ tương phản cao, đọc cực rõ)
  textMuted: string;         // Màu chữ phụ
  accent: string;            // Màu điểm nhấn (nút, badge, link)
  accentHover: string;       // Màu khi hover nút
  accentText: string;        // Màu chữ bên trong nút accent
  isDarkTheme: boolean;      // Nền bìa là tone sáng hay tối
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
  colors: ['#edf2ed', '#7a9686', '#2b362f', '#c45a6c', '#486354'],
  bg: '#f3f6f3',
  cardBg: '#ffffff',
  border: '#c8d6cb',
  text: '#1a231d',
  textMuted: '#4f6154',
  accent: '#2b7050',
  accentHover: '#20573e',
  accentText: '#ffffff',
  isDarkTheme: false,
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
    // Tải ảnh qua fetch blob để đảm bảo không bị lỗi CORS hay miss event onload
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

    // Vẽ lên canvas để quét ma trận điểm ảnh
    const sampleSize = 80;
    const canvas = document.createElement('canvas');
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return FALLBACK_PALETTE;

    ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
    const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

    // 1. Lượng tử hóa màu (Color Quantization) & đếm tần suất
    const colorMap = new Map<string, { rSum: number; gSum: number; bSum: number; count: number }>();
    const step = 2; // lấy mẫu cách 2 pixel

    for (let y = 0; y < sampleSize; y += step) {
      for (let x = 0; x < sampleSize; x += step) {
        const idx = (y * sampleSize + x) * 4;
        const a = imgData[idx + 3];
        if (a < 180) continue;

        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];

        // Bước lượng tử hóa 18
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

    // 2. Tính màu trung bình cho mỗi cụm
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

    // Sắp xếp theo số lượng pixel giảm dần
    rawClusters.sort((a, b) => b.count - a.count);

    // 3. Gom các màu gần nhau (Color merging với khoảng cách Euclidean < 42)
    const distinctColors: typeof rawClusters = [];
    for (const cluster of rawClusters) {
      let isSimilar = false;
      for (const existing of distinctColors) {
        if (colorDistance(cluster.r, cluster.g, cluster.b, existing.r, existing.g, existing.b) < 42) {
          existing.count += cluster.count;
          isSimilar = true;
          break;
        }
      }
      if (!isSimilar) {
        distinctColors.push(cluster);
      }
      if (distinctColors.length >= 12) break;
    }

    // Chọn top 5 màu đẹp nhất đại diện cho bức ảnh (Canva photo palette)
    distinctColors.sort((a, b) => b.count - a.count);
    const topColors = distinctColors.slice(0, 5);
    if (topColors.length === 0) return FALLBACK_PALETTE;

    const hexPalette = topColors.map(c => c.hex);

    // 4. Phân tích màu để áp dụng trực tiếp cho giao diện (nền, thẻ, chữ, viền, nút)
    // Tìm màu có diện tích lớn nhất (dominant)
    const dominant = topColors[0];

    // Tìm màu sáng nhất và tối nhất trong các màu trích xuất được
    const sortedByLight = [...topColors].sort((a, b) => a.brightness - b.brightness);
    const darkest = sortedByLight[0];
    const lightest = sortedByLight[sortedByLight.length - 1];

    // Tìm màu có độ bão hòa cao nhất để làm màu nhấn (accent)
    const sortedBySat = [...topColors].sort((a, b) => b.sat - a.sat);
    let vibrantColor = sortedBySat[0];
    if (vibrantColor.sat < 0.25) {
      // nếu ảnh ít màu rực rỡ, lấy màu thứ 2 hoặc thứ 3
      vibrantColor = topColors[1] || dominant;
    }

    // Xác định tone màu tổng thể của bìa: sáng hay tối
    const isDarkTheme = dominant.brightness < 125;

    let bg: string;
    let cardBg: string;
    let border: string;
    let text: string;
    let textMuted: string;
    let accent: string;
    let accentHover: string;
    let accentText: string;

    if (!isDarkTheme) {
      // === BÌA NỀN SÁNG (như Ma Đạo Tổ Sư: nền thủy mặc sáng ngọc/ngà) ===
      bg = dominant.hex; // Dùng trực tiếp màu nền sáng của ảnh bìa
      cardBg = lightest.hex === dominant.hex 
        ? '#ffffff' 
        : rgbToHex(
            Math.min(255, Math.round(dominant.r * 0.95 + 15)),
            Math.min(255, Math.round(dominant.g * 0.95 + 15)),
            Math.min(255, Math.round(dominant.b * 0.95 + 15))
          );

      // Chữ lấy màu tối nhất từ bìa (chữ mực đen thư pháp)
      text = darkest.brightness < 80 
        ? darkest.hex 
        : rgbToHex(Math.round(darkest.r * 0.4), Math.round(darkest.g * 0.4), Math.round(darkest.b * 0.4));

      textMuted = rgbToHex(
        Math.round((text === darkest.hex ? darkest.r : 30) * 1.6 + 40),
        Math.round((text === darkest.hex ? darkest.g : 30) * 1.6 + 40),
        Math.round((text === darkest.hex ? darkest.b : 30) * 1.6 + 40)
      );

      // Viền lấy màu trung gian từ bìa
      const midColor = sortedByLight[Math.floor(sortedByLight.length / 2)] || dominant;
      border = rgbToHex(
        Math.round(midColor.r * 0.8 + 20),
        Math.round(midColor.g * 0.8 + 20),
        Math.round(midColor.b * 0.8 + 20)
      );

      accent = vibrantColor.hex;
      accentHover = rgbToHex(
        Math.max(0, Math.round(vibrantColor.r * 0.85)),
        Math.max(0, Math.round(vibrantColor.g * 0.85)),
        Math.max(0, Math.round(vibrantColor.b * 0.85))
      );
      accentText = vibrantColor.brightness > 140 ? '#111827' : '#ffffff';
    } else {
      // === BÌA NỀN TỐI ===
      bg = dominant.hex; // Dùng màu tối thật của ảnh bìa
      cardBg = rgbToHex(
        Math.min(255, Math.round(dominant.r + 20)),
        Math.min(255, Math.round(dominant.g + 20)),
        Math.min(255, Math.round(dominant.b + 20))
      );

      // Chữ lấy màu sáng nhất từ bìa
      text = lightest.brightness > 180 
        ? lightest.hex 
        : rgbToHex(
            Math.min(255, Math.round(lightest.r * 1.2 + 60)),
            Math.min(255, Math.round(lightest.g * 1.2 + 60)),
            Math.min(255, Math.round(lightest.b * 1.2 + 60))
          );

      textMuted = rgbToHex(
        Math.min(255, Math.round(lightest.r * 0.8 + 20)),
        Math.min(255, Math.round(lightest.g * 0.8 + 20)),
        Math.min(255, Math.round(lightest.b * 0.8 + 20))
      );

      border = rgbToHex(
        Math.min(255, Math.round(dominant.r + 35)),
        Math.min(255, Math.round(dominant.g + 35)),
        Math.min(255, Math.round(dominant.b + 35))
      );

      accent = vibrantColor.hex;
      accentHover = rgbToHex(
        Math.min(255, Math.round(vibrantColor.r * 1.15)),
        Math.min(255, Math.round(vibrantColor.g * 1.15)),
        Math.min(255, Math.round(vibrantColor.b * 1.15))
      );
      accentText = vibrantColor.brightness > 140 ? '#111827' : '#ffffff';
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
