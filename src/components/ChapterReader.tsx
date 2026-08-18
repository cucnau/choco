import React, { useState, useEffect } from 'react';
import { Story, Chapter, Comment, UserProfile } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  CornerDownRight, 
  X, 
  Send,
  Lock,
  Key,
  RefreshCw,
  AlertCircle,
  BookmarkCheck
} from 'lucide-react';
import { saveReadingProgress, getReadingProgress } from '../lib/readingProgress';
import { ReadingEffects } from './ReadingEffects';
import { getStoryBorderStyle, StoryCornerAccents } from '../lib/borderStyles';
import { PRESET_THEME_COLORS } from '../lib/themeConstants';

const PRESET_PROGRESS_BAR_COLORS: Record<string, string> = {
  'dark-rose': '#ff99bb',
  'sepia': '#8c5e3c',
  'emerald': '#2a6b4e',
  'slate': '#60a5fa',
  'classic-dark': '#e5e5e5',
  'classic-black': '#ffffff',
  'dark-violet': '#c084fc',
  'navy-blue': '#38bdf8',
  'gradient-rose': '#ff99bb',
  'gradient-midnight': '#c084fc',
  'gradient-ocean': '#38bdf8',
  'gradient-emerald': '#34d399',
  'gradient-sunset': '#fb923c',
  'gradient-cyber': '#e879f9',
  'gradient-gold': '#fbbf24',
  'gradient-cherry': '#f472b6',
};

interface ChapterReaderProps {
  story: Story;
  chapter: Chapter;
  allChapters: Chapter[];
  comments: Comment[];
  currentUser?: { uid: string; email?: string | null; displayName?: string | null } | null;
  userProfile?: UserProfile | null;
  isAdmin?: boolean;
  onSelectChapter: (chapter: Chapter) => void;
  onBackToStory: () => void;
  onAddComment: (content: string, chapterId: string, paragraphIndex?: number, paragraphSnippet?: string, parentCommentId?: string, parentCommentAuthorUid?: string) => void;
  onUnlockChapter?: (chapterId: string, price: number, authorUid?: string) => Promise<{ success: boolean; error?: string; remainingChucu?: number }>;
  onOpenRechargeModal?: () => void;
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  story,
  chapter,
  allChapters,
  comments,
  currentUser,
  userProfile,
  isAdmin = false,
  onSelectChapter,
  onBackToStory,
  onAddComment,
  onUnlockChapter,
  onOpenRechargeModal,
}) => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [readerFont, setReaderFont] = useState<string>(story.customBodyFont || story.defaultFont || 'font-bevietnam');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [readingProgressPercent, setReadingProgressPercent] = useState<number>(0);
  const [autoResumeNotice, setAutoResumeNotice] = useState<string | null>(null);

  const storyTitleFont = story.customTitleFont || story.defaultFont || 'font-mono';
  const storyMutedFont = story.customMutedFont || story.defaultFont || 'font-mono';
  const storyBtnFont = story.customBtnFont || story.defaultFont || 'font-mono';
  const storyBodyFont = readerFont;

  useEffect(() => {
    const currentBodyFont = story.customBodyFont || story.defaultFont;
    if (currentBodyFont) {
      setReaderFont(currentBodyFont);
    }
    if (story.bodyFontSize) {
      const parsed = parseInt(story.bodyFontSize);
      if (!isNaN(parsed) && parsed > 0) {
        setFontSize(parsed);
      }
    }
  }, [story.id, story.customBodyFont, story.defaultFont, story.bodyFontSize]);

  const [generalCommentText, setGeneralCommentText] = useState('');
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);
  const [paraCommentText, setParaCommentText] = useState('');
  const [commentFilter, setCommentFilter] = useState<'all' | 'general' | 'paragraph'>('all');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const sortedChapters = [...allChapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentIndex = sortedChapters.findIndex(c => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  // Kiểm tra quyền đọc chương
  const isAuthorOrOwner = 
    (currentUser?.uid && story.authorUid && currentUser.uid === story.authorUid) ||
    (currentUser?.email && story.authorEmail && currentUser.email.toLowerCase() === story.authorEmail.toLowerCase()) ||
    isAdmin;

  const isAlreadyUnlockedByUser = !!(
    userProfile?.unlockedChapters && 
    userProfile.unlockedChapters.includes(chapter.id)
  );

  const isChapterReadable = !chapter.isLocked || isAlreadyUnlockedByUser || isAuthorOrOwner;
  const unlockPrice = chapter.unlockPrice && chapter.unlockPrice > 0 ? chapter.unlockPrice : 1;
  const currentChucuBalance = userProfile?.chucu || 0;

  // Tự động khôi phục vị trí đọc dở khi mở chương
  useEffect(() => {
    if (!isChapterReadable) return;

    const saved = getReadingProgress(story.id);
    if (saved && saved.chapterId === chapter.id && saved.scrollY && saved.scrollY > 120) {
      const targetY = saved.scrollY;
      const timer = setTimeout(() => {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        setAutoResumeNotice(`Đã khôi phục vị trí đọc dở (${saved.progressPercent || 0}%)`);
      }, 200);

      const hideToast = setTimeout(() => {
        setAutoResumeNotice(null);
      }, 4500);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideToast);
      };
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [story.id, chapter.id, isChapterReadable]);

  // Lắng nghe cuộn trang & tự động lưu vị trí đọc
  useEffect(() => {
    if (!isChapterReadable) return;

    let timeoutId: any = null;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = totalHeight > 0 ? Math.min(100, Math.max(0, Math.round((scrollY / totalHeight) * 100))) : 0;

      setReadingProgressPercent(percent);

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveReadingProgress(story.id, chapter.id, chapter.title, chapter.chapterNumber, scrollY, percent);
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [story.id, chapter.id, chapter.title, chapter.chapterNumber, isChapterReadable]);

  const handleUnlockClick = async () => {
    if (!currentUser) {
      setUnlockError('Vui lòng đăng nhập để mở khóa chương.');
      return;
    }

    if (currentChucuBalance < unlockPrice) {
      setUnlockError(`Bạn không đủ Chucu để mở khóa. Cần ${unlockPrice} Chucu (Hiện có: ${currentChucuBalance} Chucu).`);
      return;
    }

    if (!onUnlockChapter) return;

    setIsUnlocking(true);
    setUnlockError(null);

    try {
      const res = await onUnlockChapter(chapter.id, unlockPrice, story.authorUid);
      if (!res.success) {
        setUnlockError(res.error || 'Có lỗi xảy ra khi mở khóa chương.');
      }
    } catch (err: any) {
      setUnlockError(err.message || 'Lỗi khi mở khóa chương.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleGeneralCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generalCommentText.trim()) return;
    onAddComment(generalCommentText.trim(), chapter.id);
    setGeneralCommentText('');
  };

  const handleParagraphCommentSubmit = (e: React.FormEvent, idx: number, snippet: string) => {
    e.preventDefault();
    if (!paraCommentText.trim()) return;
    onAddComment(paraCommentText.trim(), chapter.id, idx, snippet.slice(0, 100));
    setParaCommentText('');
  };

  // Đồng bộ hệ thống màu sắc theo chuẩn LiveStoryEditor
  const hasSeparateTheme = story.useSeparateChapterTheme;
  const toneKey = hasSeparateTheme ? (story.chapterThemeTone || 'dark-rose') : (story.themeTone || 'dark-rose');
  const isCustomTheme = toneKey === 'custom';
  const activePreset = PRESET_THEME_COLORS[toneKey] || PRESET_THEME_COLORS['dark-rose'];

  const currentBg = isCustomTheme
    ? (hasSeparateTheme ? (story.chapterCustomBgColor || '#080406') : (story.customBgColor || '#080406'))
    : activePreset.bg;
  const currentCardBg = isCustomTheme
    ? (hasSeparateTheme ? (story.chapterCustomCardBgColor || '#11090c') : (story.customCardBgColor || '#11090c'))
    : activePreset.cardBg;
  const currentText = isCustomTheme
    ? (hasSeparateTheme ? (story.chapterCustomTextColor || '#f2e6ea') : (story.customTextColor || '#f2e6ea'))
    : activePreset.text;
  const currentTextMuted = isCustomTheme
    ? (hasSeparateTheme ? (story.chapterCustomTextMutedColor || '#d0a0b0') : (story.customTextMutedColor || '#d0a0b0'))
    : activePreset.textMuted;
  const currentBorder = isCustomTheme
    ? (hasSeparateTheme ? (story.chapterCustomBorderColor || '#2d1822') : (story.customBorderColor || '#2d1822'))
    : activePreset.border;
  const currentBtnBg = isCustomTheme
    ? (hasSeparateTheme ? (story.chapterCustomBtnBgColor || '#2b1620') : (story.customBtnBgColor || '#2b1620'))
    : activePreset.btnBg;
  const currentBtnSecondaryBg = isCustomTheme
    ? (hasSeparateTheme ? (story.chapterCustomBtnSecondaryBgColor || '#1c0f16') : (story.customBtnSecondaryBgColor || '#1c0f16'))
    : (activePreset.btnSecondaryBg || activePreset.btnBg);
  const currentBtnBorder = isCustomTheme ? currentBorder : activePreset.btnBorder;
  const currentBtnText = isCustomTheme ? currentText : activePreset.btnText;

  const progressBarColor = isCustomTheme
    ? (currentBtnBg && currentBtnBg !== currentBg ? currentBtnBg : currentText || '#ff99bb')
    : (PRESET_PROGRESS_BAR_COLORS[toneKey] || '#ff99bb');

  // Viền, góc trang trí và phát sáng
  const activeBorderStyle = hasSeparateTheme ? (story.chapterBorderStyle || 'solid') : (story.borderStyle || 'solid');
  const activeBorderWidth = hasSeparateTheme ? (story.chapterBorderWidth || 'thin') : (story.borderWidth || 'thin');
  const activeBorderRadius = hasSeparateTheme ? (story.chapterBorderRadius || 'none') : (story.borderRadius || 'none');
  const activeBorderCornerAccent = hasSeparateTheme ? (story.chapterBorderCornerAccent || 'none') : (story.borderCornerAccent || 'none');
  const activeBorderGlow = hasSeparateTheme ? (story.chapterBorderGlow || 'none') : (story.borderGlow || 'none');

  const hasSeparateEffect = story.useSeparateChapterEffect || story.useSeparateChapterTheme;
  const activeReadingEffect = hasSeparateEffect ? (story.chapterReadingEffect || 'none') : (story.readingEffect || 'none');

  const borderObj = {
    borderStyle: activeBorderStyle,
    borderWidth: activeBorderWidth,
    borderRadius: activeBorderRadius,
    borderCornerAccent: activeBorderCornerAccent,
    borderGlow: activeBorderGlow,
    customBorderColor: currentBorder,
  };

  const isDarkTheme = !currentBg.toLowerCase().includes('#fff') && !currentBg.toLowerCase().includes('255, 255, 255');

  const paragraphs = chapter.content
    ? chapter.content.split('\n').map((line) => line.trim()).filter(Boolean)
    : [];

  const calculatedWordCount = chapter.wordCount || (chapter.content ? chapter.content.split(/\s+/).filter(Boolean).length : 0);

  const generalComments = comments.filter((c) => c.paragraphIndex === undefined);
  const paragraphComments = comments.filter((c) => c.paragraphIndex !== undefined);

  const displayedComments = commentFilter === 'all'
    ? comments
    : commentFilter === 'general'
    ? generalComments
    : paragraphComments;

  return (
    <div 
      className={`min-h-screen pb-20 transition-colors duration-300 relative ${readerFont}`}
      style={{
        background: currentBg,
        color: currentText,
      }}
    >
      {/* Hiệu ứng hạt rơi ở trang đọc chương */}
      {activeReadingEffect !== 'none' && <ReadingEffects effect={activeReadingEffect} isDarkTheme={isDarkTheme} />}
      
      {/* Top Fixed Control Bar */}
      <div 
        className="sticky top-0 z-40 px-4 py-2.5 transition-colors duration-300 border-b relative shadow-sm backdrop-blur-xs"
        style={{
          background: currentCardBg,
          borderColor: currentBorder,
        }}
      >
        {/* Active Reading Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 h-[3px] transition-all duration-150" 
          style={{ 
            width: `${readingProgressPercent}%`,
            backgroundColor: progressBarColor
          }} 
        />

        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          
          <button
            onClick={onBackToStory}
            className="flex items-center gap-1.5 hover:opacity-80 transition font-bold"
            style={{ color: currentText }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="truncate max-w-[150px] sm:max-w-xs">{story.title}</span>
          </button>

          {/* Toast thông báo khôi phục vị trí đọc */}
          {autoResumeNotice && (
            <div 
              className="hidden md:flex items-center gap-1.5 px-3 py-1 text-[11px] rounded-full border shadow-xs animate-pulse"
              style={{
                background: currentBtnBg,
                borderColor: currentBtnBorder,
                color: currentBtnText,
              }}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{autoResumeNotice}</span>
            </div>
          )}

          {/* Quick Reader Customizer: Font family & Size */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Font Selector */}
            <select
              value={readerFont}
              onChange={(e) => setReaderFont(e.target.value)}
              className="border px-2 py-1 text-[11px] rounded outline-none cursor-pointer"
              style={{
                background: currentBg,
                borderColor: currentBorder,
                color: currentText,
              }}
            >
              <option value="font-bevietnam">Be Vietnam Pro</option>
              <option value="font-inter">Inter</option>
              <option value="font-merriweather">Merriweather</option>
              <option value="font-lora">Lora</option>
              <option value="font-cormorant">Cormorant Garamond</option>
              <option value="font-roboto">Roboto</option>
              <option value="font-montserrat">Montserrat</option>
              <option value="font-nunito">Nunito</option>
              <option value="font-quicksand">Quicksand</option>
              <option value="font-mulish">Mulish</option>
              <option value="font-notosans">Noto Sans</option>
              <option value="font-lexend">Lexend</option>
              <option value="font-charm">Charm</option>
              <option value="font-dancing">Dancing Script</option>
              <option value="font-pacifico">Pacifico</option>
              <option value="font-mono">JetBrains Mono</option>
            </select>

            {/* Font Size Adjusters */}
            <div 
              className="flex items-center gap-1 border px-2 py-0.5 rounded text-xs"
              style={{
                background: currentBg,
                borderColor: currentBorder,
              }}
            >
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                className="px-1 hover:opacity-80 font-bold"
                style={{ color: currentText }}
                title="Giảm cỡ chữ"
              >
                A-
              </button>
              <span className="font-bold px-1" style={{ color: currentText }}>{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(26, fontSize + 2))}
                className="px-1 hover:opacity-80 font-bold"
                style={{ color: currentText }}
                title="Tăng cỡ chữ"
              >
                A+
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Chapter Content Container */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8 relative z-20">
        
        {/* Unified Chapter Article Card (matching Live Story Editor) */}
        <article
          className="p-6 sm:p-10 space-y-6 relative overflow-hidden transition-all duration-200 shadow-xl"
          style={{
            background: currentCardBg,
            color: currentText,
            fontSize: `${fontSize}px`,
            lineHeight: 1.85,
            ...getStoryBorderStyle(borderObj, currentBorder),
          }}
        >
          {/* Vintage/Brackets Corner Decorators */}
          <StoryCornerAccents accent={activeBorderCornerAccent} color={currentBorder} />

          {/* Chapter Header: Story title, volume title, chapter title, lock badge, meta */}
          <div className="text-center space-y-2 pb-5 border-b border-dashed" style={{ borderColor: currentBorder }}>
            <div className={`flex items-center justify-center gap-2 flex-wrap text-[11px] font-bold tracking-wider ${storyMutedFont}`} style={{ color: currentTextMuted }}>
              <span>{story.title}</span>
              {chapter.volumeTitle && (
                <>
                  <span className="opacity-50">•</span>
                  <span className="text-opacity-90">{chapter.volumeTitle}</span>
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1 
                className={`font-bold tracking-wide leading-snug ${storyBodyFont} ${story.titleFontSize ? '' : 'text-xl sm:text-2xl'}`} 
                style={{
                  color: currentText,
                  ...(story.titleFontSize ? { fontSize: story.titleFontSize } : {})
                }}
              >
                {chapter.title}
              </h1>
              {chapter.isLocked && (
                <span 
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-xs font-semibold rounded shadow-xs ${storyBtnFont}`}
                  style={{
                    background: currentBtnBg,
                    borderColor: currentBtnBorder,
                    color: currentBtnText,
                  }}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{unlockPrice} Chucu</span>
                </span>
              )}
            </div>
            <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-mono ${storyMutedFont}`} style={{ color: currentTextMuted }}>
              {story.author && <span>Người đăng: {story.author}</span>}
              {story.author && <span>•</span>}
              <span>{calculatedWordCount.toLocaleString()} chữ</span>
              <span>•</span>
              <span>Cập nhật: {chapter.createdAt}</span>
            </div>
          </div>

          {/* Locked Screen or Chapter Paragraph Content */}
          {!isChapterReadable ? (
            /* Locked Chapter Paywall Screen */
            <div 
              className={`p-6 sm:p-10 text-center space-y-5 rounded transition-colors duration-200 border ${storyBodyFont}`}
              style={{
                background: currentBg,
                borderColor: currentBorder,
              }}
            >
              <div className="space-y-2">
                <div 
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center border shadow-xs"
                  style={{
                    background: currentBtnBg,
                    borderColor: currentBtnBorder,
                    color: currentBtnText,
                  }}
                >
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className={`text-base sm:text-lg font-bold uppercase tracking-wider ${storyBodyFont}`} style={{ color: currentText }}>
                  Chương này đã bị khóa
                </h3>
                <p className={`text-xs ${storyMutedFont}`} style={{ color: currentTextMuted }}>
                  Tác giả yêu cầu mở khóa bằng Chucu để đọc tiếp nội dung chương này.
                </p>
              </div>

              {unlockError && (
                <div className="max-w-md mx-auto p-3 bg-[#3e141a] border border-[#a2202f] text-xs text-[#ffccd1] flex items-center gap-2 text-left rounded">
                  <AlertCircle className="w-4 h-4 text-[#ff9aa6] shrink-0" />
                  <span>{unlockError}</span>
                </div>
              )}

              <div 
                className={`border p-4 max-w-sm mx-auto space-y-2 text-xs rounded ${storyMutedFont}`}
                style={{
                  background: currentCardBg,
                  borderColor: currentBorder,
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: currentTextMuted }}>Giá mở khóa:</span>
                  <span className="font-bold" style={{ color: currentText }}>{unlockPrice} Chucu</span>
                </div>
                <div 
                  className="flex items-center justify-between border-t pt-2"
                  style={{ borderColor: currentBorder }}
                >
                  <span style={{ color: currentTextMuted }}>Số dư Chucu hiện tại:</span>
                  <span className="font-bold" style={{ color: currentText }}>{currentChucuBalance} Chucu</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleUnlockClick}
                  disabled={isUnlocking}
                  className={`w-full sm:w-auto px-6 py-2.5 border font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 ${storyBtnFont}`}
                  style={{
                    background: currentBtnBg,
                    borderColor: currentBtnBorder,
                    color: currentBtnText,
                  }}
                >
                  {isUnlocking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang mở khóa...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Mở khóa chương ({unlockPrice} Chucu)</span>
                    </>
                  )}
                </button>

                {currentChucuBalance < unlockPrice && onOpenRechargeModal && (
                  <button
                    onClick={onOpenRechargeModal}
                    className={`w-full sm:w-auto px-5 py-2.5 border font-bold text-xs uppercase tracking-wider rounded transition ${storyBtnFont}`}
                    style={{
                      background: currentBtnSecondaryBg,
                      borderColor: currentBtnBorder,
                      color: currentText,
                    }}
                  >
                    Nạp thêm Chucu
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Text Content with Paragraph-level commenting */
            <div className={`space-y-5 text-sm leading-relaxed ${storyBodyFont}`} style={{ color: currentText }}>
              {paragraphs.length > 0 ? (
                paragraphs.map((para, idx) => {
                  const paraComments = comments.filter((c) => c.paragraphIndex === idx);
                  const isActive = activeParagraphIndex === idx;

                  return (
                    <div
                      key={idx}
                      id={`para-${idx}`}
                      className="group/para relative transition-all duration-200"
                    >
                      <div className="relative flex items-start gap-2">
                        <p className={`leading-relaxed flex-1 transition-opacity ${isActive ? 'opacity-100 font-medium' : ''}`}>
                          {para}
                        </p>

                        {/* Subtle Paragraph Comment Button */}
                        <div className="shrink-0 pt-0.5">
                          <button
                            onClick={() => setActiveParagraphIndex(isActive ? null : idx)}
                            title={
                              paraComments.length > 0
                                ? `${paraComments.length} bình luận cho đoạn này`
                                : 'Thêm bình luận cho đoạn này'
                            }
                            style={{
                              borderColor: currentBorder,
                              color: currentText,
                              backgroundColor: paraComments.length > 0 ? currentBtnBg : 'transparent',
                            }}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] rounded transition-all duration-200 border select-none ${
                              paraComments.length > 0
                                ? 'shadow-xs font-semibold'
                                : 'opacity-0 group-hover/para:opacity-60 hover:!opacity-100'
                            }`}
                          >
                            <MessageSquare className="w-3 h-3 opacity-80" />
                            {paraComments.length > 0 && <span>{paraComments.length}</span>}
                          </button>
                        </div>
                      </div>

                      {/* Elegant Inline Paragraph Discussion Card */}
                      {isActive && (
                        <div 
                          className="mt-3 p-4 border text-xs space-y-3 transition-colors duration-200 rounded shadow-sm"
                          style={{
                            background: currentBg,
                            borderColor: currentBorder,
                            color: currentText,
                          }}
                        >
                          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: currentBorder }}>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs flex items-center gap-1.5" style={{ color: currentText }}>
                                <CornerDownRight className="w-3.5 h-3.5 opacity-70" />
                                <span>Bình luận đoạn #{idx + 1}</span>
                              </span>
                              <span className="text-[11px] opacity-70" style={{ color: currentTextMuted }}>
                                ({paraComments.length} thảo luận)
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveParagraphIndex(null)}
                              className="opacity-60 hover:opacity-100 p-1 transition"
                              title="Đóng"
                              style={{ color: currentText }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Comments list for this paragraph */}
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {paraComments.length === 0 ? (
                              <p className="text-[11px] italic py-1 opacity-70" style={{ color: currentTextMuted }}>
                                Chưa có bình luận nào cho đoạn này.
                              </p>
                            ) : (
                              paraComments.map((cm) => (
                                <div 
                                  key={cm.id} 
                                  className="p-2.5 border text-xs space-y-1 rounded"
                                  style={{
                                    background: currentCardBg,
                                    borderColor: currentBorder,
                                  }}
                                >
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold" style={{ color: currentText }}>{cm.userName}</span>
                                    <span className="text-[10px] opacity-65" style={{ color: currentTextMuted }}>{cm.createdAt}</span>
                                  </div>
                                  <p className="leading-relaxed opacity-90" style={{ color: currentText }}>
                                    {cm.content}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Comment Input Box for this paragraph */}
                          <form onSubmit={(e) => handleParagraphCommentSubmit(e, idx, para)} className="flex gap-2 pt-1">
                            <input
                              type="text"
                              value={paraCommentText}
                              onChange={(e) => setParaCommentText(e.target.value)}
                              placeholder={`Ý kiến của bạn về đoạn #${idx + 1}...`}
                              className="flex-1 border p-2 text-xs focus:outline-none rounded transition"
                              style={{
                                background: currentCardBg,
                                borderColor: currentBorder,
                                color: currentText,
                              }}
                            />
                            <button
                              type="submit"
                              disabled={!paraCommentText.trim()}
                              className={`px-3 py-1.5 border text-xs font-semibold uppercase disabled:opacity-40 transition flex items-center gap-1 shrink-0 rounded ${storyBtnFont}`}
                              style={{
                                background: currentBtnBg,
                                borderColor: currentBtnBorder,
                                color: currentBtnText,
                              }}
                            >
                              <Send className="w-3 h-3" />
                              <span>Gửi</span>
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="italic" style={{ color: currentTextMuted }}>Nội dung chương này chưa được cập nhật.</p>
              )}
            </div>
          )}

          {/* Navigation Controls inside Card */}
          <div className="pt-6 border-t border-dashed space-y-4" style={{ borderColor: currentBorder }}>
            <div className="flex items-center justify-between gap-2 font-mono text-xs">
              <button
                disabled={!prevChapter}
                onClick={() => prevChapter && onSelectChapter(prevChapter)}
                className={`px-3.5 py-1.5 rounded border font-bold disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 uppercase tracking-wider ${storyBtnFont}`}
                style={{
                  background: currentBtnSecondaryBg,
                  borderColor: currentBtnBorder,
                  color: currentText,
                }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Chương trước</span>
              </button>

              <button
                onClick={onBackToStory}
                className={`px-4 py-1.5 rounded border font-bold transition uppercase tracking-wider ${storyBtnFont}`}
                style={{
                  background: currentBtnBg,
                  borderColor: currentBtnBorder,
                  color: currentBtnText,
                }}
              >
                Mục lục
              </button>

              <button
                disabled={!nextChapter}
                onClick={() => nextChapter && onSelectChapter(nextChapter)}
                className={`px-3.5 py-1.5 rounded border font-bold disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 uppercase tracking-wider ${storyBtnFont}`}
                style={{
                  background: currentBtnSecondaryBg,
                  borderColor: currentBtnBorder,
                  color: currentText,
                }}
              >
                <span>Chương sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Return link */}
            <div className="text-center font-mono">
              <button
                type="button"
                onClick={onBackToStory}
                className="text-[11px] underline hover:opacity-80 transition"
                style={{ color: currentTextMuted }}
              >
                ← Trở về trang giới thiệu truyện
              </button>
            </div>
          </div>
        </article>

        {/* Chapter Comments Section */}
        <div 
          className="p-5 space-y-4 transition-colors duration-300 rounded shadow-md border"
          style={{
            backgroundColor: currentCardBg,
            borderColor: currentBorder,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: currentBorder }}>
            <h3 
              className={`text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 ${storyBodyFont}`}
              style={{ color: currentText }}
            >
              <MessageSquare className="w-4 h-4" style={{ color: currentTextMuted }} />
              <span>Bình luận chương ({comments.length})</span>
            </h3>

            {/* Filter Tabs */}
            <div className={`flex items-center gap-1 text-[11px] ${storyBtnFont}`}>
              <button
                onClick={() => setCommentFilter('all')}
                className="px-2 py-0.5 border rounded transition"
                style={{
                  backgroundColor: commentFilter === 'all' ? currentBtnBg : currentBg,
                  borderColor: currentBorder,
                  color: commentFilter === 'all' ? currentBtnText : currentTextMuted,
                  fontWeight: commentFilter === 'all' ? 'bold' : 'normal',
                }}
              >
                Tất cả ({comments.length})
              </button>
              <button
                onClick={() => setCommentFilter('general')}
                className="px-2 py-0.5 border rounded transition"
                style={{
                  backgroundColor: commentFilter === 'general' ? currentBtnBg : currentBg,
                  borderColor: currentBorder,
                  color: commentFilter === 'general' ? currentBtnText : currentTextMuted,
                  fontWeight: commentFilter === 'general' ? 'bold' : 'normal',
                }}
              >
                Chung ({generalComments.length})
              </button>
              <button
                onClick={() => setCommentFilter('paragraph')}
                className="px-2 py-0.5 border rounded transition"
                style={{
                  backgroundColor: commentFilter === 'paragraph' ? currentBtnBg : currentBg,
                  borderColor: currentBorder,
                  color: commentFilter === 'paragraph' ? currentBtnText : currentTextMuted,
                  fontWeight: commentFilter === 'paragraph' ? 'bold' : 'normal',
                }}
              >
                Theo đoạn ({paragraphComments.length})
              </button>
            </div>
          </div>

          {/* Form to submit general chapter comment */}
          <form onSubmit={handleGeneralCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={generalCommentText}
              onChange={(e) => setGeneralCommentText(e.target.value)}
              placeholder="Nhập nhận xét chung về chương này..."
              className={`flex-1 border p-2 text-xs focus:outline-none rounded transition ${storyBodyFont}`}
              style={{
                backgroundColor: currentBg,
                borderColor: currentBorder,
                color: currentText,
              }}
            />
            <button
              type="submit"
              disabled={!generalCommentText.trim()}
              className={`px-4 py-1.5 border disabled:opacity-40 text-xs font-bold uppercase tracking-wider flex items-center gap-1 rounded ${storyBtnFont}`}
              style={{
                backgroundColor: currentBtnBg,
                borderColor: currentBtnBorder,
                color: currentBtnText,
              }}
            >
              <Send className="w-3 h-3" />
              <span>Gửi</span>
            </button>
          </form>

          {/* List of comments */}
          <div className="space-y-2">
            {displayedComments.filter(c => !c.parentCommentId).length === 0 ? (
              <div className={`py-6 text-center text-xs ${storyMutedFont}`} style={{ color: currentTextMuted }}>
                {commentFilter === 'paragraph'
                  ? 'Chưa có bình luận theo đoạn nào. Bạn có thể bấm vào biểu tượng bình luận bên cạnh mỗi đoạn văn phía trên để viết!'
                  : 'Chưa có bình luận nào cho mục này.'}
              </div>
            ) : (
              displayedComments.filter(c => !c.parentCommentId).map((cm) => {
                const currentReplies = comments.filter(c => c.parentCommentId === cm.id);
                return (
                  <div 
                    key={cm.id} 
                    className="border p-3.5 text-xs space-y-2 transition-colors duration-300 rounded"
                    style={{
                      backgroundColor: currentBg,
                      borderColor: currentBorder,
                    }}
                  >
                    {/* Header Info */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${storyBtnFont}`} style={{ color: currentText }}>{cm.userName}</span>
                        {cm.paragraphIndex !== undefined && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveParagraphIndex(cm.paragraphIndex!);
                              document.getElementById(`para-${cm.paragraphIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className={`text-[10px] border px-1.5 py-0.2 rounded transition flex items-center gap-1 ${storyMutedFont}`}
                            style={{
                              backgroundColor: currentBtnBg,
                              borderColor: currentBtnBorder,
                              color: currentBtnText,
                            }}
                            title="Bấm để cuộn đến đoạn văn này"
                          >
                            <CornerDownRight className="w-2.5 h-2.5" />
                            <span>Đoạn #{cm.paragraphIndex + 1}</span>
                          </button>
                        )}
                      </div>
                      <span className={`text-[11px] ${storyMutedFont}`} style={{ color: currentTextMuted }}>{cm.createdAt}</span>
                    </div>

                    {/* Snippet (if comment by paragraph) */}
                    {cm.paragraphSnippet && (
                      <div 
                        className={`text-[11px] italic p-1.5 border-l-2 rounded-xs line-clamp-1 ${storyBodyFont}`}
                        style={{
                          backgroundColor: currentCardBg,
                          borderColor: currentBorder,
                          color: currentTextMuted,
                        }}
                      >
                        "{cm.paragraphSnippet}"
                      </div>
                    )}

                    {/* Comment Content */}
                    <p className={`opacity-95 leading-relaxed ${storyBodyFont}`} style={{ color: currentText }}>{cm.content}</p>

                    {/* Reply & Action Buttons */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingToId(replyingToId === cm.id ? null : cm.id);
                          setReplyText('');
                        }}
                        className="text-[11px] font-semibold hover:underline flex items-center gap-1"
                        style={{ color: currentTextMuted }}
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Trả lời</span>
                      </button>
                    </div>

                    {/* Reply Input Form */}
                    {replyingToId === cm.id && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!replyText.trim()) return;
                          onAddComment(replyText.trim(), chapter.id, cm.paragraphIndex, cm.paragraphSnippet, cm.id, cm.userUid);
                          setReplyText('');
                          setReplyingToId(null);
                        }}
                        className="mt-2.5 flex gap-2 pl-3 border-l"
                        style={{ borderColor: currentBorder }}
                      >
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Phản hồi bình luận của ${cm.userName}...`}
                          className="flex-1 border p-1.5 text-xs focus:outline-none rounded"
                          style={{
                            backgroundColor: currentCardBg,
                            borderColor: currentBorder,
                            color: currentText,
                          }}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className={`px-3 py-1 border text-[11px] font-bold uppercase rounded transition ${storyBtnFont}`}
                          style={{
                            backgroundColor: currentBtnBg,
                            borderColor: currentBtnBorder,
                            color: currentBtnText,
                          }}
                        >
                          Gửi
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyText('');
                          }}
                          className="px-2 py-1 text-[11px] opacity-60 hover:opacity-100 transition"
                          style={{ color: currentText }}
                        >
                          Hủy
                        </button>
                      </form>
                    )}

                    {/* Nested Replies */}
                    {currentReplies.length > 0 && (
                      <div className="space-y-2 mt-2 pl-3 border-l" style={{ borderColor: currentBorder }}>
                        {currentReplies.map((reply) => (
                          <div 
                            key={reply.id} 
                            className="p-2 border text-xs space-y-1 rounded"
                            style={{
                              backgroundColor: currentCardBg,
                              borderColor: currentBorder,
                            }}
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold" style={{ color: currentText }}>{reply.userName}</span>
                              <span className="text-[10px]" style={{ color: currentTextMuted }}>{reply.createdAt}</span>
                            </div>
                            <p className="opacity-90" style={{ color: currentText }}>{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </main>
    </div>
  );
};
