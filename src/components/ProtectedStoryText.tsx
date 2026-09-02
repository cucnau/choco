import React, { useMemo } from 'react';

// Danh sách các cổ ngữ, mã bảo vệ bản quyền và ký tự nhiễu ma trận không có quy luật
const CHAOS_SYMBOLS = [
  '§*#', '𒀱', 'ᚠᚢᚦ', '0x8F', '𒈙⁂', '𖣘~', 'C0PY_ERR',
  '⊘_ERR', '𓆩𓆪', 'ᚱᚲ', '9A_PROTECT', 'ℭ𝔇', '≈≠≡',
  '𖤍', '𑁍', '௵', 'ꙮ', '⧫⟡', '░▒▓', '█▄▀', '֍֎',
  '⚡☠', '𒍼', 'ᛀᛁᛂ', '𝔞𝔟𝔠', 'ɘəɚ', '∊∋∌', '⊞⊟⊠',
  '𝕏', '※', '⍼', '⟦MÃ_BẢN_QUYỀN_0x', '⟧', '⁜'
];

interface ProtectedStoryTextProps {
  text: string;
  className?: string;
}

/**
 * Component hiển thị văn bản truyện chống Enable Copy & sao chép lậu ở tầng DOM.
 * - Mắt người đọc: Chữ hiển thị 100% trong suốt, rõ nét, chuẩn định dạng và font chữ.
 * - Trình duyệt / Tiện ích Enable Copy / Bôi đen sao chép:
 *   Bắt buộc phải quét qua các thẻ nhiễu `display: inline` có màu trong suốt (transparent).
 *   Văn bản dán ra ngoài sẽ bị đan xen ngẫu nhiên các đoạn mã lỗi, ký tự cổ và từ ngữ bị xáo trộn.
 */
export const ProtectedStoryText: React.FC<ProtectedStoryTextProps> = ({ text, className = '' }) => {
  const renderedElements = useMemo(() => {
    if (!text) return null;

    // Tách văn bản thành từng từ
    const words = text.split(/(\s+)/);

    return words.map((word, index) => {
      // Giữ nguyên khoảng trắng giữa các từ
      if (/^\s+$/.test(word)) {
        return <span key={index}>{word}</span>;
      }

      // Mỗi 1 - 2 từ sẽ có 1 thẻ nhiễu ngẫu nhiên
      const shouldInjectNoise = index % 2 === 0 || index % 3 === 0;
      const randomSymbol = CHAOS_SYMBOLS[Math.floor(Math.random() * CHAOS_SYMBOLS.length)];
      const randomHex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase();
      const noiseText = ` [${randomSymbol}_${randomHex}] `;

      return (
        <span key={index} className="inline">
          <span>{word}</span>
          {shouldInjectNoise && (
            <span
              aria-hidden="true"
              className="select-phantom-noise"
              style={{
                display: 'inline',
                fontSize: '0.001px',
                lineHeight: 0,
                color: 'transparent',
                letterSpacing: '-1px',
                userSelect: 'text',
                WebkitUserSelect: 'text',
                pointerEvents: 'none',
              }}
            >
              {noiseText}
            </span>
          )}
        </span>
      );
    });
  }, [text]);

  return <span className={`protected-story-text ${className}`}>{renderedElements}</span>;
};

