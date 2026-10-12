import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, Copy, Check, Palette, RefreshCw, 
  BookOpen, Feather, Tag, Award, AlignLeft, MessageSquareQuote,
  Eye, Sliders, Image as ImageIcon, Upload, Link as LinkIcon
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { JjwxcNovel } from '../data/jjwxcRankingsData';
import { CanvaPalette, extractPaletteFromImage, hexToRgba, hexToRgb } from '../lib/coverColorExtractor';
import { getCorsCoverUrl } from '../utils/coverImage';
import { splitTagList } from '../utils/tagUtils';
import novelTagsRealMap from '../data/novelTagsRealMap.json';

interface NovelShareModalProps {
  novel: JjwxcNovel;
  rankingTitle?: string;
  palette: CanvaPalette | null;
  novelIntro?: string;
  onClose: () => void;
}

function getLuminance(hex: string): number {
  try {
    const [r, g, b] = hexToRgb(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  } catch {
    return 128;
  }
}

export const NovelShareModal: React.FC<NovelShareModalProps> = ({
  novel,
  rankingTitle = 'Tấn Giang Văn Học Thành',
  palette,
  novelIntro = '',
  onClose
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCustomNovel = novel.novelId === 'custom' || !novel.novelId;
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>(isCustomNovel ? 'edit' : 'preview');

  // Lấy tag gốc thực tế của truyện: ưu tiên novel.tags -> novelTagsRealMap -> genre gốc (Tự tạo ảnh để trống)
  const realTagsList = isCustomNovel
    ? []
    : ((novel.tags && novel.tags.length > 0)
        ? novel.tags
        : ((novelTagsRealMap as Record<string, string[]>)[novel.novelId] || (novel.genre ? splitTagList(novel.genre) : [])));

  // Danh sách các mã màu trích xuất từ bìa
  const [extractedColors, setExtractedColors] = useState<string[]>(
    palette?.colors && palette.colors.length > 0
      ? palette.colors
      : ['#f59e0b', '#06b6d4', '#10b981', '#ec4899', '#8b5cf6', '#64748b']
  );

  // Mã màu riêng cho từng phần hoàn toàn từ màu bìa
  // Nền gradient được chọn trực tiếp 2 màu từ bảng màu bìa
  const [cardBgColor1, setCardBgColor1] = useState<string>(
    palette?.dominant || extractedColors[0]
  );
  const [cardBgColor2, setCardBgColor2] = useState<string>(
    palette?.secondaryBg || extractedColors[1] || extractedColors[0]
  );

  const [titleColor, setTitleColor] = useState<string>(
    palette?.accent || extractedColors[1] || '#ffffff'
  );
  const [badgeColor, setBadgeColor] = useState<string>(
    palette?.accent || extractedColors[0] || '#f59e0b'
  );
  const [tagColor, setTagColor] = useState<string>(
    palette?.secondary || extractedColors[2] || '#06b6d4'
  );
  const [introBoxColor, setIntroBoxColor] = useState<string>(
    palette?.dominant || extractedColors[0]
  );

  // Bật / Tắt huy hiệu thứ hạng (Tự tạo ảnh mặc định không bật và để trống)
  const [showRankingBadge, setShowRankingBadge] = useState<boolean>(!isCustomNovel && !!novel.rank);
  const defaultRankingLabel = isCustomNovel
    ? ''
    : (novel.rank ? `#${novel.rank} • ${rankingTitle}` : (rankingTitle || '#1 • Đề cử'));
  const [editRankingLabel, setEditRankingLabel] = useState<string>(defaultRankingLabel);

  // Dữ liệu người dùng được phép chỉnh sửa: Khi tự tạo ảnh thì ĐỂ TRỐNG TOÀN BỘ, không điền mẫu
  const initialStatus = isCustomNovel
    ? ''
    : (novel.status?.includes('完结') || novel.status === 'Đã hoàn thành'
        ? 'Đã hoàn thành' 
        : (novel.status || 'Đang cập nhật'));
  const [editTitle, setEditTitle] = useState(isCustomNovel ? '' : (novel.title || ''));
  const [editAuthor, setEditAuthor] = useState(isCustomNovel ? '' : (novel.author || ''));
  const initialTagsString = (!isCustomNovel && realTagsList.length > 0)
    ? splitTagList(realTagsList).join(', ')
    : '';
  const [editGenre, setEditGenre] = useState(initialTagsString);
  const [editStatus, setEditStatus] = useState(initialStatus);

  // Số chữ & Điểm số (Tự tạo ảnh để trống)
  const rawWordCount = isCustomNovel ? '' : String(novel.wordCount || '').replace(/chữ/gi, '').trim();
  const [editWordCount, setEditWordCount] = useState(rawWordCount ? `${rawWordCount} chữ` : '');
  const [editScore, setEditScore] = useState(isCustomNovel ? '' : (novel.score ? novel.score.trim() : ''));

  // Giới thiệu (Tự tạo ảnh để trống hoàn toàn)
  const [editIntro, setEditIntro] = useState(
    isCustomNovel ? '' : (novelIntro || novel.intro || '')
  );
  const [editReview, setEditReview] = useState('');
  const [showReview, setShowReview] = useState(false);

  // Ảnh bìa (Tự tạo ảnh để trống link bìa)
  const [coverDataUrl, setCoverDataUrl] = useState<string>('');
  const [isLoadingCover, setIsLoadingCover] = useState(false);

  // Trạng thái xuất ảnh
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Nạp ảnh bìa ban đầu
  useEffect(() => {
    let isMounted = true;

    // Khi tự tạo ảnh (isCustomNovel), để trống hoàn toàn ảnh bìa ban đầu
    if (isCustomNovel) {
      setCoverDataUrl('');
      setIsLoadingCover(false);
      return;
    }

    if (!novel.coverUrl && !novel.novelId) {
      setCoverDataUrl('');
      return;
    }

    if (novel.coverUrl && novel.coverUrl.startsWith('data:image')) {
      setCoverDataUrl(novel.coverUrl);
      return;
    }

    setIsLoadingCover(true);
    const loadCover = async () => {
      const proxyUrl = `/api/jjwxc/cover/${novel.novelId}`;
      const fallbackUrl = getCorsCoverUrl(novel.novelId, novel.coverUrl);
      const urlsToTry = [proxyUrl, fallbackUrl];

      for (const url of urlsToTry) {
        if (!url) continue;
        try {
          const res = await fetch(url);
          if (res.ok) {
            const blob = await res.blob();
            const dataUri = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });

            if (isMounted && dataUri && dataUri.startsWith('data:image')) {
              setCoverDataUrl(dataUri);
              setIsLoadingCover(false);
              return;
            }
          }
        } catch (e) {}
      }

      if (isMounted) {
        setCoverDataUrl(fallbackUrl || novel.coverUrl);
        setIsLoadingCover(false);
      }
    };

    loadCover();

    return () => {
      isMounted = false;
    };
  }, [novel.novelId, novel.coverUrl]);

  // Cập nhật màu khi palette thay đổi
  useEffect(() => {
    if (palette?.colors && palette.colors.length > 0) {
      setExtractedColors(palette.colors);
    }
    if (palette?.dominant) {
      setCardBgColor1(palette.dominant);
      setIntroBoxColor(palette.dominant);
    }
    if (palette?.secondaryBg) {
      setCardBgColor2(palette.secondaryBg);
    } else if (palette?.colors && palette.colors.length > 1) {
      setCardBgColor2(palette.colors[1]);
    }
    if (palette?.accent) {
      setTitleColor(palette.accent);
      setBadgeColor(palette.accent);
    }
    if (palette?.secondary) {
      setTagColor(palette.secondary);
    }
  }, [palette]);

  // Xử lý khi người dùng tải ảnh từ máy tính lên
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      if (dataUri) {
        setCoverDataUrl(dataUri);
        showToast('Đã tải ảnh bìa lên thành công');

        // Tự động phân tích dải màu từ ảnh vừa tải lên
        try {
          const newPalette = await extractPaletteFromImage(dataUri);
          if (newPalette && newPalette.colors && newPalette.colors.length > 0) {
            setExtractedColors(newPalette.colors);
            setCardBgColor1(newPalette.dominant);
            setCardBgColor2(newPalette.secondaryBg || newPalette.colors[1] || newPalette.dominant);
            setTitleColor(newPalette.accent);
            setBadgeColor(newPalette.accent);
            setTagColor(newPalette.secondary);
            setIntroBoxColor(newPalette.dominant);
            showToast('Đã trích xuất màu từ ảnh bìa');
          }
        } catch (err) {
          console.warn('Lỗi phân tích màu bìa tải lên:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Khôi phục mặc định
  const handleResetToDefault = () => {
    if (isCustomNovel) {
      setEditTitle('');
      setEditAuthor('');
      setEditGenre('');
      setEditStatus('');
      setEditScore('');
      setEditWordCount('');
      setEditRankingLabel('');
      setShowRankingBadge(false);
      setEditIntro('');
      setEditReview('');
      setShowReview(false);
      setCoverDataUrl('');
    } else {
      setEditTitle(novel.title || '');
      setEditAuthor(novel.author || '');
      const defaultTags = realTagsList.length > 0
        ? splitTagList(realTagsList).join(', ')
        : '';
      setEditGenre(defaultTags);
      setEditStatus(initialStatus);
      setEditScore(novel.score ? novel.score.trim() : '');
      setEditWordCount(rawWordCount ? `${rawWordCount} chữ` : '');
      setEditRankingLabel(defaultRankingLabel);
      setShowRankingBadge(!isCustomNovel && !!novel.rank);
      setEditIntro(novelIntro || novel.intro || '');
      setEditReview('');
      setShowReview(false);
    }

    if (palette?.colors && palette.colors.length > 0) {
      setExtractedColors(palette.colors);
    }
    if (palette?.dominant) {
      setCardBgColor1(palette.dominant);
      setIntroBoxColor(palette.dominant);
    }
    if (palette?.secondaryBg) {
      setCardBgColor2(palette.secondaryBg);
    } else if (palette?.colors && palette.colors.length > 1) {
      setCardBgColor2(palette.colors[1]);
    }
    if (palette?.accent) {
      setTitleColor(palette.accent);
      setBadgeColor(palette.accent);
    }
    if (palette?.secondary) setTagColor(palette.secondary);

    showToast('Đã khôi phục các thông số về mặc định');
  };

  // Tính toán độ tương phản chuẩn dựa trên 2 màu nền được chọn từ bìa
  const avgBgLuminance = (getLuminance(cardBgColor1) + getLuminance(cardBgColor2)) / 2;
  const isLightBackground = avgBgLuminance > 145;

  const cardTheme = {
    // Gradient hoàn toàn tạo từ 2 mã màu bìa mà người dùng tự chọn
    background: `linear-gradient(155deg, ${cardBgColor1} 0%, ${cardBgColor2} 100%)`,
    textColor: isLightBackground ? '#0f172a' : '#fafafa',
    textMutedColor: isLightBackground ? '#334155' : '#cbd5e1',
    borderInnerColor: isLightBackground ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)',
    introBoxBg: isLightBackground ? 'rgba(255, 255, 255, 0.65)' : hexToRgba(introBoxColor, 0.28),
    introBoxBorder: isLightBackground ? 'rgba(0, 0, 0, 0.15)' : hexToRgba(introBoxColor, 0.45),
    introBoxText: isLightBackground ? '#0f172a' : '#f4f4f5',
    cardBorder: isLightBackground ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.3)'
  };

  // Tạo ảnh PNG chất lượng cao
  const generateImagePng = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
        style: {
          transform: 'none',
          boxSizing: 'border-box'
        }
      });
      return dataUrl;
    } catch (err) {
      console.error('Lỗi chụp ảnh thẻ truyện:', err);
      showToast('Có lỗi xảy ra khi tạo ảnh');
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  // Tải ảnh PNG về máy
  const handleDownload = async () => {
    const dataUrl = await generateImagePng();
    if (!dataUrl) return;

    const link = document.createElement('a');
    const safeTitle = editTitle.replace(/[\\/:*?"<>|]/g, '_').slice(0, 40);
    link.download = `JJWXC_${safeTitle || novel.novelId || 'custom'}.png`;
    link.href = dataUrl;
    link.click();
    showToast('Đã tải ảnh về thiết bị');
  };

  // Sao chép ảnh vào Clipboard
  const handleCopy = async () => {
    const dataUrl = await generateImagePng();
    if (!dataUrl) return;

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      showToast('Đã sao chép ảnh vào bộ nhớ tạm');
    } catch (err) {
      console.warn('Clipboard Image Write không được hỗ trợ:', err);
      handleDownload();
    }
  };

  // Danh sách các mục cho phép đổi màu hoàn toàn theo màu bìa
  const colorCustomizableSections = [
    {
      id: 'cardBg1',
      label: 'Nền gradient 1',
      currentColor: cardBgColor1,
      setter: setCardBgColor1
    },
    {
      id: 'cardBg2',
      label: 'Nền gradient 2',
      currentColor: cardBgColor2,
      setter: setCardBgColor2
    },
    {
      id: 'title',
      label: 'Tên truyện',
      currentColor: titleColor,
      setter: setTitleColor
    },
    {
      id: 'badge',
      label: 'Huy hiệu',
      currentColor: badgeColor,
      setter: setBadgeColor
    },
    {
      id: 'tag',
      label: 'Tag',
      currentColor: tagColor,
      setter: setTagColor
    },
    {
      id: 'introBox',
      label: 'Khung giới thiệu',
      currentColor: introBoxColor,
      setter: setIntroBoxColor
    }
  ];

  const parsedTags = splitTagList(editGenre);

  return (
    <div 
      className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Khung Modal chính */}
      <div 
        className="relative w-full max-w-4xl bg-[#131217] border border-zinc-700/80 rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col h-[94vh] sm:h-auto max-h-[94vh] sm:max-h-[92vh] text-zinc-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-3.5 sm:px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-[#191821] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0"
              style={{ backgroundColor: badgeColor }}
            >
              <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h2 className="text-xs sm:text-base font-bold text-white truncate">
              {isCustomNovel ? 'Tự tạo ảnh chia sẻ truyện' : 'Tạo ảnh chia sẻ truyện'}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Switch Tabs trên mobile */}
            <div className="flex sm:hidden rounded-lg border border-zinc-700 bg-zinc-900 p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded text-xs transition-all font-medium ${
                  activeTab === 'preview' ? 'bg-amber-500 font-bold text-black shadow-xs' : 'text-zinc-400'
                }`}
              >
                Xem trước
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-2.5 py-1 rounded text-xs transition-all font-medium ${
                  activeTab === 'edit' ? 'bg-amber-500 font-bold text-black shadow-xs' : 'text-zinc-400'
                }`}
              >
                Chỉnh sửa
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thông báo Toast */}
        {toastMessage && (
          <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Nội dung 2 cột: Preview bên trái, Chỉnh sửa bên phải */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* CỘT 1: KHUNG HÌNH XEM TRƯỚC */}
          <div className={`lg:col-span-7 flex flex-col items-center justify-start ${
            activeTab === 'edit' ? 'hidden sm:flex' : 'flex'
          }`}>
            <div className="w-full flex items-center justify-between mb-2 px-1 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Khung ảnh xuất (Ảnh sắc nét)</span>
              </span>
            </div>

            {/* VÙNG CHỤP HÌNH THẺ CARD - NỀN GRADIENT 100% TỪ MÀU BÌA ĐƯỢC CHỌN */}
            <div className="w-full overflow-x-auto flex justify-center py-1 sm:py-2">
              <div
                ref={cardRef}
                className="relative w-full max-w-[460px] rounded-2xl sm:rounded-3xl overflow-hidden p-4 sm:p-6 transition-all duration-300 shadow-2xl flex flex-col gap-3.5 sm:gap-4 font-sans shrink-0"
                style={{
                  background: cardTheme.background,
                  borderColor: cardTheme.cardBorder,
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  color: cardTheme.textColor,
                  boxShadow: `0 20px 50px -10px ${hexToRgba(cardBgColor1, 0.45)}`
                }}
              >
                {/* Header Thẻ Card: Chỉ hiện khi bật showRankingBadge */}
                {showRankingBadge && (
                  <div 
                    className="relative z-10 flex items-center justify-start border-b pb-2.5 sm:pb-3"
                    style={{ borderColor: cardTheme.borderInnerColor }}
                  >
                    <span 
                      className="px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1"
                      style={{ backgroundColor: badgeColor }}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{editRankingLabel || defaultRankingLabel}</span>
                    </span>
                  </div>
                )}

                {/* Thân thẻ: Bìa & Thông số */}
                <div className="relative z-10 flex gap-3 sm:gap-4 items-start">
                  <div 
                    className="relative shrink-0 w-24 sm:w-32 aspect-3/4 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border bg-white/10 flex items-center justify-center" 
                    style={{ borderColor: cardTheme.cardBorder }}
                  >
                    {isLoadingCover ? (
                      <div className="w-full h-full bg-white/15 animate-pulse flex items-center justify-center text-xs text-white">
                        Đang nạp bìa...
                      </div>
                    ) : coverDataUrl ? (
                      <img 
                        src={coverDataUrl}
                        alt={editTitle}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-3 text-center text-zinc-400 text-xs flex flex-col items-center gap-1">
                        <ImageIcon className="w-6 h-6 text-zinc-400" />
                        <span>Chưa có bìa</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {editTitle && (
                      <h3 
                        className="font-bold text-sm sm:text-lg leading-snug tracking-tight line-clamp-2" 
                        style={{ color: titleColor }}
                      >
                        {editTitle}
                      </h3>
                    )}

                    {editAuthor && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: cardTheme.textMutedColor }}>
                        <Feather className="w-3.5 h-3.5 shrink-0" style={{ color: tagColor }} />
                        <span className="font-medium truncate">{editAuthor}</span>
                      </div>
                    )}

                    {/* MỤC TAG VÀ TÌNH TRẠNG: HIỂN THỊ TỪNG Ô RIÊNG BIỆT KHÔNG BỊ DÍNH KHI XUẤT ẢNH */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
                      {editStatus && (
                        <span 
                          style={{
                            display: 'inline-block',
                            marginRight: '6px',
                            marginBottom: '6px',
                            padding: '2px 9px',
                            borderRadius: '9999px',
                            border: `1px solid ${editStatus.includes('Hoàn') ? 'rgba(16, 185, 129, 0.5)' : hexToRgba(tagColor, 0.5)}`,
                            backgroundColor: editStatus.includes('Hoàn') ? 'rgba(16, 185, 129, 0.2)' : hexToRgba(tagColor, 0.2),
                            color: editStatus.includes('Hoàn') ? '#10b981' : tagColor,
                            fontSize: '10.5px',
                            fontWeight: 600,
                            lineHeight: '1.35',
                            verticalAlign: 'middle',
                            whiteSpace: 'nowrap',
                            boxSizing: 'border-box'
                          }}
                        >
                          {editStatus}
                        </span>
                      )}

                      {parsedTags.map((tagItem, idx) => (
                        <span 
                          key={idx}
                          style={{
                            display: 'inline-block',
                            marginRight: '6px',
                            marginBottom: '6px',
                            padding: '2px 9px',
                            borderRadius: '9999px',
                            border: `1px solid ${hexToRgba(tagColor, 0.45)}`,
                            backgroundColor: hexToRgba(tagColor, 0.18),
                            color: isLightBackground ? '#0f172a' : tagColor,
                            fontSize: '10.5px',
                            fontWeight: 500,
                            lineHeight: '1.35',
                            verticalAlign: 'middle',
                            whiteSpace: 'nowrap',
                            boxSizing: 'border-box'
                          }}
                        >
                          {tagItem}
                        </span>
                      ))}
                    </div>

                    <div className="pt-1 space-y-1 text-xs">
                      {editScore && (
                        <div className="flex items-baseline gap-1.5 truncate">
                          <span className="text-[11px] shrink-0" style={{ color: cardTheme.textMutedColor }}>Điểm tích lũy:</span>
                          <span 
                            className="font-bold font-mono text-xs" 
                            style={{ color: titleColor }}
                          >
                            {editScore}
                          </span>
                        </div>
                      )}

                      {editWordCount && (
                        <div className="flex items-baseline gap-1.5 truncate">
                          <span className="text-[11px] shrink-0" style={{ color: cardTheme.textMutedColor }}>Số chữ:</span>
                          <span className="font-medium" style={{ color: cardTheme.textColor }}>
                            {editWordCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Giới thiệu */}
                {editIntro && (
                  <div 
                    className="relative z-10 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border backdrop-blur-md text-xs leading-relaxed"
                    style={{
                      backgroundColor: cardTheme.introBoxBg,
                      borderColor: cardTheme.introBoxBorder,
                      color: cardTheme.introBoxText
                    }}
                  >
                    <div 
                      className="flex items-center gap-1 font-bold text-[11px] mb-1.5" 
                      style={{ color: titleColor }}
                    >
                      <AlignLeft className="w-3 h-3" />
                      <span>Giới thiệu:</span>
                    </div>
                    <p className="line-clamp-4 text-[11.5px] opacity-95 whitespace-pre-line leading-relaxed">
                      {editIntro}
                    </p>
                  </div>
                )}

                {/* Nhận xét cá nhân */}
                {showReview && editReview && (
                  <div 
                    className="relative z-10 p-3 rounded-xl sm:rounded-2xl border backdrop-blur-md text-xs"
                    style={{
                      backgroundColor: hexToRgba(tagColor, 0.15),
                      borderColor: hexToRgba(tagColor, 0.35),
                      color: cardTheme.textColor
                    }}
                  >
                    <div className="flex items-center gap-1 font-bold text-[11px] mb-1" style={{ color: tagColor }}>
                      <MessageSquareQuote className="w-3.5 h-3.5" />
                      <span>Nhận xét:</span>
                    </div>
                    <p className="text-[11.5px] italic opacity-95">
                      "{editReview}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Các nút tải xuống / sao chép */}
            <div className="w-full flex items-center gap-2.5 sm:gap-3 mt-3">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                style={{ 
                  backgroundColor: badgeColor,
                  boxShadow: `0 4px 18px ${hexToRgba(badgeColor, 0.45)}`
                }}
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Đang tạo ảnh...' : 'Tải ảnh PNG'}</span>
              </button>

              <button
                onClick={handleCopy}
                disabled={isExporting}
                className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold text-xs border border-zinc-700 bg-[#201f29] hover:bg-[#2a2936] text-white flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-300" />
                    <span className="hidden xs:inline">Sao chép ảnh</span>
                    <span className="xs:hidden">Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CỘT 2: BỘ CÔNG CỤ TÙY CHỈNH */}
          <div className={`lg:col-span-5 flex flex-col gap-3.5 ${
            activeTab === 'preview' ? 'hidden sm:flex' : 'flex'
          }`}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 shrink-0">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Tùy chỉnh thẻ truyện</span>
              </span>
              <button
                onClick={handleResetToDefault}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                title="Khôi phục gốc"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Khôi phục gốc</span>
              </button>
            </div>

            {/* MỤC: TẢI ẢNH BÌA LÊN */}
            <div className="p-3 sm:p-3.5 rounded-2xl border border-zinc-800 bg-[#1a1922] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ảnh bìa truyện</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 rounded-xl border border-zinc-700 bg-[#0c0b10] hover:bg-[#181720] text-zinc-200 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-medium"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tải ảnh từ máy lên</span>
                </button>
              </div>

              {/* Dán link ảnh online nếu muốn */}
              <div className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Hoặc dán URL link ảnh bìa..."
                  value={coverDataUrl.startsWith('data:') ? '' : coverDataUrl}
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    setCoverDataUrl(url);
                    if (url) {
                      extractPaletteFromImage(url).then(newPalette => {
                        if (newPalette?.colors && newPalette.colors.length > 0) {
                          setExtractedColors(newPalette.colors);
                          setCardBgColor1(newPalette.dominant);
                          setCardBgColor2(newPalette.secondaryBg || newPalette.colors[1] || newPalette.dominant);
                          setTitleColor(newPalette.accent);
                          setBadgeColor(newPalette.accent);
                          setTagColor(newPalette.secondary);
                          setIntroBoxColor(newPalette.dominant);
                        }
                      }).catch(() => {});
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-700/80 bg-[#0c0b10] text-white text-[11px] focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* MỤC: BẬT / TẮT HUY HIỆU THỨ HẠNG */}
            <div className="p-3 rounded-2xl border border-zinc-800 bg-[#1a1922] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hiện huy hiệu thứ hạng</span>
                </label>
                <input 
                  type="checkbox"
                  checked={showRankingBadge}
                  onChange={(e) => setShowRankingBadge(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-amber-500"
                />
              </div>

              {showRankingBadge && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={editRankingLabel}
                    onChange={(e) => setEditRankingLabel(e.target.value)}
                    placeholder="Nhập nội dung huy hiệu..."
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-700 bg-[#0c0b10] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            {/* MỤC: ĐỔI MÀU THEO MÀU BÌA - TỐI ƯU CỰC ĐẸP TRÊN DI ĐỘNG */}
            <div className="p-3 sm:p-3.5 rounded-2xl border border-zinc-800 bg-[#1a1922] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đổi màu theo màu bìa</span>
                </label>
              </div>

              {/* Danh sách từng mục kèm dải mã màu bìa để chọn trực tiếp */}
              <div className="space-y-2">
                {colorCustomizableSections.map((section) => (
                  <div 
                    key={section.id} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 p-2 rounded-xl bg-[#111016] border border-zinc-800/80"
                  >
                    <span className="text-[11px] font-semibold text-zinc-300 shrink-0">
                      {section.label}:
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {extractedColors.map((hex, idx) => {
                        const isSelected = section.currentColor.toLowerCase() === hex.toLowerCase();
                        return (
                          <button
                            key={idx}
                            onClick={() => section.setter(hex)}
                            className="w-6 h-6 rounded-lg border transition-all cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95"
                            style={{
                              backgroundColor: hex,
                              borderColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                              boxShadow: isSelected ? `0 0 10px ${hexToRgba(hex, 0.8)}` : undefined
                            }}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white drop-shadow-md" />
                            )}
                          </button>
                        );
                      })}

                      <label className="relative w-6 h-6 rounded-lg border border-zinc-700 overflow-hidden cursor-pointer shrink-0 hover:scale-110 transition-transform" title="Chọn màu tự do">
                        <input 
                          type="color" 
                          value={section.currentColor} 
                          onChange={(e) => section.setter(e.target.value)} 
                          className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer opacity-0"
                        />
                        <div className="w-full h-full" style={{ backgroundColor: section.currentColor }} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MỤC: CHỈNH SỬA THÔNG TIN */}
            <div className="space-y-2.5 text-xs">
              {/* Tên truyện */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1 mb-1">
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  <span>Tên truyện:</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Nhập tên truyện..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-[#0c0b10] text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                />
              </div>

              {/* Tác giả & Tình trạng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1 mb-1">
                    <Feather className="w-3 h-3 text-amber-400" />
                    <span>Tác giả:</span>
                  </label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    placeholder="Tên tác giả..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-[#0c0b10] text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1 mb-1">
                    <span>Tình trạng:</span>
                  </label>
                  <input
                    type="text"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    placeholder="Đã hoàn thành / Đang ra..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-[#0c0b10] text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                  />
                </div>
              </div>

              {/* Tag của truyện */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1 mb-1">
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span>Tag truyện:</span>
                </label>
                <input
                  type="text"
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                  placeholder="Ví dụ: 强强, 无限流, 爽文..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-[#0c0b10] text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                />
              </div>

              {/* Điểm tích lũy & Số chữ: Chỉ hiển thị với truyện tự tạo */}
              {isCustomNovel && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1 mb-1">
                      <span>Điểm tích lũy:</span>
                    </label>
                    <input
                      type="text"
                      value={editScore}
                      onChange={(e) => setEditScore(e.target.value)}
                      placeholder="Ví dụ: 57,830,731,776"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-[#0c0b10] text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1 mb-1">
                      <span>Số chữ:</span>
                    </label>
                    <input
                      type="text"
                      value={editWordCount}
                      onChange={(e) => setEditWordCount(e.target.value)}
                      placeholder="Ví dụ: 1,500,000 chữ"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-[#0c0b10] text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                    />
                  </div>
                </div>
              )}

              {/* Giới thiệu */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1 mb-1">
                  <AlignLeft className="w-3 h-3 text-amber-400" />
                  <span>Giới thiệu:</span>
                </label>
                <textarea
                  rows={3}
                  value={editIntro}
                  onChange={(e) => setEditIntro(e.target.value)}
                  placeholder="Nhập nội dung giới thiệu..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-[#0c0b10] text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 resize-y"
                />
              </div>

              {/* Nhận xét cá nhân */}
              <div className="p-3 rounded-xl border border-zinc-800 bg-[#1a1922] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nhận xét cá nhân:</span>
                  </label>
                  <input 
                    type="checkbox"
                    checked={showReview}
                    onChange={(e) => setShowReview(e.target.checked)}
                    className="cursor-pointer accent-amber-500 w-4 h-4"
                  />
                </div>

                {showReview && (
                  <textarea
                    rows={2}
                    value={editReview}
                    onChange={(e) => setEditReview(e.target.value)}
                    placeholder="Nhập nhận xét của bạn..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-[#0c0b10] text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 resize-none"
                  />
                )}
              </div>

              {/* Thanh nút hành động nhanh trên mobile khi đang ở tab Chỉnh sửa */}
              <div className="flex sm:hidden items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-700 bg-[#201f29] text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Xem trước ảnh</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 text-white shadow-md cursor-pointer"
                  style={{ backgroundColor: badgeColor }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Đang tạo...' : 'Tải ảnh PNG'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

