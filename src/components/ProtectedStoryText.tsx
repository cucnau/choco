import React from 'react';

interface ProtectedStoryTextProps {
  text: string;
  className?: string;
}

/**
 * Hiển thị văn bản chương truyện nguyên bản, trong sáng, tuyệt đối không chèn thẻ DOM rác
 * gây dính chữ, nhảy dòng hay phá vỡ giao diện đọc truyện của người dùng.
 */
export const ProtectedStoryText: React.FC<ProtectedStoryTextProps> = ({ text, className = '' }) => {
  return <span className={className}>{text}</span>;
};
