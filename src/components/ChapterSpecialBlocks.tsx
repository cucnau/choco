import React from 'react';
import {
  BellRing,
  MessageSquare,
  Smartphone,
  Mail,
  Cloud,
  Shield,
  StickyNote,
  AlertTriangle,
  Flame,
  Send,
  User,
  Heart,
  Terminal,
  FileText,
  ThumbsUp,
  Cpu,
  Layers,
} from 'lucide-react';

export type SpecialBlockType =
  | 'system'
  | 'forum'
  | 'netizen'
  | 'chat'
  | 'letter'
  | 'thought'
  | 'status'
  | 'note'
  | 'warning';

export interface ParsedBlock {
  type: 'paragraph' | SpecialBlockType;
  title?: string;
  meta?: string;
  rawText: string;
  lines: string[];
  subItems?: Array<{
    sender?: string;
    avatar?: string;
    time?: string;
    likes?: string;
    text: string;
    side?: 'left' | 'right';
  }>;
}

/**
 * Phân tích nội dung chương truyện thành danh sách các đoạn thường và các khung đặc biệt
 */
export function parseChapterContentBlocks(content: string): ParsedBlock[] {
  if (!content) return [];

  // Normalize Unicode to NFC so decomposed diacritics are properly composed
  const normalizedContent = content.normalize('NFC');
  const lines = normalizedContent.split('\n');
  const blocks: ParsedBlock[] = [];

  let currentBlockType: SpecialBlockType | null = null;
  let currentTitle: string | undefined = undefined;
  let currentMeta: string | undefined = undefined;
  let currentBlockLines: string[] = [];

  const flushNormalParagraphs = (rawLines: string[]) => {
    rawLines.forEach((line) => {
      const cleanP = line.trim();
      if (cleanP) {
        blocks.push({
          type: 'paragraph',
          rawText: cleanP,
          lines: [cleanP],
        });
      }
    });
  };

  let normalBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check mở thẻ block [system], [forum], [chat], [letter], [thought], [status], [note], [warning], [netizen]
    const openMatch = trimmed.match(
      /^\[(system|forum|netizen|chat|letter|thought|status|note|warning)(?::\s*([^\]]*))?\]\s*(.*)$/i
    );

    // Check đóng thẻ [/system], [/forum], etc.
    const closeMatch = trimmed.match(
      /^\[\/(system|forum|netizen|chat|letter|thought|status|note|warning)\]\s*$/i
    );

    if (openMatch && !currentBlockType) {
      // Flush text thường trước đó
      if (normalBuffer.length > 0) {
        flushNormalParagraphs(normalBuffer);
        normalBuffer = [];
      }

      const tag = openMatch[1].toLowerCase() as SpecialBlockType;
      const headerParam = openMatch[2]?.trim() || '';
      const restOfLine = openMatch[3]?.trim() || '';

      // Tách headerParam ra title và meta nếu có dấu |
      let title = headerParam;
      let meta: string | undefined = undefined;
      if (headerParam.includes('|')) {
        const parts = headerParam.split('|').map((p) => p.trim());
        title = parts[0];
        meta = parts.slice(1).join(' | ');
      }

      currentBlockType = tag;
      currentTitle = title || undefined;
      currentMeta = meta;
      currentBlockLines = [];

      // Nếu có nội dung ngay cùng dòng mở thẻ và có thẻ đóng ngay cùng dòng: [tag]Nội dung[/tag]
      const inlineCloseRegex = new RegExp(`\\[\\/${tag}\\]\\s*$`, 'i');
      if (inlineCloseRegex.test(restOfLine)) {
        const inlineContent = restOfLine.replace(inlineCloseRegex, '').trim();
        if (inlineContent) {
          currentBlockLines.push(inlineContent);
        }
        // Đóng block ngay
        blocks.push(buildParsedSpecialBlock(currentBlockType, currentTitle, currentMeta, currentBlockLines));
        currentBlockType = null;
        currentTitle = undefined;
        currentMeta = undefined;
        currentBlockLines = [];
        continue;
      } else if (restOfLine) {
        currentBlockLines.push(restOfLine);
      }
      continue;
    }

    if (closeMatch && currentBlockType && closeMatch[1].toLowerCase() === currentBlockType) {
      // Đóng block hiện tại
      blocks.push(buildParsedSpecialBlock(currentBlockType, currentTitle, currentMeta, currentBlockLines));
      currentBlockType = null;
      currentTitle = undefined;
      currentMeta = undefined;
      currentBlockLines = [];
      continue;
    }

    // Nếu đang trong block đặc biệt
    if (currentBlockType) {
      currentBlockLines.push(line);
    } else {
      // Kiểm tra dòng đơn shorthand ví dụ: [chat-left: Tên]: Nội dung hoặc [chat-right: Tên]: Nội dung
      const shortChatMatch = trimmed.match(/^\[(chat-left|chat-right|left|right)(?::\s*([^\]]*))?\]:\s*(.*)$/i);
      const shortNetizenMatch = trimmed.match(/^\[(netizen)(?::\s*([^\]]*))?\]:\s*(.*)$/i);

      if (shortChatMatch) {
        if (normalBuffer.length > 0) {
          flushNormalParagraphs(normalBuffer);
          normalBuffer = [];
        }
        const side = shortChatMatch[1].toLowerCase().includes('right') ? 'right' : 'left';
        const sender = shortChatMatch[2]?.trim() || (side === 'right' ? 'Bạn' : 'Người gửi');
        const text = shortChatMatch[3]?.trim() || '';
        blocks.push({
          type: 'chat',
          title: undefined,
          rawText: trimmed,
          lines: [text],
          subItems: [{ sender, text, side }],
        });
      } else if (shortNetizenMatch) {
        if (normalBuffer.length > 0) {
          flushNormalParagraphs(normalBuffer);
          normalBuffer = [];
        }
        const header = shortNetizenMatch[2]?.trim() || 'Cư dân mạng';
        let sender = header;
        let meta: string | undefined = undefined;
        if (header.includes('|')) {
          const parts = header.split('|').map((p) => p.trim());
          sender = parts[0];
          meta = parts.slice(1).join(' | ');
        }
        const text = shortNetizenMatch[3]?.trim() || '';
        blocks.push({
          type: 'netizen',
          title: sender,
          meta,
          rawText: trimmed,
          lines: [text],
          subItems: [{ sender, text, time: meta }],
        });
      } else {
        normalBuffer.push(line);
      }
    }
  }

  // Nếu file kết thúc khi đang trong block mà quên đóng thẻ [/tag], tự động đóng
  if (currentBlockType) {
    blocks.push(buildParsedSpecialBlock(currentBlockType, currentTitle, currentMeta, currentBlockLines));
  }

  // Flush buffer còn lại
  if (normalBuffer.length > 0) {
    flushNormalParagraphs(normalBuffer);
  }

  return blocks;
}

function buildParsedSpecialBlock(
  type: SpecialBlockType,
  title: string | undefined,
  meta: string | undefined,
  lines: string[]
): ParsedBlock {
  const rawText = lines.join('\n').trim();
  const subItems: ParsedBlock['subItems'] = [];

  if (type === 'chat') {
    lines.forEach((l) => {
      const trimmed = l.trim();
      if (!trimmed) return;
      // Match [left: Tên]: text hoặc [right: Tên]: text hoặc Tên (left/right): text
      const chatMatch = trimmed.match(/^\[?(left|right|chat-left|chat-right)?(?::\s*([^\]:]+))?\]?:\s*(.*)$/i);
      if (chatMatch) {
        const sideKey = (chatMatch[1] || '').toLowerCase();
        const side = sideKey.includes('right') ? 'right' : 'left';
        const sender = chatMatch[2]?.trim() || (side === 'right' ? 'Tôi' : 'Đối phương');
        const text = chatMatch[3]?.trim() || '';
        subItems.push({ sender, text, side });
      } else {
        // Dòng chat thông thường không có tiền tố
        subItems.push({ sender: title || 'Tin nhắn', text: trimmed, side: 'left' });
      }
    });
  } else if (type === 'forum' || type === 'netizen') {
    lines.forEach((l) => {
      const trimmed = l.trim();
      if (!trimmed) return;
      // Match [netizen: Tên | thời gian | like]: Nội dung hoặc [Tên]: Nội dung
      const cMatch = trimmed.match(/^\[?(?:netizen:)?\s*([^\]:]+)\]?:\s*(.*)$/i);
      if (cMatch) {
        const header = cMatch[1].trim();
        let sender = header;
        let time: string | undefined = undefined;
        let likes: string | undefined = undefined;
        if (header.includes('|')) {
          const parts = header.split('|').map((p) => p.trim());
          sender = parts[0];
          time = parts[1];
          likes = parts[2];
        }
        const text = cMatch[2].trim();
        subItems.push({ sender, text, time, likes });
      } else {
        subItems.push({ sender: 'Cư dân mạng', text: trimmed });
      }
    });
  }

  return {
    type,
    title,
    meta,
    rawText,
    lines: lines.map((l) => l.trim()).filter(Boolean),
    subItems: subItems.length > 0 ? subItems : undefined,
  };
}

interface SpecialBlockRendererProps {
  block: ParsedBlock;
  themeColors?: {
    bg?: string;
    cardBg?: string;
    border?: string;
    btnBg?: string;
    btnText?: string;
    btnSecondaryBg?: string;
    btnBorder?: string;
    text?: string;
    textMuted?: string;
    accentColor?: string;
  };
  fontFamily?: string;
}

/**
 * Hiển thị khối khung đặc biệt theo từng phong cách chuyên biệt
 */
export const SpecialBlockRenderer: React.FC<SpecialBlockRendererProps> = ({
  block,
  themeColors,
  fontFamily = '',
}) => {
  const tBg = themeColors?.bg || '#1a0b12';
  const tCardBg = themeColors?.cardBg || '#22111a';
  const tBorder = themeColors?.border || '#30222a';
  const tBtnBg = themeColors?.btnBg || '#e879f9';
  const tBtnText = themeColors?.btnText || '#000000';
  const tBtnSecBg = themeColors?.btnSecondaryBg || '#2a1622';
  const tText = themeColors?.text || '#fbcfe8';
  const tTextMuted = themeColors?.textMuted || '#fbcfe8aa';
  const tAccent = themeColors?.accentColor || themeColors?.btnBg || '#e879f9';

  // 1. THÔNG BÁO HỆ THỐNG (System Alert / Game Hologram Panel)
  if (block.type === 'system') {
    const hasHeader = Boolean(block.title || block.meta);
    return (
      <div
        className="my-5 p-4 sm:p-5 rounded-lg border-2 shadow-lg relative overflow-hidden transition-all duration-200 backdrop-blur-xs font-mono"
        style={{
          background: `linear-gradient(135deg, ${tCardBg}ee, ${tBg}f2)`,
          borderColor: tAccent,
          boxShadow: `0 0 16px ${tAccent}33`,
        }}
      >
        {/* Hologram top scan line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
          style={{ background: `linear-gradient(90deg, transparent, ${tAccent}, transparent)` }}
        />

        {/* Header hệ thống */}
        {hasHeader && (
          <div
            className="flex items-center justify-between gap-2 border-b pb-2.5 mb-3"
            style={{ borderColor: `${tAccent}40` }}
          >
            {block.title ? (
              <div className="flex items-center gap-2">
                <div
                  className="p-1.5 rounded-md shadow-xs flex items-center justify-center animate-pulse"
                  style={{ background: tBtnBg, color: tBtnText }}
                >
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block" style={{ color: tAccent }}>
                    {block.title}
                  </span>
                </div>
              </div>
            ) : (
              <div />
            )}
            {block.meta && (
              <span
                className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border shadow-xs"
                style={{ borderColor: tAccent, color: tBtnText, background: tBtnBg }}
              >
                {block.meta}
              </span>
            )}
          </div>
        )}

        {/* Nội dung thông báo */}
        <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed" style={{ color: tText }}>
          {block.lines.map((line, lIdx) => (
            <p key={lIdx} className="flex items-start gap-2">
              <span style={{ color: tAccent }} className="font-bold select-none shrink-0">
                ›
              </span>
              <span>{line}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }

  // 2. BÌNH LUẬN CƯ DÂN MẠNG / DIỄN ĐÀN (Forum / Netizen Comments)
  if (block.type === 'forum' || block.type === 'netizen') {
    const hasHeader = Boolean(block.title || block.meta);
    return (
      <div
        className="my-5 p-4 sm:p-5 rounded-xl border shadow-md relative space-y-3 transition-all"
        style={{
          background: tCardBg,
          borderColor: `${tAccent}50`,
        }}
      >
        {/* Header diễn đàn */}
        {hasHeader && (
          <div
            className="flex items-center justify-between border-b pb-2"
            style={{ borderColor: `${tAccent}30` }}
          >
            {block.title ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-xs"
                  style={{ background: tBtnBg, color: tBtnText }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tAccent }}>
                  {block.title}
                </span>
              </div>
            ) : (
              <div />
            )}
            {block.meta && (
              <span className="text-[10px] opacity-80 font-mono font-medium" style={{ color: tTextMuted }}>
                {block.meta}
              </span>
            )}
          </div>
        )}

        {/* Danh sách bình luận */}
        <div className="space-y-2.5 pt-1">
          {block.subItems && block.subItems.length > 0 ? (
            block.subItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border text-xs space-y-1.5 transition-all shadow-xs"
                style={{
                  background: `${tBtnBg}15`,
                  borderColor: `${tBtnBg}40`,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs"
                      style={{ background: tBtnBg, color: tBtnText }}
                    >
                      {item.sender ? item.sender.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-bold text-[11px]" style={{ color: tText }}>
                      {item.sender || 'Cư dân mạng'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] opacity-80 font-mono" style={{ color: tTextMuted }}>
                    {item.time && <span>{item.time}</span>}
                  </div>
                </div>
                <p className="pl-7 leading-relaxed text-xs sm:text-sm" style={{ color: tText }}>
                  {item.text}
                </p>
              </div>
            ))
          ) : (
            <div
              className="p-3 rounded-lg border text-xs space-y-1.5"
              style={{ background: `${tBtnBg}15`, borderColor: `${tBtnBg}40` }}
            >
              {block.title && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold" style={{ color: tAccent }}>
                    {block.title}
                  </span>
                  {block.meta && (
                    <span className="text-[10px] opacity-75 font-mono" style={{ color: tTextMuted }}>
                      {block.meta}
                    </span>
                  )}
                </div>
              )}
              <div className="space-y-1 text-xs sm:text-sm leading-relaxed" style={{ color: tText }}>
                {block.lines.map((line, lIdx) => (
                  <p key={lIdx}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. TIN NHẮN CHAT / HỘI THOẠI ĐIỆN THOẠI (Chat Message / SMS / Messenger)
  if (block.type === 'chat') {
    return (
      <div
        className="my-5 p-3 sm:p-4 rounded-2xl border shadow-lg max-w-xl mx-auto space-y-3"
        style={{
          background: tCardBg,
          borderColor: `${tAccent}40`,
        }}
      >
        {/* Header khung chat */}
        {block.title && (
          <div
            className="flex items-center justify-between border-b pb-2 px-1"
            style={{ borderColor: `${tAccent}25` }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ background: tBtnBg }}
              />
              <span className="text-xs font-bold" style={{ color: tAccent }}>
                {block.title}
              </span>
            </div>
            <Smartphone className="w-4 h-4 opacity-70" style={{ color: tAccent }} />
          </div>
        )}

        {/* Nội dung các bong bóng chat */}
        <div className="space-y-3 py-1">
          {block.subItems && block.subItems.length > 0 ? (
            block.subItems.map((msg, mIdx) => {
              const isRight = msg.side === 'right';
              return (
                <div
                  key={mIdx}
                  className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <span className="text-[10px] px-1 font-semibold opacity-80 font-mono" style={{ color: tTextMuted }}>
                    {msg.sender}
                  </span>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isRight ? 'rounded-br-xs' : 'rounded-bl-xs'
                    }`}
                    style={{
                      background: isRight ? tBtnBg : `${tBtnBg}20`,
                      color: isRight ? tBtnText : tText,
                      border: isRight ? undefined : `1px solid ${tBtnBg}45`,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="space-y-2">
              {block.lines.map((l, lIdx) => (
                <div key={lIdx} className="flex flex-col items-start space-y-1">
                  <div
                    className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-bl-xs text-xs sm:text-sm leading-relaxed border shadow-xs"
                    style={{ background: `${tBtnBg}20`, color: tText, borderColor: `${tBtnBg}45` }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. THƯ TỪ / MẬT HÀM / NHẬT KÝ (Letter / Parchment / Secret Note)
  if (block.type === 'letter') {
    const hasHeader = Boolean(block.title || block.meta);
    return (
      <div
        className="my-5 p-5 sm:p-7 rounded-lg border-2 shadow-md relative space-y-3 transition-all"
        style={{
          background: tCardBg,
          borderColor: `${tAccent}50`,
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.05)',
        }}
      >
        {/* Con dấu thư / Icon phong bì góc */}
        {hasHeader && (
          <div className="flex items-center justify-between border-b pb-2 border-dashed" style={{ borderColor: `${tAccent}40` }}>
            {block.title ? (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 opacity-80" style={{ color: tAccent }} />
                <span className="text-xs font-lora font-serif font-bold italic tracking-wide" style={{ color: tAccent, fontFamily: "'Lora', 'EB Garamond', 'Noto Serif', serif" }}>
                  {block.title}
                </span>
              </div>
            ) : (
              <div />
            )}
            {block.meta && (
              <span className="text-[10px] italic font-lora font-serif opacity-80" style={{ color: tTextMuted, fontFamily: "'Lora', 'EB Garamond', 'Noto Serif', serif" }}>
                {block.meta}
              </span>
            )}
          </div>
        )}

        {/* Nội dung thư dạng chữ nghiêng trang nhã */}
        <div className="space-y-2 text-xs sm:text-sm leading-relaxed italic font-lora font-serif pt-1" style={{ color: tText, fontFamily: "'Lora', 'EB Garamond', 'Noto Serif', serif" }}>
          {block.lines.map((line, lIdx) => (
            <p key={lIdx} className="indent-4">
              {line}
            </p>
          ))}
        </div>
      </div>
    );
  }

  // 5. ĐỘC THOẠI NỘI TÂM / TÂM LINH (Thought / Telepathy)
  if (block.type === 'thought') {
    return (
      <div
        className="my-4 p-3.5 sm:p-4 rounded-xl border border-dashed shadow-xs relative space-y-1.5"
        style={{
          background: `${tBtnBg}15`,
          borderColor: `${tAccent}70`,
        }}
      >
        {block.title && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: tAccent }}>
            <Cloud className="w-3.5 h-3.5" />
            <span>{block.title}</span>
          </div>
        )}
        <div className={`space-y-1 text-xs sm:text-sm leading-relaxed italic opacity-95 ${block.title ? 'pl-4 border-l-2' : ''}`} style={{ color: tText, borderColor: tAccent }}>
          {block.lines.map((line, lIdx) => (
            <p key={lIdx}>{line}</p>
          ))}
        </div>
      </div>
    );
  }

  // 6. BẢNG TRẠNG THÁI RPG / CHỈ SỐ NHÂN VẬT (Status Window / Quest Board)
  if (block.type === 'status') {
    return (
      <div
        className="my-5 p-4 sm:p-5 rounded-lg border-2 shadow-xl space-y-3 font-mono"
        style={{
          background: tCardBg,
          borderColor: tAccent,
        }}
      >
        {block.title && (
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${tAccent}50` }}>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: tAccent }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tAccent }}>
                {block.title}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed" style={{ color: tText }}>
          {block.lines.map((line, lIdx) => {
            const hasColon = line.includes(':');
            if (hasColon) {
              const [k, ...v] = line.split(':');
              return (
                <div key={lIdx} className="flex items-start justify-between gap-2 border-b border-dashed pb-1" style={{ borderColor: `${tBorder}60` }}>
                  <span className="font-semibold opacity-80 shrink-0" style={{ color: tTextMuted }}>
                    {k.trim()}:
                  </span>
                  <span className="font-bold text-right" style={{ color: tAccent }}>
                    {v.join(':').trim()}
                  </span>
                </div>
              );
            }
            return <p key={lIdx}>{line}</p>;
          })}
        </div>
      </div>
    );
  }

  // 7. LỜI TÁC GIẢ / CHÚ THÍCH (Author Note / Footnote)
  if (block.type === 'note') {
    return (
      <div
        className="my-4 p-3.5 rounded-lg border border-dashed text-xs space-y-1.5"
        style={{
          background: `${tBtnBg}15`,
          borderColor: `${tAccent}60`,
        }}
      >
        {block.title && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: tAccent }}>
            <StickyNote className="w-3.5 h-3.5" />
            <span>{block.title}</span>
          </div>
        )}
        <div className={`space-y-1 text-xs leading-relaxed opacity-90 ${block.title ? 'pl-3.5' : ''}`} style={{ color: tText }}>
          {block.lines.map((line, lIdx) => (
            <p key={lIdx}>{line}</p>
          ))}
        </div>
      </div>
    );
  }

  // 8. CẢNH BÁO / BÁO ĐỘNG (Warning / Red Alert)
  if (block.type === 'warning') {
    return (
      <div className="my-5 p-4 rounded-lg border-2 border-rose-500/80 bg-rose-950/30 text-rose-200 shadow-lg space-y-2 font-mono">
        {block.title && (
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400 border-b border-rose-500/30 pb-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
            <span>{block.title}</span>
          </div>
        )}
        <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
          {block.lines.map((line, lIdx) => (
            <p key={lIdx}>{line}</p>
          ))}
        </div>
      </div>
    );
  }

  // Fallback text
  return (
    <div className="my-3 space-y-1 text-base leading-relaxed" style={{ color: tText }}>
      {block.lines.map((line, lIdx) => (
        <p key={lIdx}>{line}</p>
      ))}
    </div>
  );
};
