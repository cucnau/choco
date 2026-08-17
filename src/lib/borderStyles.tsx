import React from 'react';
import { Story } from '../types';

export interface BorderStyleOption {
  value: NonNullable<Story['borderStyle']>;
  label: string;
  desc: string;
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
}

export interface BorderGlowOption {
  value: NonNullable<Story['borderGlow']>;
  label: string;
  desc: string;
}

export const BORDER_STYLE_OPTIONS: BorderStyleOption[] = [
  { value: 'solid', label: 'Nét liền (Solid)', desc: 'Đường nét thẳng đơn giản, chuẩn mực' },
  { value: 'double', label: 'Viền đôi (Double)', desc: 'Hai đường viền song song rõ nét' },
  { value: 'dashed', label: 'Nét đứt (Dashed)', desc: 'Đường nét đứt khúc phong cách thủ công' },
  { value: 'dotted', label: 'Chấm bi (Dotted)', desc: 'Chấm tròn nhỏ tinh tế liên tiếp' },
  { value: 'groove', label: 'Rãnh chìm (Groove)', desc: 'Hiệu ứng đường rãnh khắc chìm 3D' },
  { value: 'ridge', label: 'Sống nổi (Ridge)', desc: 'Hiệu ứng gờ sống viền nổi 3D' },
  { value: 'none', label: 'Không viền (None)', desc: 'Tối giản hoàn toàn không đường viền' },
];

export const BORDER_WIDTH_OPTIONS: BorderWidthOption[] = [
  { value: 'thin', label: 'Mảnh (1px)', widthPx: 1 },
  { value: 'medium', label: 'Vừa (2px)', widthPx: 2 },
  { value: 'thick', label: 'Dày (3px)', widthPx: 3 },
  { value: 'heavy', label: 'Đậm (4px)', widthPx: 4 },
];

export const BORDER_RADIUS_OPTIONS: BorderRadiusOption[] = [
  { value: 'none', label: 'Vuông vức (0px)', desc: 'Góc vuông sắc cạnh' },
  { value: 'xs', label: 'Bo góc nhẹ (2px)', desc: 'Bo góc cực nhỏ tinh tế' },
  { value: 'sm', label: 'Bo nhẹ (4px)', desc: 'Mềm mại thanh lịch vừa phải' },
  { value: 'md', label: 'Bo vừa (8px)', desc: 'Chuẩn giao diện hiện đại' },
  { value: 'lg', label: 'Bo tròn lớn (16px)', desc: 'Mềm mại và thân thiện' },
  { value: 'leaf', label: 'Góc lá chéo (Asymmetric)', desc: 'Bo 2 góc chéo bất đối xứng độc đáo' },
];

export const BORDER_CORNER_ACCENT_OPTIONS: BorderCornerAccentOption[] = [
  { value: 'none', label: 'Không góc trang trí', desc: 'Viền thuần túy' },
  { value: 'brackets', label: 'Khung góc chữ L', desc: 'Khung thước góc chữ L ở 4 góc' },
  { value: 'vintage', label: 'Hoa văn cổ điển', desc: 'Họa tiết hoa văn cuộn cổ điển ở 4 góc' },
  { value: 'rivets', label: 'Đinh tán kim loại', desc: '4 chốt đinh ốc kim loại ở 4 góc' },
  { value: 'dots', label: 'Chấm định vị', desc: '4 chấm tròn nhỏ tinh tế ở 4 góc' },
  { value: 'crosshairs', label: 'Dấu chữ thập', desc: '4 dấu chữ thập giao điểm ở 4 góc' },
];

export const BORDER_GLOW_OPTIONS: BorderGlowOption[] = [
  { value: 'none', label: 'Không hiệu ứng', desc: 'Màu viền nguyên bản' },
  { value: 'soft', label: 'Hào quang dịu (Soft Glow)', desc: 'Tỏa ánh sáng nhẹ nhàng êm mắt' },
  { value: 'neon', label: 'Phát sáng Neon (Neon Glow)', desc: 'Ánh sáng neon viễn tưởng nổi bật' },
  { value: 'shadow', label: 'Đổ bóng khối Retro (Hard Shadow)', desc: 'Bóng khối cứng phong cách retro' },
];

function normalizeColor(color: string): string {
  if (!color) return '#5e2f46';
  return color;
}

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

  // 1. Border Style & Width
  if (bStyle === 'none') {
    style.border = 'none';
  } else if (bStyle === 'groove') {
    const grooveWidthMap: Record<string, string> = {
      thin: '3px',
      medium: '4px',
      thick: '5px',
      heavy: '6px',
    };
    style.borderWidth = grooveWidthMap[bWidth] || '3px';
    style.borderStyle = 'groove';
    style.borderColor = borderColor;
    style.boxShadow = `inset 2px 2px 4px rgba(0,0,0,0.45), inset -1px -1px 2px rgba(255,255,255,0.15)`;
  } else if (bStyle === 'ridge') {
    const ridgeWidthMap: Record<string, string> = {
      thin: '3px',
      medium: '4px',
      thick: '5px',
      heavy: '6px',
    };
    style.borderWidth = ridgeWidthMap[bWidth] || '3px';
    style.borderStyle = 'ridge';
    style.borderColor = borderColor;
    style.boxShadow = `2px 2px 5px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.2)`;
  } else {
    style.borderStyle = bStyle;
    if (bStyle === 'double') {
      // border-style: double requires at least 3px to show 2 distinct lines
      const doubleWidthMap: Record<string, string> = {
        thin: '3px',
        medium: '4px',
        thick: '5px',
        heavy: '6px',
      };
      style.borderWidth = doubleWidthMap[bWidth] || '3px';
    } else {
      const widthMap: Record<string, string> = {
        thin: '1px',
        medium: '2px',
        thick: '3px',
        heavy: '4px',
      };
      style.borderWidth = widthMap[bWidth] || '1px';
    }
    style.borderColor = borderColor;
  }

  // 2. Border Radius
  if (bRadius === 'leaf') {
    style.borderRadius = '20px 4px 20px 4px';
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

  // 3. Border Glow / Shadow (khi không chọn groove / ridge)
  if (bStyle !== 'groove' && bStyle !== 'ridge') {
    if (bGlow === 'soft') {
      style.boxShadow = `0 0 14px ${borderColor}66, inset 0 0 8px ${borderColor}22`;
    } else if (bGlow === 'neon') {
      style.boxShadow = `0 0 8px ${borderColor}, 0 0 20px ${borderColor}99, inset 0 0 8px ${borderColor}44`;
    } else if (bGlow === 'shadow') {
      style.boxShadow = `4px 4px 0px ${borderColor}`;
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
  } else {
    style.borderStyle = bStyle;
    if (bStyle === 'double') {
      style.borderWidth = '3px';
    } else {
      style.borderWidth = bWidth === 'heavy' ? '2px' : bWidth === 'thick' ? '2px' : '1px';
    }
    style.borderColor = borderColor;
  }

  if (bRadius === 'leaf') {
    style.borderRadius = '12px 2px 12px 2px';
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

  // 1. Khung góc chữ L (Đúng chuẩn 2 cạnh L-shape sắc nét ở 4 góc)
  if (accent === 'brackets') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        {/* Top-Left */}
        <div
          className="absolute top-1.5 left-1.5 w-3 h-3"
          style={{
            borderTop: `2px solid ${accentColor}`,
            borderLeft: `2px solid ${accentColor}`,
          }}
        />
        {/* Top-Right */}
        <div
          className="absolute top-1.5 right-1.5 w-3 h-3"
          style={{
            borderTop: `2px solid ${accentColor}`,
            borderRight: `2px solid ${accentColor}`,
          }}
        />
        {/* Bottom-Left */}
        <div
          className="absolute bottom-1.5 left-1.5 w-3 h-3"
          style={{
            borderBottom: `2px solid ${accentColor}`,
            borderLeft: `2px solid ${accentColor}`,
          }}
        />
        {/* Bottom-Right */}
        <div
          className="absolute bottom-1.5 right-1.5 w-3 h-3"
          style={{
            borderBottom: `2px solid ${accentColor}`,
            borderRight: `2px solid ${accentColor}`,
          }}
        />
      </div>
    );
  }

  // 2. Hoa văn cổ điển (Hoa văn góc cuộn cổ điển ở 4 góc)
  if (accent === 'vintage') {
    const svgDim = 32;
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        {/* Top-Left */}
        <svg
          width={svgDim}
          height={svgDim}
          viewBox="0 0 40 40"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.2"
          className="absolute top-1 left-1"
        >
          <path d="M2 2 H38 M2 2 V38" strokeWidth="2" />
          <path d="M6 6 C16 6 22 12 22 22 C22 32 28 34 38 34" strokeLinecap="round" />
          <path d="M6 14 C12 14 16 10 16 6 M14 6 C14 12 10 16 6 16" strokeLinecap="round" />
          <circle cx="6" cy="6" r="2" fill={accentColor} />
          <circle cx="18" cy="18" r="1.5" fill={accentColor} />
          <circle cx="28" cy="8" r="1.2" fill={accentColor} />
          <circle cx="8" cy="28" r="1.2" fill={accentColor} />
        </svg>
        {/* Top-Right */}
        <svg
          width={svgDim}
          height={svgDim}
          viewBox="0 0 40 40"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.2"
          className="absolute top-1 right-1"
          style={{ transform: 'scaleX(-1)' }}
        >
          <path d="M2 2 H38 M2 2 V38" strokeWidth="2" />
          <path d="M6 6 C16 6 22 12 22 22 C22 32 28 34 38 34" strokeLinecap="round" />
          <path d="M6 14 C12 14 16 10 16 6 M14 6 C14 12 10 16 6 16" strokeLinecap="round" />
          <circle cx="6" cy="6" r="2" fill={accentColor} />
          <circle cx="18" cy="18" r="1.5" fill={accentColor} />
          <circle cx="28" cy="8" r="1.2" fill={accentColor} />
          <circle cx="8" cy="28" r="1.2" fill={accentColor} />
        </svg>
        {/* Bottom-Left */}
        <svg
          width={svgDim}
          height={svgDim}
          viewBox="0 0 40 40"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.2"
          className="absolute bottom-1 left-1"
          style={{ transform: 'scaleY(-1)' }}
        >
          <path d="M2 2 H38 M2 2 V38" strokeWidth="2" />
          <path d="M6 6 C16 6 22 12 22 22 C22 32 28 34 38 34" strokeLinecap="round" />
          <path d="M6 14 C12 14 16 10 16 6 M14 6 C14 12 10 16 6 16" strokeLinecap="round" />
          <circle cx="6" cy="6" r="2" fill={accentColor} />
          <circle cx="18" cy="18" r="1.5" fill={accentColor} />
          <circle cx="28" cy="8" r="1.2" fill={accentColor} />
          <circle cx="8" cy="28" r="1.2" fill={accentColor} />
        </svg>
        {/* Bottom-Right */}
        <svg
          width={svgDim}
          height={svgDim}
          viewBox="0 0 40 40"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.2"
          className="absolute bottom-1 right-1"
          style={{ transform: 'scale(-1, -1)' }}
        >
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

  // 3. Đinh tán kim loại (4 chốt ốc vít kim loại sắc sảo)
  if (accent === 'rivets') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        {/* Top-Left */}
        <div
          className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center"
          style={{ backgroundColor: accentColor }}
        >
          <div className="w-[65%] h-[1px] bg-black/70 rotate-45" />
        </div>
        {/* Top-Right */}
        <div
          className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center"
          style={{ backgroundColor: accentColor }}
        >
          <div className="w-[65%] h-[1px] bg-black/70 -rotate-45" />
        </div>
        {/* Bottom-Left */}
        <div
          className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center"
          style={{ backgroundColor: accentColor }}
        >
          <div className="w-[65%] h-[1px] bg-black/70 -rotate-45" />
        </div>
        {/* Bottom-Right */}
        <div
          className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center"
          style={{ backgroundColor: accentColor }}
        >
          <div className="w-[65%] h-[1px] bg-black/70 rotate-45" />
        </div>
      </div>
    );
  }

  // 4. Chấm định vị (4 chấm tròn nhỏ)
  if (accent === 'dots') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <div
          className="absolute top-2 left-2 w-2 h-2 rounded-full shadow-xs"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full shadow-xs"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute bottom-2 left-2 w-2 h-2 rounded-full shadow-xs"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute bottom-2 right-2 w-2 h-2 rounded-full shadow-xs"
          style={{ backgroundColor: accentColor }}
        />
      </div>
    );
  }

  // 5. Dấu chữ thập (Dấu + crosshair chính xác ở 4 góc)
  if (accent === 'crosshairs') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        {/* Top-Left */}
        <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
        {/* Top-Right */}
        <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
        {/* Bottom-Left */}
        <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
        {/* Bottom-Right */}
        <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
      </div>
    );
  }

  return null;
};
