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
  { value: 'solid', label: 'Nét liền (Solid)', desc: 'Đường nét thẳng chuẩn mực, tinh tế', category: 'classic' },
  { value: 'double', label: 'Viền đôi (Double)', desc: 'Hai đường song song sang trọng', category: 'classic' },
  { value: 'dashed', label: 'Nét đứt (Dashed)', desc: 'Nét đứt khúc thủ công ấn tượng', category: 'classic' },
  { value: 'dotted', label: 'Chấm bi (Dotted)', desc: 'Hàng chấm tròn nhỏ tinh tế', category: 'classic' },
  { value: 'dash-dot', label: 'Gạch chấm xen kẽ (Dash-Dot)', desc: 'Phong cách Morse code cổ điển', category: 'creative' },
  { value: 'sketch', label: 'Nét vẽ tay Canva (Hand Sketch)', desc: 'Nét phác thảo uốn lượn tự nhiên', category: 'creative' },
  { value: 'stitched', label: 'Đường may chỉ (Stitched)', desc: 'Đường chỉ thêu thủ công vintage', category: 'creative' },
  { value: 'gradient', label: 'Viền Gradient đa sắc', desc: 'Dải màu chuyển động rực rỡ Canva', category: 'creative' },
  { value: 'stamp', label: 'Viền tem thư (Postage Stamp)', desc: 'Răng cưa viền tem bưu chính cổ điển', category: 'retro' },
  { value: 'film', label: 'Khung cuộn phim (Film Strip)', desc: 'Lỗ răng cưa cuộn phim điện ảnh', category: 'retro' },
  { value: 'groove', label: 'Rãnh chìm 3D (Groove)', desc: 'Đường rãnh khắc chìm chiều sâu', category: 'classic' },
  { value: 'ridge', label: 'Sống nổi 3D (Ridge)', desc: 'Gờ sống viền nổi 3D tinh xảo', category: 'classic' },
  { value: 'offset', label: 'Viền đôi lệch tầng (Double Offset)', desc: 'Hiệu ứng xếp lớp đa tầng 3D', category: 'creative' },
  { value: 'none', label: 'Không viền (None)', desc: 'Tối giản hoàn toàn không đường viền', category: 'classic' },
];

export const BORDER_WIDTH_OPTIONS: BorderWidthOption[] = [
  { value: 'thin', label: 'Siêu mảnh (1px)', widthPx: 1 },
  { value: 'medium', label: 'Vừa vặn (2px)', widthPx: 2 },
  { value: 'thick', label: 'Dày rõ nét (3px)', widthPx: 3 },
  { value: 'heavy', label: 'Đậm đà (4px)', widthPx: 4 },
  { value: 'bold', label: 'Siêu đậm (6px)', widthPx: 6 },
  { value: 'frame', label: 'Khung tranh (8px)', widthPx: 8 },
];

export const BORDER_RADIUS_OPTIONS: BorderRadiusOption[] = [
  { value: 'none', label: 'Vuông vức (0px)', desc: 'Góc vuông sắc cạnh' },
  { value: 'xs', label: 'Bo vi mô (2px)', desc: 'Bo góc cực nhỏ tinh tế' },
  { value: 'sm', label: 'Bo nhẹ (4px)', desc: 'Mềm mại thanh lịch vừa phải' },
  { value: 'md', label: 'Bo vừa chuẩn (8px)', desc: 'Chuẩn giao diện hiện đại' },
  { value: 'lg', label: 'Bo tròn lớn (16px)', desc: 'Mềm mại và thân thiện' },
  { value: 'xl', label: 'Bo siêu mềm (24px)', desc: 'Phong cách bo tròn Canva trẻ trung' },
  { value: 'pill', label: 'Viên thuốc (Pill/Capsule)', desc: 'Bo tròn tối đa dạng viên thuốc' },
  { value: 'leaf', label: 'Góc lá chéo (Leaf)', desc: 'Bo 2 góc chéo bất đối xứng độc đáo' },
  { value: 'chamfer', label: 'Vát góc 45° (Chamfer)', desc: 'Vát góc đa giác phong cách hình học' },
  { value: 'ticket', label: 'Khuyết góc vé (Ticket Notch)', desc: 'Khuyết góc vé xem phim cổ điển' },
  { value: 'petal', label: 'Cánh hoa (Petal)', desc: 'Dáng cánh hoa 1 góc nhọn mềm mại' },
  { value: 'tab', label: 'Thẻ Tab trên (Folder Tab)', desc: 'Bo tròn phía trên dạng kẹp hồ sơ' },
];

export const BORDER_CORNER_ACCENT_OPTIONS: BorderCornerAccentOption[] = [
  { value: 'none', label: 'Không góc trang trí', desc: 'Viền thuần túy', category: 'tech' },
  { value: 'brackets', label: 'Khung góc thước L', desc: 'Khung ngắm chữ L sắc nét ở 4 góc', category: 'tech' },
  { value: 'vintage', label: 'Hoa văn hoàng gia (Filigree)', desc: 'Họa tiết hoa văn cuộn quý tộc ở 4 góc', category: 'vintage' },
  { value: 'artdeco', label: 'Art Deco hình học', desc: 'Họa tiết góc Art Deco xếp tầng sang trọng', category: 'vintage' },
  { value: 'rivets', label: 'Đinh tán kim loại', desc: '4 chốt đinh ốc kim loại ở 4 góc', category: 'tech' },
  { value: 'dots', label: 'Chấm định vị', desc: '4 chấm tròn nhỏ tinh tế ở 4 góc', category: 'tech' },
  { value: 'crosshairs', label: 'Dấu chữ thập tâm điểm', desc: '4 dấu chữ thập giao điểm ở 4 góc', category: 'tech' },
  { value: 'washi', label: 'Băng dính Washi Tape', desc: 'Băng keo dán giấy trang trí phong cách Canva', category: 'craft' },
  { value: 'sparkle', label: 'Ngôi sao lấp lánh 4 cánh', desc: 'Họa tiết ngôi sao tỏa sáng tinh nghịch', category: 'cute' },
  { value: 'heart', label: 'Trái tim ngọt ngào', desc: 'Họa tiết trái tim nhỏ nhắn đáng yêu', category: 'cute' },
  { value: 'botanical', label: 'Cành lá hoa cỏ', desc: 'Họa tiết cành lá & hoa anh đào thiên nhiên', category: 'vintage' },
  { value: 'bow', label: 'Nơ thắt ruy băng', desc: 'Nơ ruy băng mềm mại ở các góc', category: 'cute' },
  { value: 'paperclip', label: 'Kẹp giấy kim loại', desc: 'Kẹp giấy văn phòng gắn ở góc khung', category: 'craft' },
];

export const BORDER_GLOW_OPTIONS: BorderGlowOption[] = [
  { value: 'none', label: 'Không hiệu ứng', desc: 'Màu viền nguyên bản' },
  { value: 'soft', label: 'Hào quang dịu (Soft Glow)', desc: 'Tỏa ánh sáng nhẹ nhàng êm mắt' },
  { value: 'neon', label: 'Phát sáng Neon (Neon Glow)', desc: 'Ánh sáng neon viễn tưởng nổi bật' },
  { value: 'shadow', label: 'Đổ bóng khối Pop-Art (Retro)', desc: 'Bóng khối cứng phong cách Canva Pop Art' },
  { value: 'soft-depth', label: 'Đổ bóng đa tầng (Soft Depth)', desc: 'Bóng mềm nhiều lớp có chiều sâu chân thực' },
  { value: 'gradient-aura', label: 'Hào quang Gradient (Aura)', desc: 'Vầng hào quang chuyển sắc rực rỡ' },
  { value: 'isometric', label: 'Khối nổi 3D (Isometric)', desc: 'Hiệu ứng gờ nổi khối 3D đa hướng' },
];

function normalizeColor(color: string): string {
  if (!color) return '#5e2f46';
  return color;
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
  const borderColor = normalizeColor(story.customBorderColor || fallbackBorderColor);
  const strokeWidth = WIDTH_MAP[bWidth] || '1px';

  // 1. Border Style & Width
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
  } else if (bStyle === 'dash-dot') {
    style.borderWidth = strokeWidth;
    style.borderStyle = 'dashed';
    style.borderColor = borderColor;
    style.backgroundImage = `radial-gradient(circle, ${borderColor} 35%, transparent 40%)`;
    style.backgroundSize = '12px 12px';
  } else if (bStyle === 'sketch') {
    // Hand-drawn sketch: viền không đều với shadow vẽ tay
    style.borderWidth = strokeWidth;
    style.borderStyle = 'solid';
    style.borderColor = borderColor;
    style.boxShadow = `2px 1px 0px ${borderColor}88, -1px 2px 0px ${borderColor}55`;
    style.filter = 'drop-shadow(0px 1px 2px rgba(0,0,0,0.25))';
  } else if (bStyle === 'stitched') {
    // Stitched: viền chỉ khâu viền cách mép
    style.borderWidth = strokeWidth;
    style.borderStyle = 'dashed';
    style.borderColor = borderColor;
    style.outline = `1px solid ${borderColor}55`;
    style.outlineOffset = '3px';
  } else if (bStyle === 'gradient') {
    // Canva Gradient Border
    style.borderWidth = strokeWidth;
    style.borderStyle = 'solid';
    style.borderImageSource = `linear-gradient(135deg, ${borderColor}, #ff6b9d, #c084fc, #38bdf8, ${borderColor})`;
    style.borderImageSlice = '1';
  } else if (bStyle === 'stamp') {
    // Postage Stamp: răng cưa mép
    style.borderWidth = strokeWidth;
    style.borderStyle = 'dotted';
    style.borderColor = borderColor;
    style.boxShadow = `inset 0 0 0 2px ${borderColor}44, 0 2px 8px rgba(0,0,0,0.3)`;
  } else if (bStyle === 'film') {
    // Film strip: khung phim cổ điển
    style.borderWidth = strokeWidth;
    style.borderStyle = 'solid';
    style.borderColor = borderColor;
    style.boxShadow = `inset 0 4px 0 ${borderColor}55, inset 0 -4px 0 ${borderColor}55, inset 4px 0 0 ${borderColor}33, inset -4px 0 0 ${borderColor}33`;
  } else if (bStyle === 'offset') {
    // Double Offset frame
    style.borderWidth = strokeWidth;
    style.borderStyle = 'solid';
    style.borderColor = borderColor;
    style.boxShadow = `4px 4px 0px 0px ${borderColor}88, 7px 7px 0px 0px ${borderColor}44`;
  } else {
    style.borderStyle = bStyle;
    style.borderWidth = strokeWidth;
    style.borderColor = borderColor;
  }

  // 2. Border Radius & Shape
  if (bRadius === 'leaf') {
    style.borderRadius = '24px 4px 24px 4px';
  } else if (bRadius === 'chamfer') {
    style.borderRadius = '12px';
    style.clipPath = 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)';
  } else if (bRadius === 'ticket') {
    style.borderRadius = '10px';
    style.maskImage = 'radial-gradient(circle at top left, transparent 8px, black 8.5px), radial-gradient(circle at top right, transparent 8px, black 8.5px), radial-gradient(circle at bottom left, transparent 8px, black 8.5px), radial-gradient(circle at bottom right, transparent 8px, black 8.5px)';
    style.maskComposite = 'intersect';
  } else if (bRadius === 'petal') {
    style.borderRadius = '28px 28px 4px 28px';
  } else if (bRadius === 'tab') {
    style.borderRadius = '16px 16px 4px 4px';
  } else if (bRadius === 'pill') {
    style.borderRadius = '9999px';
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
  } else {
    style.borderRadius = '0px';
  }

  // 3. Border Glow / Shadow
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
      style.boxShadow = `0 0 20px #ff6b9d66, 0 0 35px #c084fc55, 0 0 50px #38bdf844`;
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
  const borderColor = normalizeColor(story.customBorderColor || fallbackBorderColor);

  if (bStyle === 'none') {
    style.border = 'none';
  } else if (bStyle === 'double') {
    style.borderWidth = '3px';
    style.borderStyle = 'double';
    style.borderColor = borderColor;
  } else if (bStyle === 'gradient') {
    style.borderWidth = '2px';
    style.borderStyle = 'solid';
    style.borderImageSource = `linear-gradient(135deg, ${borderColor}, #ff6b9d, #38bdf8)`;
    style.borderImageSlice = '1';
  } else {
    style.borderStyle = (bStyle === 'sketch' || bStyle === 'film' || bStyle === 'offset') ? 'solid' : (bStyle === 'stitched' || bStyle === 'dash-dot') ? 'dashed' : bStyle;
    style.borderWidth = bWidth === 'frame' || bWidth === 'bold' ? '3px' : bWidth === 'heavy' ? '2px' : '1px';
    style.borderColor = borderColor;
  }

  if (bRadius === 'leaf') {
    style.borderRadius = '14px 3px 14px 3px';
  } else if (bRadius === 'pill') {
    style.borderRadius = '9999px';
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
  } else {
    style.borderRadius = '0px';
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
    style.boxShadow = `0 0 10px #ff6b9d55, 0 0 15px #38bdf844`;
  } else if (bGlow === 'isometric') {
    style.boxShadow = `2px 2px 0px ${borderColor}, 4px 4px 0px ${borderColor}55`;
  }

  return style;
}

/**
 * Component hiển thị họa tiết trang trí 4 góc viền phong cách Canva
 */
export const StoryCornerAccents: React.FC<{
  accent?: Story['borderCornerAccent'];
  borderColor?: string;
  color?: string;
  className?: string;
}> = ({ accent = 'none', borderColor, color, className = '' }) => {
  if (!accent || accent === 'none') return null;

  const accentColor = color || borderColor || '#e0c0cc';

  // 1. Khung góc chữ L (Brackets)
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

  // 2. Hoa văn hoàng gia cổ điển (Royal Vintage Filigree)
  if (accent === 'vintage') {
    const svgDim = 34;
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <svg width={svgDim} height={svgDim} viewBox="0 0 40 40" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute top-1 left-1">
          <path d="M2 2 H38 M2 2 V38" strokeWidth="2" />
          <path d="M6 6 C16 6 22 12 22 22 C22 32 28 34 38 34" strokeLinecap="round" />
          <path d="M6 14 C12 14 16 10 16 6 M14 6 C14 12 10 16 6 16" strokeLinecap="round" />
          <circle cx="6" cy="6" r="2" fill={accentColor} />
          <circle cx="18" cy="18" r="1.5" fill={accentColor} />
          <circle cx="28" cy="8" r="1.2" fill={accentColor} />
          <circle cx="8" cy="28" r="1.2" fill={accentColor} />
        </svg>
        <svg width={svgDim} height={svgDim} viewBox="0 0 40 40" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute top-1 right-1" style={{ transform: 'scaleX(-1)' }}>
          <path d="M2 2 H38 M2 2 V38" strokeWidth="2" />
          <path d="M6 6 C16 6 22 12 22 22 C22 32 28 34 38 34" strokeLinecap="round" />
          <path d="M6 14 C12 14 16 10 16 6 M14 6 C14 12 10 16 6 16" strokeLinecap="round" />
          <circle cx="6" cy="6" r="2" fill={accentColor} />
          <circle cx="18" cy="18" r="1.5" fill={accentColor} />
          <circle cx="28" cy="8" r="1.2" fill={accentColor} />
          <circle cx="8" cy="28" r="1.2" fill={accentColor} />
        </svg>
        <svg width={svgDim} height={svgDim} viewBox="0 0 40 40" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute bottom-1 left-1" style={{ transform: 'scaleY(-1)' }}>
          <path d="M2 2 H38 M2 2 V38" strokeWidth="2" />
          <path d="M6 6 C16 6 22 12 22 22 C22 32 28 34 38 34" strokeLinecap="round" />
          <path d="M6 14 C12 14 16 10 16 6 M14 6 C14 12 10 16 6 16" strokeLinecap="round" />
          <circle cx="6" cy="6" r="2" fill={accentColor} />
          <circle cx="18" cy="18" r="1.5" fill={accentColor} />
          <circle cx="28" cy="8" r="1.2" fill={accentColor} />
          <circle cx="8" cy="28" r="1.2" fill={accentColor} />
        </svg>
        <svg width={svgDim} height={svgDim} viewBox="0 0 40 40" fill="none" stroke={accentColor} strokeWidth="1.3" className="absolute bottom-1 right-1" style={{ transform: 'scale(-1, -1)' }}>
          <path d="M2 2 H38 M2 2 V38" strokeWidth="2" />
          <path d="M6 6 C16 6 22 12 22 22 C22 32 28 34 38 34" strokeLinecap="round" />
          <path d="M6 14 C12 14 16 10 16 6 M14 6 C14 12 10 16 6 16" strokeLinecap="round" />
          <circle cx="6" cy="6" r="2" fill={accentColor} />
          <circle cx="18" cy="18" r="1.5" fill={accentColor} />
          <circle cx="28" cy="8" r="1.2" fill={accentColor} />
          <circle cx="8" cy="28" r="1.2" fill={accentColor} />
        </svg>
      </div>
    );
  }

  // 3. Art Deco hình học mạ vàng (Art Deco Geometric)
  if (accent === 'artdeco') {
    const dim = 28;
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

  // 4. Băng dính Washi Tape Canva (Masking Tape)
  if (accent === 'washi') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        {/* Top-Left Washi Tape */}
        <div
          className="absolute -top-1.5 -left-3 w-10 h-3.5 opacity-85 shadow-sm transform -rotate-30 border border-white/20"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
          }}
        />
        {/* Top-Right Washi Tape */}
        <div
          className="absolute -top-1.5 -right-3 w-10 h-3.5 opacity-85 shadow-sm transform rotate-30 border border-white/20"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
          }}
        />
        {/* Bottom-Left Washi Tape */}
        <div
          className="absolute -bottom-1.5 -left-3 w-10 h-3.5 opacity-85 shadow-sm transform rotate-30 border border-white/20"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
          }}
        />
        {/* Bottom-Right Washi Tape */}
        <div
          className="absolute -bottom-1.5 -right-3 w-10 h-3.5 opacity-85 shadow-sm transform -rotate-30 border border-white/20"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
          }}
        />
      </div>
    );
  }

  // 5. Ngôi sao 4 cánh lấp lánh (Sparkle Stars)
  if (accent === 'sparkle') {
    const starDim = 20;
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

  // 6. Trái tim ngọt ngào (Cute Hearts)
  if (accent === 'heart') {
    const heartDim = 18;
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

  // 7. Cành lá hoa cỏ (Botanical Flowers)
  if (accent === 'botanical') {
    const dim = 26;
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.4" className="absolute top-1 left-1">
          <path d="M3 29 C6 18 16 10 29 3" strokeLinecap="round" />
          <path d="M12 18 C8 15 8 10 14 12 C18 14 16 20 12 18 Z" fill={accentColor} opacity="0.4" />
          <path d="M20 10 C18 6 22 4 25 7 C27 10 24 13 20 10 Z" fill={accentColor} opacity="0.4" />
          <circle cx="27" cy="5" r="2.5" fill={accentColor} />
        </svg>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.4" className="absolute top-1 right-1" style={{ transform: 'scaleX(-1)' }}>
          <path d="M3 29 C6 18 16 10 29 3" strokeLinecap="round" />
          <path d="M12 18 C8 15 8 10 14 12 C18 14 16 20 12 18 Z" fill={accentColor} opacity="0.4" />
          <path d="M20 10 C18 6 22 4 25 7 C27 10 24 13 20 10 Z" fill={accentColor} opacity="0.4" />
          <circle cx="27" cy="5" r="2.5" fill={accentColor} />
        </svg>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.4" className="absolute bottom-1 left-1" style={{ transform: 'scaleY(-1)' }}>
          <path d="M3 29 C6 18 16 10 29 3" strokeLinecap="round" />
          <path d="M12 18 C8 15 8 10 14 12 C18 14 16 20 12 18 Z" fill={accentColor} opacity="0.4" />
          <path d="M20 10 C18 6 22 4 25 7 C27 10 24 13 20 10 Z" fill={accentColor} opacity="0.4" />
          <circle cx="27" cy="5" r="2.5" fill={accentColor} />
        </svg>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.4" className="absolute bottom-1 right-1" style={{ transform: 'scale(-1, -1)' }}>
          <path d="M3 29 C6 18 16 10 29 3" strokeLinecap="round" />
          <path d="M12 18 C8 15 8 10 14 12 C18 14 16 20 12 18 Z" fill={accentColor} opacity="0.4" />
          <path d="M20 10 C18 6 22 4 25 7 C27 10 24 13 20 10 Z" fill={accentColor} opacity="0.4" />
          <circle cx="27" cy="5" r="2.5" fill={accentColor} />
        </svg>
      </div>
    );
  }

  // 8. Nơ thắt ruy băng (Ribbon Bows)
  if (accent === 'bow') {
    const dim = 22;
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

  // 9. Kẹp giấy kim loại (Paperclips)
  if (accent === 'paperclip') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <svg width="18" height="24" viewBox="0 0 24 32" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" className="absolute -top-1.5 left-4 rotate-12 drop-shadow-sm">
          <path d="M8 8 V22 C8 26 16 26 16 22 V6 C16 2 4 2 4 8 V24 C4 30 20 30 20 22 V10" />
        </svg>
        <svg width="18" height="24" viewBox="0 0 24 32" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" className="absolute -top-1.5 right-4 -rotate-12 drop-shadow-sm">
          <path d="M8 8 V22 C8 26 16 26 16 22 V6 C16 2 4 2 4 8 V24 C4 30 20 30 20 22 V10" />
        </svg>
      </div>
    );
  }

  // 10. Đinh tán kim loại (Rivets)
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

  // 11. Chấm định vị (Precision Dots)
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

  // 12. Dấu chữ thập tâm điểm (Crosshairs)
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
