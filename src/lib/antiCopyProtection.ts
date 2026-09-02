// Anti-Enable-Copy & Dynamic Chaotic Clipboard Scrambler Engine
// Khi độc giả hoặc extension (Enable Copy, Absolute Copy, v.v.) cố tình sao chép nội dung truyện,
// văn bản trong clipboard sẽ bị xáo trộn và biến đổi thành các ký tự hỗn loạn, không có quy luật,
// mỗi lần copy sẽ tạo ra một biến thể lộn xộn hoàn toàn khác nhau.

const CHAOS_SYMBOLS = [
  '§', '¶', '⁂', '₪', '⍼', '⧫', '⟡', '⊘', '⊗', '░', '▒', '▓', '█', '▄', '▀',
  '𒀱', '𒈙', '𒐫', '𒍼', '𓆩', '𓆪', '𓍢', '𓍲', '𓍱', '𓏵', '𓇽', '𖣘', '𖤍', '𑁍', '௵', 'ꙮ',
  'ᚠ', 'ᚡ', 'ᚢ', 'ᚣ', 'ᚤ', 'ᚥ', 'ᚦ', 'ᚧ', 'ᚨ', 'ᚩ', 'ᚪ', 'ᚫ', 'ᚬ', 'ᚭ', 'ᚮ', 'ᚯ', 'ᚰ', 'ᚱ',
  'ᚲ', 'ᚳ', 'ᚴ', 'ᚵ', 'ᚶ', 'ᚷ', 'ᚸ', 'ᚹ', 'ᚺ', 'ᚻ', 'ᚼ', 'ᚽ', 'ᚾ', 'ᚿ', 'ᛀ', 'ᛁ', 'ᛂ', 'ᛃ',
  '𝔄', '𝔅', 'ℭ', '𝔇', '𝔈', '𝔉', '𝔊', 'ℌ', 'ℑ', '𝔍', '𝔎', '𝔏', '𝔐', '𝔑', '𝔒', '𝔓', '𝔔', 'ℜ',
  '𝔞', '𝔟', '𝔠', '𝔡', '𝔢', '𝔣', '𝔤', '𝔥', '𝔦', '𝔧', '𝔨', '𝔩', '𝔪', '𝔫', '𝔬', '𝔭', '𝔮', '𝔯',
  'ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż', 'ž', 'š', 'č', 'ř', 'ď', 'ť', 'ň', 'ů',
  'ɐ', 'ɓ', 'ɔ', 'ɕ', 'ɖ', 'ɗ', 'ɘ', 'ə', 'ɚ', 'ɛ', 'ɜ', 'ɝ', 'ɞ', 'ɟ', 'ɠ', 'ɡ', 'ɢ', 'ɣ',
  '⚔', '☠', '⚡', '✦', '✧', '❖', '☣', '☢', '☯', '༒', '☬', '࿇', '֍', '֎', '۞', '۝',
  '≈', '≠', '≡', '≢', '≤', '≥', '≦', '≧', '≨', '≩', '≪', '≫', '≬', '≭', '≮', '≯', '≰', '≱',
  '∆', '∇', '∈', '∉', '∊', '∋', '∌', '∍', '∎', '∏', '∐', '∑', '−', '∓', '∔', '∕', '∖', '∗',
  '⊞', '⊟', '⊠', '⊡', '⊢', '⊣', '⊤', '⊥', '⊦', '⊧', '⊨', '⊩', '⊪', '⊫', '⊬', '⊭', '⊮', '⊯'
];

const NOISE_WORDS = [
  '[§*#]', '[?¿!]', '[⌀_0x8F]', '[𝕏]', '[▓▒]', '[𖣘]', '[~*~]', '[#§]', '[‡]', '[⁂]',
  '[MÃ_HÓA_CHỐNG_COPY]', '[CORRUPTED_CLIPBOARD]', '[DATA_OBFUSCATED]', '[PROTECTED_TEXT]',
  '[0x7F4A]', '[ERR_PROTECT]', '[BẢN_QUYỀN_TRUYỆN]', '[GLITCH_INTERCEPT]'
];

// Zalgo combining marks to make text glitch visually
const COMBINING_MARKS = [
  '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u0309',
  '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F', '\u0310', '\u0311', '\u0312', '\u0313',
  '\u0314', '\u0315', '\u0316', '\u0317', '\u0318', '\u0319', '\u031A', '\u031B', '\u031C', '\u031D',
  '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327', '\u0328', '\u0329',
  '\u0334', '\u0335', '\u0336', '\u0337', '\u0338', '\u0339', '\u033A', '\u033B', '\u033C', '\u033D',
  '\u0340', '\u0341', '\u0342', '\u0343', '\u0344', '\u0345', '\u0346', '\u0347', '\u0348', '\u0349'
];

/**
 * Tạo chuỗi ký tự lộn xộn, hoàn toàn ngẫu nhiên và biến đổi ngẫu nhiên mỗi lần gọi
 */
export function generateChaoticScramble(rawText: string = ''): string {
  const clean = (rawText || '').trim();
  const targetLength = Math.max(clean.length, 30);

  // Phân tách thành các dòng
  const lines = clean ? clean.split('\n') : [''];

  const scrambledLines = lines.map((line) => {
    if (!line.trim()) {
      // Dòng trống -> có thể chèn một chuỗi hỗn loạn ngắn hoặc giữ dòng trống ngẫu nhiên
      return Math.random() > 0.6 ? pickRandom(NOISE_WORDS) : '';
    }

    const words = line.split(/\s+/);
    // Xáo trộn thứ tự từ ngẫu nhiên
    const shuffledWords = [...words];
    for (let i = shuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
    }

    // Biến đổi từng từ thành chuỗi ký tự ma trận hỗn loạn
    const transformedWords = shuffledWords.map((word) => {
      // Xác suất 15% chèn từ nhiễu
      if (Math.random() < 0.15) {
        return pickRandom(NOISE_WORDS);
      }

      const chars = Array.from(word);
      const mutatedChars = chars.map((char) => {
        const rand = Math.random();
        // 40% cơ hội thay thế hoàn toàn bằng ký tự hỗn loạn / cổ ngữ / phù hiệu
        if (rand < 0.4) {
          return pickRandom(CHAOS_SYMBOLS);
        }
        // 30% cơ hội thêm dấu Zalgo đè lên ký tự
        if (rand < 0.7) {
          const zalgoMarks = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
            pickRandom(COMBINING_MARKS)
          ).join('');
          return char + zalgoMarks;
        }
        // 15% cơ hội chuyển đổi hoa/thường hoặc đổi chữ
        if (rand < 0.85) {
          return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
        }
        // 15% chèn kèm ký tự nhiễu
        return char + pickRandom(CHAOS_SYMBOLS);
      });

      // Đảo ngược hoặc xáo trộn một phần ký tự trong từ
      if (Math.random() < 0.5 && mutatedChars.length > 2) {
        const p1 = Math.floor(Math.random() * mutatedChars.length);
        const p2 = Math.floor(Math.random() * mutatedChars.length);
        [mutatedChars[p1], mutatedChars[p2]] = [mutatedChars[p2], mutatedChars[p1]];
      }

      return mutatedChars.join('');
    });

    // Chèn thêm các ký tự hỗn loạn ngẫu nhiên giữa các từ
    return transformedWords
      .map((w) => (Math.random() < 0.2 ? `${w} ${pickRandom(CHAOS_SYMBOLS)}` : w))
      .join(' ');
  });

  let result = scrambledLines.join('\n');

  // Đảm bảo có đủ độ hỗn loạn và độ dài nếu đoạn copy ban đầu quá ngắn
  if (result.length < targetLength) {
    const extraChaos = Array.from({ length: targetLength - result.length }, () =>
      pickRandom(CHAOS_SYMBOLS)
    ).join('');
    result = `${result}\n${extraChaos}`;
  }

  // Thêm dấu ấn mã hóa độc quyền ngẫu nhiên ở cuối
  const randomStamp = `\n[⊘_ERR_${Math.random().toString(36).substring(2, 9).toUpperCase()}_PROTECTED_0x${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase()}]`;
  return result + randomStamp;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Kiểm tra xem phần tử có thuộc trường nhập liệu / form chỉnh sửa hợp lệ của tác giả hay không
 */
export function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toUpperCase();
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable) {
    return true;
  }
  // Chỉ coi là editable nếu thực sự nằm trong input, textarea hoặc contenteditable
  const editableParent = target.closest('input, textarea, [contenteditable="true"]');
  return !!editableParent;
}

/**
 * Thực hiện ghi đè dữ liệu rác hỗn loạn vào Clipboard
 */
export function executeChaoticCopyScramble(e?: ClipboardEvent) {
  let selectedText = '';
  try {
    if (window.getSelection) {
      selectedText = window.getSelection()?.toString() || '';
    } else if ((document as any).selection && (document as any).selection.type !== 'Control') {
      selectedText = (document as any).selection.createRange().text || '';
    }
  } catch (err) {
    // Ignore
  }

  const scrambled = generateChaoticScramble(selectedText || 'Nội dung truyện được bảo vệ bản quyền.');

  if (e && e.clipboardData) {
    try {
      e.clipboardData.clearData();
      e.clipboardData.setData('text/plain', scrambled);
      e.clipboardData.setData('text/html', `<div style="font-family: monospace;">${scrambled}</div>`);
    } catch (err) {
      // Ignore
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(scrambled).catch(() => {});
  }

  return scrambled;
}

/**
 * Khởi tạo hệ thống chặn Enable Copy và xáo trộn clipboard ở mức độ sâu nhất (Capture Phase)
 */
export function initAntiCopyProtection(): () => void {
  const handleCopy = (e: ClipboardEvent) => {
    const target = e.target;
    if (isEditableElement(target)) {
      // Cho phép copy bình thường trong các ô nhập liệu / trình soạn thảo
      return;
    }

    // Chặn triệt để hành vi mặc định và ngăn chặn các extension can thiệp
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }

    executeChaoticCopyScramble(e);
  };

  const handleCut = (e: ClipboardEvent) => {
    const target = e.target;
    if (isEditableElement(target)) return;

    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }

    executeChaoticCopyScramble(e);
  };

  const handleDragStart = (e: DragEvent) => {
    if (isEditableElement(e.target)) return;
    // Chặn kéo thả đoạn văn bản ra ngoài ứng dụng để copy
    e.preventDefault();
  };

  const handleContextMenu = (e: MouseEvent) => {
    if (isEditableElement(e.target)) return;
    // Chặn chuột phải trên nội dung đọc truyện
    e.preventDefault();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (!isCtrlOrCmd) return;

    const key = e.key ? e.key.toLowerCase() : '';
    const target = e.target;

    // Chặn Ctrl+U (Xem mã nguồn), Ctrl+S (Lưu trang), Ctrl+P (In trang)
    if (['u', 's', 'p'].includes(key)) {
      e.preventDefault();
      return;
    }

    // Nếu người dùng bấm Ctrl+C hoặc Ctrl+X ngoài ô nhập liệu
    if (['c', 'x'].includes(key) && !isEditableElement(target)) {
      setTimeout(() => {
        executeChaoticCopyScramble();
      }, 0);
    }
  };

  // Đăng ký ở Capture Phase (useCapture = true) trên cả window và document
  // để chạy TRƯỚC mọi Content Script hoặc Extension như Enable Copy
  window.addEventListener('copy', handleCopy, true);
  document.addEventListener('copy', handleCopy, true);
  window.addEventListener('cut', handleCut, true);
  document.addEventListener('cut', handleCut, true);
  document.addEventListener('dragstart', handleDragStart, true);
  document.addEventListener('contextmenu', handleContextMenu, true);
  window.addEventListener('keydown', handleKeyDown, true);

  return () => {
    window.removeEventListener('copy', handleCopy, true);
    document.removeEventListener('copy', handleCopy, true);
    window.removeEventListener('cut', handleCut, true);
    document.removeEventListener('cut', handleCut, true);
    document.removeEventListener('dragstart', handleDragStart, true);
    document.removeEventListener('contextmenu', handleContextMenu, true);
    window.removeEventListener('keydown', handleKeyDown, true);
  };
}
