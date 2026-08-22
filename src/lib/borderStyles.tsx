import React from 'react';
import { Story } from '../types';

export interface BorderStyleOption {
  value: NonNullable<Story['borderStyle']>;
  label: string;
  desc: string;
  category?: 'classic' | 'creative' | 'retro';
}

export interface BorderWidthOption {
  value: NonNullable<Story['borderWidth']>;
  label: string;
  widthPx: number;
}

export interface BorderRadiusOption {
  value: NonNullable<Story['borderRadius']>;
  label: string;
  desc: string;
}

export interface BorderCornerAccentOption {
  value: NonNullable<Story['borderCornerAccent']>;
  label: string;
  desc: string;
  category?: 'tech' | 'vintage' | 'cute' | 'craft';
}

export interface BorderGlowOption {
  value: NonNullable<Story['borderGlow']>;
  label: string;
  desc: string;
}

export const BORDER_STYLE_OPTIONS: BorderStyleOption[] = [
  { value: 'solid', label: 'Nét liền', desc: 'Đường nét thẳng chuẩn mực, tinh tế', category: 'classic' },
  { value: 'double', label: 'Viền đôi', desc: 'Hai đường song song sang trọng', category: 'classic' },
  { value: 'dashed', label: 'Nét đứt', desc: 'Nét đứt khúc thủ công ấn tượng', category: 'classic' },
  { value: 'dotted', label: 'Chấm bi tròn', desc: 'Hàng chấm tròn nhỏ tinh tế', category: 'classic' },
  { value: 'dash-dot', label: 'Gạch chấm xen kẽ', desc: 'Gạch dài xen kẽ chấm tròn thanh lịch', category: 'creative' },
  { value: 'sketch', label: 'Nét vẽ tay', desc: 'Nét phác thảo uốn lượn tự nhiên', category: 'creative' },
  { value: 'stitched', label: 'Đường may chỉ', desc: 'Đường chỉ thêu viền cách mép cổ điển', category: 'creative' },
  { value: 'gradient', label: 'Viền dải màu chuyển sắc', desc: 'Dải màu chuyển động theo đúng góc bo', category: 'creative' },
  { value: 'stamp', label: 'Viền tem thư bưu chính', desc: 'Răng cưa viền tem bưu chính cổ điển', category: 'retro' },
  { value: 'film', label: 'Khung cuộn phim', desc: 'Hàng lỗ răng cưa cuộn phim điện ảnh', category: 'retro' },
  { value: 'groove', label: 'Rãnh chìm', desc: 'Đường rãnh khắc chìm có chiều sâu', category: 'classic' },
  { value: 'ridge', label: 'Sống nổi', desc: 'Gờ sống viền nổi tinh xảo', category: 'classic' },
  { value: 'offset', label: 'Viền đôi lệch tầng', desc: 'Hiệu ứng xếp lớp đa tầng nổi bật', category: 'creative' },
  { value: 'none', label: 'Không viền', desc: 'Tối giản hoàn toàn không đường viền', category: 'classic' },
];

export const BORDER_WIDTH_OPTIONS: BorderWidthOption[] = [
  { value: 'thin', label: 'Siêu mảnh - 1px', widthPx: 1 },
  { value: 'medium', label: 'Vừa vặn - 2px', widthPx: 2 },
  { value: 'thick', label: 'Dày rõ nét - 3px', widthPx: 3 },
  { value: 'heavy', label: 'Đậm đà - 4px', widthPx: 4 },
  { value: 'bold', label: 'Siêu đậm - 6px', widthPx: 6 },
  { value: 'frame', label: 'Khung tranh - 8px', widthPx: 8 },
];

export const BORDER_RADIUS_OPTIONS: BorderRadiusOption[] = [
  { value: 'none', label: 'Vuông vức', desc: 'Góc vuông sắc cạnh' },
  { value: 'xs', label: 'Bo vi mô', desc: 'Bo góc cực nhỏ 2px tinh tế' },
  { value: 'sm', label: 'Bo nhẹ', desc: 'Mềm mại thanh lịch 4px' },
  { value: 'md', label: 'Bo vừa', desc: 'Chuẩn giao diện hiện đại 8px' },
  { value: 'lg', label: 'Bo tròn lớn', desc: 'Mềm mại thân thiện 16px' },
  { value: 'xl', label: 'Bo siêu mềm', desc: 'Bo tròn mềm mại 24px' },
  { value: 'leaf', label: 'Góc lá chéo', desc: 'Bo 2 góc chéo bất đối xứng' },
  { value: 'chamfer', label: 'Vát góc', desc: 'Vát góc đa giác hình học' },
  { value: 'ticket', label: 'Khuyết góc vé', desc: 'Khuyết góc vé xem phim cổ điển' },
  { value: 'petal', label: 'Cánh hoa', desc: 'Dáng cánh hoa 1 góc nhọn mềm mại' },
  { value: 'tab', label: 'Thẻ kẹp trên', desc: 'Bo tròn phía trên dạng kẹp hồ sơ' },
];

export const BORDER_CORNER_ACCENT_OPTIONS: BorderCornerAccentOption[] = [
  { value: 'none', label: 'Không góc trang trí', desc: 'Viền thuần túy', category: 'tech' },
  { value: 'brackets', label: 'Khung góc thước L', desc: 'Khung ngắm chữ L sắc nét ở 4 góc', category: 'tech' },
  { value: 'vintage', label: 'Hoa văn hoàng gia quý tộc', desc: 'Họa tiết hoa văn Baroque hoàng gia uốn lượn ở 4 góc', category: 'vintage' },
  { value: 'artdeco', label: 'Họa tiết Art Deco', desc: 'Họa tiết góc xếp tầng sang trọng', category: 'vintage' },
  { value: 'rivets', label: 'Đinh tán kim loại', desc: '4 chốt đinh ốc kim loại ở 4 góc', category: 'tech' },
  { value: 'dots', label: 'Chấm định vị', desc: '4 chấm tròn nhỏ tinh tế ở 4 góc', category: 'tech' },
  { value: 'crosshairs', label: 'Dấu chữ thập tâm điểm', desc: '4 dấu chữ thập giao điểm ở 4 góc', category: 'tech' },
  { value: 'washi', label: 'Băng dính dán góc', desc: 'Băng dính dán đè mép giấy tràn ra nền', category: 'craft' },
  { value: 'sparkle', label: 'Ngôi sao lấp lánh', desc: 'Họa tiết ngôi sao 4 cánh tỏa sáng tinh nghịch', category: 'cute' },
  { value: 'heart', label: 'Trái tim', desc: 'Họa tiết trái tim nhỏ nhắn đáng yêu', category: 'cute' },
  { value: 'botanical', label: 'Cành lá hoa cỏ', desc: 'Cành lá uốn lượn tự nhiên mềm mại', category: 'vintage' },
  { value: 'bow', label: 'Nơ thắt ruy băng', desc: 'Nơ ruy băng mềm mại ở các góc', category: 'cute' },
  { value: 'paperclip', label: 'Kẹp giấy kim loại', desc: 'Kẹp giấy văn phòng kẹp mép tràn ra nền sau', category: 'craft' },
];

export const BORDER_GLOW_OPTIONS: BorderGlowOption[] = [
  { value: 'none', label: 'Không hiệu ứng', desc: 'Màu viền nguyên bản' },
  { value: 'soft', label: 'Hào quang dịu', desc: 'Tỏa ánh sáng nhẹ nhàng êm mắt' },
  { value: 'neon', label: 'Phát sáng Neon', desc: 'Ánh sáng neon nổi bật' },
  { value: 'shadow', label: 'Đổ bóng khối', desc: 'Bóng khối cứng phong cách retro' },
  { value: 'soft-depth', label: 'Đổ bóng đa tầng', desc: 'Bóng mềm nhiều lớp có chiều sâu chân thực' },
  { value: 'gradient-aura', label: 'Hào quang chuyển sắc', desc: 'Vầng hào quang chuyển sắc rực rỡ' },
  { value: 'isometric', label: 'Khối nổi đa hướng', desc: 'Hiệu ứng gờ nổi khối đa chiều' },
];

function normalizeColor(color?: string, fallback = '#5e2f46'): string {
  if (!color || !color.trim()) return fallback;
  return color.trim();
}

const WIDTH_MAP: Record<string, string> = {
  thin: '1px',
  medium: '2px',
  thick: '3px',
  heavy: '4px',
  bold: '6px',
  frame: '8px',
};

/**
 * Trả về style object áp dụng cho thẻ / khung truyện
 */
export function getStoryBorderStyle(
  story?: Partial<Story>,
  fallbackBorderColor = '#2d1822'
): React.CSSProperties {
  if (!story) return {};

  const style: React.CSSProperties = {};
  const bStyle = story.borderStyle || 'solid';
  const bWidth = story.borderWidth || 'thin';
  const bRadius = story.borderRadius || 'none';
  const bGlow = story.borderGlow || 'none';
  const borderColor = normalizeColor(story.customBorderColor, fallbackBorderColor);
  const strokeWidth = WIDTH_MAP[bWidth] || '1px';
  const cardBg = story.customCardBgColor || '#11090c';

  // 1. Border Radius & Shape (Xác định trước để kết hợp mượt với mọi kiểu viền)
  if (bRadius === 'leaf') {
    style.borderRadius = '24px 4px 24px 4px';
  } else if (bRadius === 'chamfer') {
    style.borderRadius = '12px';
    style.clipPath = 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)';
  } else if (bRadius === 'ticket') {
    style.borderRadius = '10px';
    style.maskImage = 'radial-gradient(circle at top left, transparent 10px, black 10.5px), radial-gradient(circle at top right, transparent 10px, black 10.5px), radial-gradient(circle at bottom left, transparent 10px, black 10.5px), radial-gradient(circle at bottom right, transparent 10px, black 10.5px)';
    style.maskComposite = 'intersect';
  } else if (bRadius === 'petal') {
    style.borderRadius = '28px 28px 4px 28px';
  } else if (bRadius === 'tab') {
    style.borderRadius = '16px 16px 4px 4px';
  } else if (bRadius === 'xl') {
    style.borderRadius = '24px';
  } else if (bRadius === 'lg') {
    style.borderRadius = '16px';
  } else if (bRadius === 'md') {
    style.borderRadius = '8px';
  } else if (bRadius === 'sm') {
    style.borderRadius = '4px';
  } else if (bRadius === 'xs') {
    style.borderRadius = '2px';
  } else if (bStyle === 'sketch' && bRadius === 'none') {
    // Nét vẽ tay nếu để none sẽ có đường viền uốn lượn tự do
    style.borderRadius = '255px 15px 225px 15px/15px 225px 15px 255px';
  } else {
    style.borderRadius = '0px';
  }

  // 2. Border Style & Width
  if (bStyle === 'none') {
    style.border = 'none';
  } else if (bStyle === 'groove') {
    const grooveMap: Record<string, string> = { thin: '3px', medium: '4px', thick: '5px', heavy: '6px', bold: '8px', frame: '10px' };
    style.borderWidth = grooveMap[bWidth] || '3px';
    style.borderStyle = 'groove';
    style.borderColor = borderColor;
    style.boxShadow = `inset 2px 2px 4px rgba(0,0,0,0.45), inset -1px -1px 2px rgba(255,255,255,0.15)`;
  } else if (bStyle === 'ridge') {
    const ridgeMap: Record<string, string> = { thin: '3px', medium: '4px', thick: '5px', heavy: '6px', bold: '8px', frame: '10px' };
    style.borderWidth = ridgeMap[bWidth] || '3px';
    style.borderStyle = 'ridge';
    style.borderColor = borderColor;
    style.boxShadow = `2px 2px 5px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.2)`;
  } else if (bStyle === 'double') {
    const doubleMap: Record<string, string> = { thin: '3px', medium: '4px', thick: '5px', heavy: '6px', bold: '8px', frame: '10px' };
    style.borderWidth = doubleMap[bWidth] || '3px';
    style.borderStyle = 'double';
    style.borderColor = borderColor;
  } else if (bStyle === 'dotted') {
    // Chấm bi tròn to, rõ ràng và sắc nét
    const dottedWidth = bWidth === 'thin' ? '3px' : bWidth === 'medium' ? '4px' : bWidth === 'thick' ? '5px' : bWidth === 'heavy' ? '6px' : '8px';
    style.borderWidth = dottedWidth;
    style.borderStyle = 'dotted';
    style.borderColor = borderColor;
  } else if (bStyle === 'dashed') {
    // Nét đứt gạch nối rõ ràng
    style.borderWidth = strokeWidth;
    style.borderStyle = 'dashed';
    style.borderColor = borderColor;
  } else if (bStyle === 'dash-dot') {
    // Gạch chấm xen kẽ thanh lịch
    style.borderWidth = strokeWidth;
    style.borderStyle = 'dashed';
    style.borderColor = borderColor;
    style.outline = `2px dotted ${borderColor}bb`;
    style.outlineOffset = `2px`;
  } else if (bStyle === 'sketch') {
    // Nét vẽ tay phác thảo tự nhiên - Vẫn giữ nguyên hiệu lực và đường nét vẽ phác thảo trên mọi kiểu bo góc
    style.borderWidth = strokeWidth;
    style.borderStyle = 'solid';
    style.borderColor = borderColor;
    style.boxShadow = `2.5px 1.5px 0px ${borderColor}99, -1.5px 2px 0px ${borderColor}77, 1px -1.5px 0px ${borderColor}55, inset 1px 1px 0px ${borderColor}33`;
  } else if (bStyle === 'stitched') {
    // Đường may chỉ khâu viền cách mép
    style.borderWidth = strokeWidth;
    style.borderStyle = 'dashed';
    style.borderColor = borderColor;
    style.outline = `1px solid ${borderColor}66`;
    style.outlineOffset = '3px';
  } else if (bStyle === 'gradient') {
    // Viền gradient chuyển sắc theo đúng góc bo (sử dụng 2 màu sắc tùy chỉnh chính xác)
    const color1 = borderColor;
    const color2 = normalizeColor(story.customBorderGradientColor2, '#ff6b9d');
    style.border = `${strokeWidth} solid transparent`;
    style.backgroundImage = `linear-gradient(${cardBg}, ${cardBg}), linear-gradient(135deg, ${color1}, ${color2})`;
    style.backgroundOrigin = 'border-box';
    style.backgroundClip = 'padding-box, border-box';
  } else if (bStyle === 'stamp') {
    // Viền tem thư bưu chính: Răng cưa lỗ dập tem thư cổ điển quanh mép kèm khung chỉ viền trong
    style.borderWidth = strokeWidth;
    style.borderStyle = 'dashed';
    style.borderColor = borderColor;
    style.outline = `2px solid ${borderColor}77`;
    style.outlineOffset = '4px';
    style.boxShadow = `inset 0 0 0 2px ${borderColor}44, 0 0 0 7px ${borderColor}22, 0 4px 12px rgba(0,0,0,0.4)`;
  } else if (bStyle === 'film') {
    // Khung cuộn phim 35mm điện ảnh: Viền đen dày với các lỗ đục cuộn phim hai mép
    style.borderTop = `14px solid #000000`;
    style.borderBottom = `14px solid #000000`;
    style.borderLeft = `${strokeWidth} solid ${borderColor}`;
    style.borderRight = `${strokeWidth} solid ${borderColor}`;
    style.boxShadow = `inset 0 4px 0 rgba(255,255,255,0.25), inset 0 -4px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.5)`;
  } else if (bStyle === 'offset') {
    // Viền đôi lệch tầng
    style.borderWidth = strokeWidth;
    style.borderStyle = 'solid';
    style.borderColor = borderColor;
    style.boxShadow = `4px 4px 0px 0px ${borderColor}88, 7px 7px 0px 0px ${borderColor}44`;
  } else {
    style.borderStyle = bStyle;
    style.borderWidth = strokeWidth;
    style.borderColor = borderColor;
  }

  // 3. Border Glow / Shadow (Bỏ qua nếu là groove/ridge/offset vì đã có shadow chuyên biệt)
  if (bStyle !== 'groove' && bStyle !== 'ridge' && bStyle !== 'offset') {
    if (bGlow === 'soft') {
      style.boxShadow = `0 0 16px ${borderColor}66, inset 0 0 8px ${borderColor}22`;
    } else if (bGlow === 'neon') {
      style.boxShadow = `0 0 8px ${borderColor}, 0 0 24px ${borderColor}aa, inset 0 0 10px ${borderColor}55`;
    } else if (bGlow === 'shadow') {
      style.boxShadow = `5px 5px 0px ${borderColor}`;
    } else if (bGlow === 'soft-depth') {
      style.boxShadow = `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 10px 20px -3px ${borderColor}44, 0 1px 3px 0 rgba(0, 0, 0, 0.2)`;
    } else if (bGlow === 'gradient-aura') {
      const glow1 = normalizeColor(story.customBorderGlowColor1, '#ff6b9d');
      const glow2 = normalizeColor(story.customBorderGlowColor2, '#38bdf8');
      style.boxShadow = `0 0 20px ${glow1}66, 0 0 35px ${glow2}55, 0 0 50px ${borderColor}44`;
    } else if (bGlow === 'isometric') {
      style.boxShadow = `3px 3px 0px ${borderColor}, 6px 6px 0px ${borderColor}66, 9px 9px 0px ${borderColor}22`;
    }
  }

  return style;
}

/**
 * Trả về style object áp dụng cho nút bấm (Button)
 */
export function getStoryButtonBorderStyle(
  story?: Partial<Story>,
  fallbackBorderColor = '#5e2f46'
): React.CSSProperties {
  if (!story) return {};

  const style: React.CSSProperties = {};
  const bStyle = story.borderStyle || 'solid';
  const bWidth = story.borderWidth || 'thin';
  const bRadius = story.borderRadius || 'none';
  const bGlow = story.borderGlow || 'none';
  const borderColor = normalizeColor(story.customBorderColor, fallbackBorderColor);

  if (bRadius === 'leaf') {
    style.borderRadius = '14px 3px 14px 3px';
  } else if (bRadius === 'petal') {
    style.borderRadius = '16px 16px 2px 16px';
  } else if (bRadius === 'tab') {
    style.borderRadius = '10px 10px 2px 2px';
  } else if (bRadius === 'xl') {
    style.borderRadius = '16px';
  } else if (bRadius === 'lg') {
    style.borderRadius = '12px';
  } else if (bRadius === 'md') {
    style.borderRadius = '6px';
  } else if (bRadius === 'sm') {
    style.borderRadius = '4px';
  } else if (bRadius === 'xs') {
    style.borderRadius = '2px';
  } else if (bStyle === 'sketch' && bRadius === 'none') {
    style.borderRadius = '255px 15px 225px 15px/15px 225px 15px 255px';
  } else {
    style.borderRadius = '0px';
  }

  if (bStyle === 'none') {
    style.border = 'none';
  } else if (bStyle === 'double') {
    style.borderWidth = '3px';
    style.borderStyle = 'double';
    style.borderColor = borderColor;
  } else if (bStyle === 'gradient') {
    // Với button: Áp dụng đường viền kép tinh tế theo màu 1 & màu 2 mà không bao giờ ghi đè backgroundImage làm mất màu nền nút
    const color1 = borderColor;
    const color2 = normalizeColor(story.customBorderGradientColor2, '#ff6b9d');
    style.border = '1.5px solid transparent';
    style.boxShadow = `0 0 0 1px ${color1}, 0 0 6px ${color2}66`;
  } else {
    style.borderStyle = (bStyle === 'sketch' || bStyle === 'film' || bStyle === 'offset') ? 'solid' : (bStyle === 'stitched' || bStyle === 'dash-dot') ? 'dashed' : bStyle;
    style.borderWidth = bWidth === 'frame' || bWidth === 'bold' ? '3px' : bWidth === 'heavy' ? '2px' : '1px';
    style.borderColor = borderColor;
  }

  if (bGlow === 'soft') {
    style.boxShadow = `0 0 8px ${borderColor}44`;
  } else if (bGlow === 'neon') {
    style.boxShadow = `0 0 5px ${borderColor}, 0 0 12px ${borderColor}77`;
  } else if (bGlow === 'shadow') {
    style.boxShadow = `2px 2px 0px ${borderColor}`;
  } else if (bGlow === 'soft-depth') {
    style.boxShadow = `0 3px 6px ${borderColor}44`;
  } else if (bGlow === 'gradient-aura') {
    const glow1 = normalizeColor(story.customBorderGlowColor1, '#ff6b9d');
    const glow2 = normalizeColor(story.customBorderGlowColor2, '#38bdf8');
    style.boxShadow = `0 0 10px ${glow1}55, 0 0 15px ${glow2}44`;
  } else if (bGlow === 'isometric') {
    style.boxShadow = `2px 2px 0px ${borderColor}, 4px 4px 0px ${borderColor}55`;
  }

  return style;
}

/**
 * Component hiển thị họa tiết trang trí 4 góc viền
 */
export const StoryCornerAccents: React.FC<{
  accent?: Story['borderCornerAccent'];
  borderColor?: string;
  color?: string;
  className?: string;
}> = ({ accent = 'none', borderColor, color, className = '' }) => {
  if (!accent || accent === 'none') return null;

  const accentColor = color || borderColor || '#e0c0cc';

  // 1. Khung góc chữ L
  if (accent === 'brackets') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5" style={{ borderTop: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}` }} />
        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5" style={{ borderTop: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` }} />
        <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5" style={{ borderBottom: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}` }} />
        <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5" style={{ borderBottom: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` }} />
      </div>
    );
  }

  // 2. Hoa văn hoàng gia quý tộc (Baroque / Royal Filigree cổ điển châu Âu)
  if (accent === 'vintage') {
    const svgDim = 46;
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        {/* Top Left */}
        <svg width={svgDim} height={svgDim} viewBox="0 0 50 50" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute top-0.5 left-0.5">
          {/* Outer Corner Frame */}
          <path d="M2 2 H46 M2 2 V46" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 6 H36 M6 6 V36" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2" />
          {/* Baroque Curves */}
          <path d="M8 8 C18 8 26 16 26 26 C26 36 34 42 44 42" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M8 20 C16 20 18 10 10 8" strokeLinecap="round" />
          <path d="M20 8 C20 16 10 18 8 10" strokeLinecap="round" />
          <path d="M14 30 C18 24 24 24 30 14" strokeLinecap="round" />
          {/* Fleur-de-lis Royal Accent */}
          <path d="M12 12 C16 9 19 14 14 17 C11 15 11 13 12 12 Z" fill={accentColor} fillOpacity="0.4" />
          <circle cx="26" cy="26" r="2.2" fill={accentColor} />
          <circle cx="8" cy="8" r="2.5" fill={accentColor} />
          <circle cx="38" cy="8" r="1.6" fill={accentColor} />
          <circle cx="8" cy="38" r="1.6" fill={accentColor} />
          <circle cx="44" cy="42" r="1.8" fill={accentColor} />
        </svg>
        {/* Top Right */}
        <svg width={svgDim} height={svgDim} viewBox="0 0 50 50" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute top-0.5 right-0.5" style={{ transform: 'scaleX(-1)' }}>
          <path d="M2 2 H46 M2 2 V46" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 6 H36 M6 6 V36" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2" />
          <path d="M8 8 C18 8 26 16 26 26 C26 36 34 42 44 42" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M8 20 C16 20 18 10 10 8" strokeLinecap="round" />
          <path d="M20 8 C20 16 10 18 8 10" strokeLinecap="round" />
          <path d="M14 30 C18 24 24 24 30 14" strokeLinecap="round" />
          <path d="M12 12 C16 9 19 14 14 17 C11 15 11 13 12 12 Z" fill={accentColor} fillOpacity="0.4" />
          <circle cx="26" cy="26" r="2.2" fill={accentColor} />
          <circle cx="8" cy="8" r="2.5" fill={accentColor} />
          <circle cx="38" cy="8" r="1.6" fill={accentColor} />
          <circle cx="8" cy="38" r="1.6" fill={accentColor} />
          <circle cx="44" cy="42" r="1.8" fill={accentColor} />
        </svg>
        {/* Bottom Left */}
        <svg width={svgDim} height={svgDim} viewBox="0 0 50 50" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute bottom-0.5 left-0.5" style={{ transform: 'scaleY(-1)' }}>
          <path d="M2 2 H46 M2 2 V46" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 6 H36 M6 6 V36" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2" />
          <path d="M8 8 C18 8 26 16 26 26 C26 36 34 42 44 42" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M8 20 C16 20 18 10 10 8" strokeLinecap="round" />
          <path d="M20 8 C20 16 10 18 8 10" strokeLinecap="round" />
          <path d="M14 30 C18 24 24 24 30 14" strokeLinecap="round" />
          <path d="M12 12 C16 9 19 14 14 17 C11 15 11 13 12 12 Z" fill={accentColor} fillOpacity="0.4" />
          <circle cx="26" cy="26" r="2.2" fill={accentColor} />
          <circle cx="8" cy="8" r="2.5" fill={accentColor} />
          <circle cx="38" cy="8" r="1.6" fill={accentColor} />
          <circle cx="8" cy="38" r="1.6" fill={accentColor} />
          <circle cx="44" cy="42" r="1.8" fill={accentColor} />
        </svg>
        {/* Bottom Right */}
        <svg width={svgDim} height={svgDim} viewBox="0 0 50 50" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute bottom-0.5 right-0.5" style={{ transform: 'scale(-1, -1)' }}>
          <path d="M2 2 H46 M2 2 V46" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 6 H36 M6 6 V36" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2" />
          <path d="M8 8 C18 8 26 16 26 26 C26 36 34 42 44 42" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M8 20 C16 20 18 10 10 8" strokeLinecap="round" />
          <path d="M20 8 C20 16 10 18 8 10" strokeLinecap="round" />
          <path d="M14 30 C18 24 24 24 30 14" strokeLinecap="round" />
          <path d="M12 12 C16 9 19 14 14 17 C11 15 11 13 12 12 Z" fill={accentColor} fillOpacity="0.4" />
          <circle cx="26" cy="26" r="2.2" fill={accentColor} />
          <circle cx="8" cy="8" r="2.5" fill={accentColor} />
          <circle cx="38" cy="8" r="1.6" fill={accentColor} />
          <circle cx="8" cy="38" r="1.6" fill={accentColor} />
          <circle cx="44" cy="42" r="1.8" fill={accentColor} />
        </svg>
      </div>
    );
  }

  // 3. Art Deco hình học
  if (accent === 'artdeco') {
    const dim = 30;
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.5" className="absolute top-1 left-1">
          <path d="M2 2 H30 M2 2 V30 M6 6 H24 M6 6 V24 M10 10 H18 M10 10 V18" />
          <polygon points="2,2 10,2 2,10" fill={accentColor} opacity="0.3" />
        </svg>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.5" className="absolute top-1 right-1" style={{ transform: 'scaleX(-1)' }}>
          <path d="M2 2 H30 M2 2 V30 M6 6 H24 M6 6 V24 M10 10 H18 M10 10 V18" />
          <polygon points="2,2 10,2 2,10" fill={accentColor} opacity="0.3" />
        </svg>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.5" className="absolute bottom-1 left-1" style={{ transform: 'scaleY(-1)' }}>
          <path d="M2 2 H30 M2 2 V30 M6 6 H24 M6 6 V24 M10 10 H18 M10 10 V18" />
          <polygon points="2,2 10,2 2,10" fill={accentColor} opacity="0.3" />
        </svg>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.5" className="absolute bottom-1 right-1" style={{ transform: 'scale(-1, -1)' }}>
          <path d="M2 2 H30 M2 2 V30 M6 6 H24 M6 6 V24 M10 10 H18 M10 10 V18" />
          <polygon points="2,2 10,2 2,10" fill={accentColor} opacity="0.3" />
        </svg>
      </div>
    );
  }

  // 4. Băng dính dán góc (Washi Tape) - Tràn ra ngoài nền sau, viền răng cưa chân thực
  if (accent === 'washi') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-20 ${className}`}>
        {/* Top-Left Washi Tape */}
        <div
          className="absolute -top-3.5 -left-5.5 w-16 h-6 opacity-90 shadow-md transform -rotate-28 border border-white/25"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
            clipPath: 'polygon(0% 15%, 4% 0%, 8% 18%, 12% 2%, 96% 0%, 100% 18%, 97% 85%, 100% 100%, 94% 88%, 90% 98%, 0% 100%)',
          }}
        />
        {/* Top-Right Washi Tape */}
        <div
          className="absolute -top-3.5 -right-5.5 w-16 h-6 opacity-90 shadow-md transform rotate-28 border border-white/25"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
            clipPath: 'polygon(0% 0%, 96% 2%, 100% 15%, 97% 85%, 100% 100%, 8% 100%, 4% 85%, 0% 100%, 3% 85%, 0% 15%)',
          }}
        />
        {/* Bottom-Left Washi Tape */}
        <div
          className="absolute -bottom-3.5 -left-5.5 w-16 h-6 opacity-90 shadow-md transform rotate-28 border border-white/25"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
            clipPath: 'polygon(0% 15%, 4% 0%, 8% 18%, 12% 2%, 96% 0%, 100% 18%, 97% 85%, 100% 100%, 94% 88%, 90% 98%, 0% 100%)',
          }}
        />
        {/* Bottom-Right Washi Tape */}
        <div
          className="absolute -bottom-3.5 -right-5.5 w-16 h-6 opacity-90 shadow-md transform -rotate-28 border border-white/25"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
            clipPath: 'polygon(0% 0%, 96% 2%, 100% 15%, 97% 85%, 100% 100%, 8% 100%, 4% 85%, 0% 100%, 3% 85%, 0% 15%)',
          }}
        />
      </div>
    );
  }

  // 5. Ngôi sao lấp lánh
  if (accent === 'sparkle') {
    const starDim = 22;
    const renderStar = (posClass: string) => (
      <svg width={starDim} height={starDim} viewBox="0 0 24 24" fill={accentColor} className={`absolute ${posClass} filter drop-shadow-xs`}>
        <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
        <circle cx="18" cy="6" r="1.5" fill={accentColor} opacity="0.7" />
      </svg>
    );
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        {renderStar('top-1 left-1')}
        {renderStar('top-1 right-1')}
        {renderStar('bottom-1 left-1')}
        {renderStar('bottom-1 right-1')}
      </div>
    );
  }

  // 6. Trái tim ngọt ngào
  if (accent === 'heart') {
    const heartDim = 20;
    const renderHeart = (posClass: string, rot: string) => (
      <svg width={heartDim} height={heartDim} viewBox="0 0 24 24" fill={accentColor} className={`absolute ${posClass} ${rot} filter drop-shadow-xs opacity-90`}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        {renderHeart('top-1.5 left-1.5', '-rotate-12')}
        {renderHeart('top-1.5 right-1.5', 'rotate-12')}
        {renderHeart('bottom-1.5 left-1.5', 'rotate-12')}
        {renderHeart('bottom-1.5 right-1.5', '-rotate-12')}
      </div>
    );
  }

  // 7. Cành lá hoa cỏ - Nhánh dây leo mềm mại, phiến lá gân và hoa nở rực rỡ
  if (accent === 'botanical') {
    const dim = 44;
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        {/* Top Left */}
        <svg width={dim} height={dim} viewBox="0 0 45 45" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute top-0.5 left-0.5">
          {/* Main stem */}
          <path d="M3 42 C6 24 18 14 42 3" strokeWidth="1.5" strokeLinecap="round" />
          {/* Left leaf */}
          <path d="M14 26 C8 24 7 16 16 18 C20 20 18 27 14 26 Z" fill={accentColor} fillOpacity="0.4" />
          <path d="M12 22 L17 19" strokeWidth="0.8" />
          {/* Right leaf */}
          <path d="M26 14 C24 8 16 7 18 16 C20 20 27 18 26 14 Z" fill={accentColor} fillOpacity="0.4" />
          <path d="M22 12 L19 17" strokeWidth="0.8" />
          {/* Side buds & tendrils */}
          <path d="M8 34 C4 30 6 26 10 28" strokeLinecap="round" />
          <circle cx="8" cy="30" r="1.5" fill={accentColor} />
          <path d="M34 8 C30 4 26 6 28 10" strokeLinecap="round" />
          <circle cx="30" cy="8" r="1.5" fill={accentColor} />
          {/* Blooming Flower at the tip */}
          <circle cx="40" cy="5" r="3.2" fill={accentColor} fillOpacity="0.75" />
          <circle cx="40" cy="5" r="1.2" fill="#ffffff" />
          {/* Little floral dots */}
          <circle cx="20" cy="24" r="1.2" fill={accentColor} />
          <circle cx="24" cy="20" r="1.2" fill={accentColor} />
        </svg>
        {/* Top Right */}
        <svg width={dim} height={dim} viewBox="0 0 45 45" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute top-0.5 right-0.5" style={{ transform: 'scaleX(-1)' }}>
          <path d="M3 42 C6 24 18 14 42 3" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 26 C8 24 7 16 16 18 C20 20 18 27 14 26 Z" fill={accentColor} fillOpacity="0.4" />
          <path d="M12 22 L17 19" strokeWidth="0.8" />
          <path d="M26 14 C24 8 16 7 18 16 C20 20 27 18 26 14 Z" fill={accentColor} fillOpacity="0.4" />
          <path d="M22 12 L19 17" strokeWidth="0.8" />
          <path d="M8 34 C4 30 6 26 10 28" strokeLinecap="round" />
          <circle cx="8" cy="30" r="1.5" fill={accentColor} />
          <path d="M34 8 C30 4 26 6 28 10" strokeLinecap="round" />
          <circle cx="30" cy="8" r="1.5" fill={accentColor} />
          <circle cx="40" cy="5" r="3.2" fill={accentColor} fillOpacity="0.75" />
          <circle cx="40" cy="5" r="1.2" fill="#ffffff" />
          <circle cx="20" cy="24" r="1.2" fill={accentColor} />
          <circle cx="24" cy="20" r="1.2" fill={accentColor} />
        </svg>
        {/* Bottom Left */}
        <svg width={dim} height={dim} viewBox="0 0 45 45" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute bottom-0.5 left-0.5" style={{ transform: 'scaleY(-1)' }}>
          <path d="M3 42 C6 24 18 14 42 3" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 26 C8 24 7 16 16 18 C20 20 18 27 14 26 Z" fill={accentColor} fillOpacity="0.4" />
          <path d="M12 22 L17 19" strokeWidth="0.8" />
          <path d="M26 14 C24 8 16 7 18 16 C20 20 27 18 26 14 Z" fill={accentColor} fillOpacity="0.4" />
          <path d="M22 12 L19 17" strokeWidth="0.8" />
          <path d="M8 34 C4 30 6 26 10 28" strokeLinecap="round" />
          <circle cx="8" cy="30" r="1.5" fill={accentColor} />
          <path d="M34 8 C30 4 26 6 28 10" strokeLinecap="round" />
          <circle cx="30" cy="8" r="1.5" fill={accentColor} />
          <circle cx="40" cy="5" r="3.2" fill={accentColor} fillOpacity="0.75" />
          <circle cx="40" cy="5" r="1.2" fill="#ffffff" />
          <circle cx="20" cy="24" r="1.2" fill={accentColor} />
          <circle cx="24" cy="20" r="1.2" fill={accentColor} />
        </svg>
        {/* Bottom Right */}
        <svg width={dim} height={dim} viewBox="0 0 45 45" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute bottom-0.5 right-0.5" style={{ transform: 'scale(-1, -1)' }}>
          <path d="M3 42 C6 24 18 14 42 3" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 26 C8 24 7 16 16 18 C20 20 18 27 14 26 Z" fill={accentColor} fillOpacity="0.4" />
          <path d="M12 22 L17 19" strokeWidth="0.8" />
          <path d="M26 14 C24 8 16 7 18 16 C20 20 27 18 26 14 Z" fill={accentColor} fillOpacity="0.4" />
          <path d="M22 12 L19 17" strokeWidth="0.8" />
          <path d="M8 34 C4 30 6 26 10 28" strokeLinecap="round" />
          <circle cx="8" cy="30" r="1.5" fill={accentColor} />
          <path d="M34 8 C30 4 26 6 28 10" strokeLinecap="round" />
          <circle cx="30" cy="8" r="1.5" fill={accentColor} />
          <circle cx="40" cy="5" r="3.2" fill={accentColor} fillOpacity="0.75" />
          <circle cx="40" cy="5" r="1.2" fill="#ffffff" />
          <circle cx="20" cy="24" r="1.2" fill={accentColor} />
          <circle cx="24" cy="20" r="1.2" fill={accentColor} />
        </svg>
      </div>
    );
  }

  // 8. Nơ thắt ruy băng
  if (accent === 'bow') {
    const dim = 24;
    const renderBow = (posClass: string) => (
      <svg width={dim} height={dim} viewBox="0 0 24 24" fill={accentColor} className={`absolute ${posClass} filter drop-shadow-xs opacity-90`}>
        <path d="M12 10 C9 6 4 6 5 10 C6 13 10 11 12 12 C14 11 18 13 19 10 C20 6 15 6 12 10 Z" />
        <circle cx="12" cy="11" r="2" fill="#ffffff" opacity="0.6" />
        <path d="M11 13 L8 20 M13 13 L16 20" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        {renderBow('top-1 left-1')}
        {renderBow('top-1 right-1')}
        {renderBow('bottom-1 left-1')}
        {renderBow('bottom-1 right-1')}
      </div>
    );
  }

  // 9. Kẹp giấy kim loại (Paperclip) - To bản, 3 vòng thép kim loại uốn chữ U chân thực, bóng đổ 3D sâu
  if (accent === 'paperclip') {
    return (
      <div className={`pointer-events-none absolute inset-0 z-20 ${className}`}>
        {/* Left clip */}
        <div className="absolute -top-5.5 left-8 rotate-12 filter drop-shadow-lg">
          <svg width="28" height="46" viewBox="0 0 28 46" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* 3 metallic looped turns of standard paperclip */}
            <path d="M10 14 V32 C10 38 20 38 20 32 V8 C20 2 4 2 4 10 V34 C4 44 24 44 24 34 V16" />
          </svg>
        </div>
        {/* Right clip */}
        <div className="absolute -top-5.5 right-8 -rotate-12 filter drop-shadow-lg">
          <svg width="28" height="46" viewBox="0 0 28 46" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 14 V32 C10 38 20 38 20 32 V8 C20 2 4 2 4 10 V34 C4 44 24 44 24 34 V16" />
          </svg>
        </div>
      </div>
    );
  }

  // 10. Đinh tán kim loại
  if (accent === 'rivets') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center" style={{ backgroundColor: accentColor }}>
          <div className="w-[65%] h-[1px] bg-black/70 rotate-45" />
        </div>
        <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center" style={{ backgroundColor: accentColor }}>
          <div className="w-[65%] h-[1px] bg-black/70 -rotate-45" />
        </div>
        <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center" style={{ backgroundColor: accentColor }}>
          <div className="w-[65%] h-[1px] bg-black/70 -rotate-45" />
        </div>
        <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center" style={{ backgroundColor: accentColor }}>
          <div className="w-[65%] h-[1px] bg-black/70 rotate-45" />
        </div>
      </div>
    );
  }

  // 11. Chấm định vị
  if (accent === 'dots') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: accentColor }} />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: accentColor }} />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: accentColor }} />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: accentColor }} />
      </div>
    );
  }

  // 12. Dấu chữ thập tâm điểm
  if (accent === 'crosshairs') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute top-1.5 left-1.5 w-3 h-3 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
        <div className="absolute top-1.5 right-1.5 w-3 h-3 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
      </div>
    );
  }

  return null;
};
