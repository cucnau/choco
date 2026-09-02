import React, { useMemo } from 'react';

// Danh sách các ký hiệu cổ ngữ và mã nhiễu ngẫu nhiên nhúng ngầm vào DOM
const INVISIBLE_DOM_NOISE_TOKENS = [
  '§*#', '𒀱', 'ᚠᚢᚦ', '0x8F', '𒈙⁂', '𖣘~', 'C0PY_ERR',
  '⊘_ERR', '𓆩𓆪', 'ᚱᚲ', '9A_PROTECT', 'ℭ𝔇', '≈≠≡',
  '𖤍', '𑁍', '௵', 'ꙮ', '⧫⟡', '░▒▓', '█▄▀', '֍֎',
  '⚡☠', '𒍼', 'ᛀᛁᛂ', '𝔞𝔟𝔠', 'ɘəɚ', '∊∋∌', '⊞⊟⊠'
];

interface ProtectedStoryTextProps {
  text: string;
  className?: string;
}

/**
 * Component hiển thị văn bản truyện với lớp chống Enable Copy cấp độ DOM sâu nhất.
 * - Hiển thị trên màn hình: 100% bình thường, đẹp đẽ, chuẩn font, không bị lệch giao diện.
 * - Khi tiện ích Enable Copy hoặc bất kỳ công cụ nào cố tình quét DOM / bôi đen / sao chép:
 *   DOM Selection của trình duyệt bắt buộc phải quét qua các thẻ nhiễu ẩn và trích xuất ra
 *   văn bản bị cắt vụn, đan xen ký tự cổ và mã lỗi bản quyền lộn xộn.
 */
export const ProtectedStoryText: React.FC<ProtectedStoryTextProps> = ({ text, className = '' }) => {
  const renderedElements = useMemo(() => {
    if (!text) return null;

    // Tách văn bản thành các từ và khoảng trắng
    const tokens = text.split(/(\s+)/);

    return tokens.map((token, index) => {
      // Nếu là khoảng trắng, giữ nguyên
      if (/^\s+$/.test(token)) {
        return <span key={index}>{token}</span>;
      }

      // Cứ cách khoảng 2-4 từ, chèn 1 token nhiễu ma trận ẩn (0px)
      const injectNoise = index % 5 === 2;
      const noise = injectNoise
        ? ` [${INVISIBLE_DOM_NOISE_TOKENS[Math.floor(Math.random() * INVISIBLE_DOM_NOISE_TOKENS.length)]}_${Math.floor(Math.random() * 9999).toString(16).toUpperCase()}] `
        : null;

      return (
        <React.Fragment key={index}>
          <span>{token}</span>
          {noise && (
            <span
              aria-hidden="true"
              className="select-phantom-noise select-text"
              style={{
                fontSize: 0,
                width: 0,
                height: 0,
                display: 'inline-block',
                overflow: 'hidden',
                opacity: 0,
                lineHeight: 0,
                pointerEvents: 'none',
                userSelect: 'text',
                WebkitUserSelect: 'text',
              }}
            >
              {noise}
            </span>
          )}
        </React.Fragment>
      );
    });
  }, [text]);

  return <span className={`protected-story-text ${className}`}>{renderedElements}</span>;
};
