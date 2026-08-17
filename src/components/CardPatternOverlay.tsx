import React from 'react';

interface CardPatternOverlayProps {
  pattern?: 'none' | 'dots' | 'grid' | 'paper' | 'stripes' | 'waves' | 'hexagons' | 'crosshatch';
  opacity?: number; // mặc định 0.12 (12% mờ dịu)
}

export const CardPatternOverlay: React.FC<CardPatternOverlayProps> = ({ 
  pattern = 'none', 
  opacity = 0.12 
}) => {
  if (!pattern || pattern === 'none') return null;

  let backgroundImage = '';
  let backgroundSize = '';

  switch (pattern) {
    case 'dots':
      // Hoạ tiết chấm bi
      backgroundImage = 'radial-gradient(circle, currentColor 1.2px, transparent 1.2px)';
      backgroundSize = '16px 16px';
      break;
    case 'grid':
      // Hoạ tiết lưới ô vuông
      backgroundImage = 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)';
      backgroundSize = '20px 20px';
      break;
    case 'paper':
      // Hoạ tiết kết cấu trang giấy / hạt giấy vintage
      backgroundImage = 'radial-gradient(circle, currentColor 0.8px, transparent 0.8px), linear-gradient(45deg, currentColor 0.5px, transparent 0.5px)';
      backgroundSize = '8px 8px, 12px 12px';
      break;
    case 'stripes':
      // Hoạ tiết sọc nghiêng lãng mạn
      backgroundImage = 'repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)';
      backgroundSize = 'auto';
      break;
    case 'waves':
      // Hoạ tiết gợn sóng biển
      backgroundImage = 'radial-gradient(circle at 50% 100%, transparent 6px, currentColor 7px, transparent 8px)';
      backgroundSize = '24px 12px';
      break;
    case 'hexagons':
      // Hoạ tiết tổ ong lục giác
      backgroundImage = 'radial-gradient(circle at 100% 50%, transparent 20%, currentColor 21%, currentColor 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, currentColor 21%, currentColor 34%, transparent 35%, transparent)';
      backgroundSize = '28px 28px';
      break;
    case 'crosshatch':
      // Hoạ tiết kẻ caro chéo độc đáo
      backgroundImage = 'repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, currentColor, currentColor 1px, transparent 1px, transparent 12px)';
      backgroundSize = 'auto';
      break;
    default:
      return null;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden z-0"
      style={{
        backgroundImage,
        backgroundSize,
        opacity,
      }}
    />
  );
};
