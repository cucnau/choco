import React, { useState, useEffect } from 'react';
import { Story, Chapter, Comment, UserProfile } from '../types';
import { EmojiPickerButton, CommentReactions, FormattedCommentContent, QuickEmojiBar, ReactionSummary } from './CustomEmoji';
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
  BookmarkCheck,
  Eye,
  EyeOff,
  HelpCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { saveReadingProgress, getReadingProgress } from '../lib/readingProgress';
import { getUserUnlockedPasswordChaptersLocal, unlockChapterWithPassword } from '../lib/storage';
import { ReadingEffects } from './ReadingEffects';
import { getStoryBorderStyle, StoryCornerAccents } from '../lib/borderStyles';
import { PRESET_THEME_COLORS } from '../lib/themeConstants';
import { parseChapterContentBlocks, SpecialBlockRenderer } from './ChapterSpecialBlocks';
import { ProtectedStoryText } from './ProtectedStoryText';

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
  isEditor?: boolean;
  onSelectChapter: (chapter: Chapter) => void;
  onBackToStory: () => void;
  onAddComment: (content: string, chapterId: string, paragraphIndex?: number, paragraphSnippet?: string, parentCommentId?: string, parentCommentAuthorUid?: string, reactions?: Record<string, string[]>) => void;
  onDeleteComment?: (commentId: string) => void;
  onToggleCommentReaction?: (commentId: string, emojiId: string) => void;
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
  isEditor = false,
  onSelectChapter,
  onBackToStory,
  onAddComment,
  onDeleteComment,
  onToggleCommentReaction,
  onUnlockChapter,
  onOpenRechargeModal,
}) => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [readerFont, setReaderFont] = useState<string>(story?.customBodyFont || story?.defaultFont || 'font-bevietnam');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [readingProgressPercent, setReadingProgressPercent] = useState<number>(0);
  const [autoResumeNotice, setAutoResumeNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!story) return;
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
  }, [story?.id, story?.customBodyFont, story?.defaultFont, story?.bodyFontSize]);

  const [generalCommentText, setGeneralCommentText] = useState('');
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);
  const [paraCommentText, setParaCommentText] = useState('');
  const [commentFilter, setCommentFilter] = useState<'all' | 'general' | 'paragraph'>('all');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Password unlock state
  const [inputPassword, setInputPassword] = useState('');
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  // Sync password unlocked status
  useEffect(() => {
    setInputPassword('');
    setPasswordError(null);
    if (!chapter || !chapter.isPasswordProtected || !chapter.password) {
      setIsPasswordUnlocked(true);
      return;
    }
    const unlockedPassLocal = getUserUnlockedPasswordChaptersLocal(currentUser?.uid);
    const isUnlocked = 
      unlockedPassLocal.includes(chapter.id) ||
      !!(userProfile?.unlockedPasswordChapters && userProfile.unlockedPasswordChapters.includes(chapter.id));
    setIsPasswordUnlocked(isUnlocked);
  }, [chapter?.id, chapter?.isPasswordProtected, chapter?.password, currentUser?.uid, userProfile?.unlockedPasswordChapters]);

  if (!story || !chapter) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center font-mono-code text-rose-400 space-y-4">
        <p>Không tìm thấy truyện hoặc chương được yêu cầu.</p>
        <button
          onClick={onBackToStory}
          className="px-4 py-2 border border-rose-800 bg-rose-950/50 text-xs rounded hover:bg-rose-900 transition cursor-pointer"
        >
          Quay lại trang truyện
        </button>
      </div>
    );
  }

  const storyTitleFont = story.customTitleFont || story.defaultFont || 'font-mono';
  const storyChapterTitleFont = story.customChapterTitleFont || story.customSubtitleFont || story.customTitleFont || story.defaultFont || 'font-mono';
  const storySubtitleFont = story.customSubtitleFont || story.customTitleFont || story.defaultFont || 'font-mono';
  const storyMutedFont = story.customMutedFont || story.defaultFont || 'font-mono';
  const storyBtnFont = story.customBtnFont || story.defaultFont || 'font-mono';
  const storyBodyFont = readerFont;

  const sortedChapters = [...(allChapters || [])].filter(Boolean).sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentIndex = sortedChapters.findIndex(c => c && c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  // Kiểm tra quyền đọc chương
  const isAuthorOrOwner = 
    (currentUser?.uid && story.authorUid && currentUser.uid === story.authorUid) ||
    (currentUser?.email && story.authorEmail && currentUser.email.toLowerCase() === story.authorEmail.toLowerCase()) ||
    isAdmin;

  const isAlreadyUnlockedByChucu = !!(
    userProfile?.unlockedChapters && 
    userProfile.unlockedChapters.includes(chapter.id)
  );

  const isChucuReadable = !chapter.isLocked || isAlreadyUnlockedByChucu || isAuthorOrOwner;
  const isPassReadable = !chapter.isPasswordProtected || !chapter.password || isPasswordUnlocked || isAuthorOrOwner;
  const isChapterReadable = isChucuReadable && isPassReadable;

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
  }, [story?.id, chapter?.id, isChapterReadable]);

  // Lắng nghe cuộn trang & tự động lưu vị trí đọc
  useEffect(() => {
    if (!isChapterReadable || !story || !chapter) return;

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
  }, [story?.id, chapter?.id, chapter?.title, chapter?.chapterNumber, isChapterReadable]);

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPassword.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsSubmittingPass(true);
    setPasswordError(null);

    try {
      const res = await unlockChapterWithPassword(chapter.id, inputPassword, chapter.password, currentUser?.uid);
      if (res.success) {
        setIsPasswordUnlocked(true);
        setPasswordError(null);
      } else {
        setPasswordError(res.message);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Lỗi khi kiểm tra mật khẩu.');
    } finally {
      setIsSubmittingPass(false);
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

  const handleQuickParagraphReaction = (idx: number, snippet: string, emojiId: string) => {
    const rawParaComments = (comments || []).filter((c) => c && c.paragraphIndex === idx);
    const paraReactionsComment = rawParaComments.find((c) => c.content === '__paragraph_reactions__');
    if (paraReactionsComment) {
      if (onToggleCommentReaction) {
        onToggleCommentReaction(paraReactionsComment.id, emojiId);
      }
    } else {
      onAddComment('__paragraph_reactions__', chapter.id, idx, snippet.slice(0, 100), undefined, undefined, { [emojiId]: [currentUser?.uid || 'anonymous_guest'] });
    }
  };

  const handleQuickChapterReaction = (emojiId: string) => {
    const rawGeneralComments = (comments || []).filter((c) => c && c.paragraphIndex === undefined);
    const chapterReactionsComment = rawGeneralComments.find((c) => c.content === '__chapter_reactions__');
    if (chapterReactionsComment) {
      if (onToggleCommentReaction) {
        onToggleCommentReaction(chapterReactionsComment.id, emojiId);
      }
    } else {
      onAddComment('__chapter_reactions__', chapter.id, undefined, undefined, undefined, undefined, { [emojiId]: [currentUser?.uid || 'anonymous_guest'] });
    }
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
  const activeReadingEffectColor = hasSeparateEffect ? (story.chapterReadingEffectColor || story.readingEffectColor) : story.readingEffectColor;

  const activeBorderGradientColor2 = hasSeparateTheme
    ? (story.chapterCustomBorderGradientColor2 || story.customBorderGradientColor2)
    : story.customBorderGradientColor2;
  const activeBorderGlowColor1 = hasSeparateTheme
    ? (story.chapterCustomBorderGlowColor1 || story.customBorderGlowColor1)
    : story.customBorderGlowColor1;
  const activeBorderGlowColor2 = hasSeparateTheme
    ? (story.chapterCustomBorderGlowColor2 || story.customBorderGlowColor2)
    : story.customBorderGlowColor2;

  const borderObj = {
    borderStyle: activeBorderStyle,
    borderWidth: activeBorderWidth,
    borderRadius: activeBorderRadius,
    borderCornerAccent: activeBorderCornerAccent,
    borderGlow: activeBorderGlow,
    customBorderColor: currentBorder,
    customCardBgColor: currentCardBg,
    customBorderGradientColor2: activeBorderGradientColor2,
    customBorderGlowColor1: activeBorderGlowColor1,
    customBorderGlowColor2: activeBorderGlowColor2,
  };

  const isDarkTheme = !currentBg.toLowerCase().includes('#fff') && !currentBg.toLowerCase().includes('255, 255, 255');

  const contentBlocks = React.useMemo(() => {
    return parseChapterContentBlocks(chapter.content || '');
  }, [chapter.content]);

  const paragraphs = contentBlocks.map(b => b.rawText);

  const calculatedWordCount = chapter.wordCount || (chapter.content ? chapter.content.split(/\s+/).filter(Boolean).length : 0);

  const safeComments = (comments || []).filter(
    (c) => c && c.content !== '__paragraph_reactions__' && c.content !== '__chapter_reactions__'
  );
  const generalComments = safeComments.filter((c) => c && c.paragraphIndex === undefined);
  const paragraphComments = safeComments.filter((c) => c && c.paragraphIndex !== undefined);
  const chapterReactionsComment = (comments || []).find((c) => c && c.paragraphIndex === undefined && c.content === '__chapter_reactions__');

  const displayedComments = commentFilter === 'all'
    ? safeComments
    : commentFilter === 'general'
    ? generalComments
    : paragraphComments;

  return (
    <div 
      className={`chapter-reader-root min-h-screen pb-20 transition-colors duration-300 relative ${readerFont}`}
      style={{
        background: currentBg,
        color: currentText,
      }}
    >
      {/* Dynamic selection style based on chapter theme */}
      <style>{`
        .chapter-reader-root ::selection,
        .chapter-reader-root *::selection {
          background-color: ${currentBtnBg} !important;
          color: ${currentBtnText} !important;
        }
      `}</style>

      {/* Hiệu ứng hạt rơi ở trang đọc chương */}
      {activeReadingEffect !== 'none' && <ReadingEffects effect={activeReadingEffect} effectColor={activeReadingEffectColor} isDarkTheme={isDarkTheme} />}
      
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
          className="p-6 sm:p-10 space-y-6 relative transition-all duration-200 shadow-xl"
          style={{
            background: currentCardBg,
            color: currentText,
            fontSize: `${fontSize}px`,
            lineHeight: 1.85,
            ...getStoryBorderStyle(borderObj, currentBorder),
          }}
        >
          {/* Vintage/Brackets Corner Decorators */}
          <StoryCornerAccents accent={activeBorderCornerAccent} borderStyle={borderObj?.borderStyle} color={currentBorder} />

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
                className={`font-bold tracking-wide leading-snug ${storyChapterTitleFont} ${story.titleFontSize ? '' : 'text-xl sm:text-2xl'}`} 
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
              {chapter.isPasswordProtected && (
                <span 
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-xs font-semibold rounded shadow-xs ${storyBtnFont}`}
                  style={{
                    background: currentBtnBg,
                    borderColor: currentBtnBorder,
                    color: currentBtnText,
                  }}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isPassReadable ? 'Đã mở Pass' : 'Có Pass'}</span>
                </span>
              )}
            </div>
            <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-mono ${storyMutedFont}`} style={{ color: currentTextMuted }}>
              {story.author && (
                <>
                  <span>Tác giả: {story.author}</span>
                  <span>•</span>
                </>
              )}
              {story.editorName && (
                <>
                  <span>Người đăng: {story.editorName}</span>
                  <span>•</span>
                </>
              )}
              <span>{calculatedWordCount.toLocaleString()} chữ</span>
              <span>•</span>
              <span>Cập nhật: {chapter.createdAt}</span>
            </div>
          </div>

          {/* Locked Screen or Chapter Paragraph Content */}
          {!isChapterReadable ? (
            !isChucuReadable ? (
              /* Locked Chapter Paywall Screen - Chucu */
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
                  <h3 className={`text-base sm:text-lg font-bold uppercase tracking-wider ${storySubtitleFont}`} style={{ color: currentText }}>
                    Chương này đã bị khóa bằng Chucu
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
              /* Password Protected Chapter Screen (Nhập Pass) */
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
                    <Key className="w-6 h-6" />
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold uppercase tracking-wider ${storySubtitleFont}`} style={{ color: currentText }}>
                    Chương này yêu cầu mật khẩu (Pass)
                  </h3>
                  <p className={`text-xs ${storyMutedFont}`} style={{ color: currentTextMuted }}>
                    Tác giả đã đặt mật khẩu cho chương này. Vui lòng nhập đúng mật khẩu để mở khóa và đọc tiếp.
                  </p>
                </div>

                {/* Gợi ý mật khẩu nếu có */}
                {chapter.passwordHint && (
                  <div 
                    className="p-3.5 max-w-md mx-auto rounded border border-dashed text-left space-y-1.5"
                    style={{
                      background: currentCardBg,
                      borderColor: currentBorder,
                    }}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: currentText }}>
                      <HelpCircle className="w-4 h-4 text-[#ff99bb] shrink-0" />
                      <span>Gợi ý mật khẩu từ tác giả:</span>
                    </div>
                    <p className="text-xs italic pl-5 leading-relaxed" style={{ color: currentTextMuted }}>
                      {chapter.passwordHint}
                    </p>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="max-w-sm mx-auto space-y-3 pt-1">
                  <div className="relative">
                    <input
                      type={showPasswordText ? "text" : "password"}
                      value={inputPassword}
                      onChange={(e) => {
                        setInputPassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                      }}
                      placeholder="Nhập mật khẩu (pass) để đọc..."
                      className="w-full px-3.5 py-2.5 pr-10 text-xs border rounded focus:outline-none transition font-mono"
                      style={{
                        background: currentCardBg,
                        borderColor: currentBorder,
                        color: currentText,
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-xs opacity-60 hover:opacity-100 transition"
                      style={{ color: currentText }}
                      title={showPasswordText ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {passwordError && (
                    <div className="p-2.5 bg-[#3e141a] border border-[#a2202f] text-xs text-[#ffccd1] flex items-center gap-2 text-left rounded">
                      <AlertCircle className="w-4 h-4 text-[#ff9aa6] shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingPass || !inputPassword.trim()}
                    className={`w-full py-2.5 border font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 ${storyBtnFont}`}
                    style={{
                      background: currentBtnBg,
                      borderColor: currentBtnBorder,
                      color: currentBtnText,
                    }}
                  >
                    {isSubmittingPass ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang kiểm tra...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Mở khóa chương</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )
          ) : (
            /* Text Content with Paragraph-level commenting */
            <div className={`space-y-5 leading-relaxed ${storyBodyFont}`} style={{ color: currentText, fontSize: 'inherit' }}>
              {contentBlocks.length > 0 ? (
                contentBlocks.map((block, idx) => {
                  const paraComments = safeComments.filter((c) => c && c.paragraphIndex === idx);
                  const paraReactionsComment = (comments || []).find((c) => c && c.paragraphIndex === idx && c.content === '__paragraph_reactions__');
                  const isActive = activeParagraphIndex === idx;

                  return (
                    <div
                      key={idx}
                      id={`para-${idx}`}
                      className="group/para relative transition-all duration-200"
                    >
                      <div className="relative flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          {block.type === 'paragraph' ? (
                            <p className={`leading-relaxed whitespace-pre-line transition-opacity ${isActive ? 'opacity-100 font-medium' : ''}`}>
                              <ProtectedStoryText text={block.rawText} />
                            </p>
                          ) : (
                            <SpecialBlockRenderer
                              block={block}
                              themeColors={{
                                bg: isCustomTheme ? story.customBgColor : currentBg,
                                cardBg: isCustomTheme ? story.customCardBgColor : currentCardBg,
                                border: currentBorder,
                                btnBg: currentBtnBg,
                                btnText: currentBtnText,
                                btnSecondaryBg: currentBtnSecondaryBg,
                                btnBorder: currentBtnBorder,
                                text: isCustomTheme ? story.customTextColor : currentText,
                                textMuted: isCustomTheme ? story.customMutedColor : currentTextMuted,
                                accentColor: currentBtnBg,
                              }}
                              fontFamily={storyBodyFont}
                            />
                          )}
                        </div>

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
                                ? 'shadow-xs font-semibold opacity-100'
                                : 'opacity-40 sm:opacity-0 group-hover/para:opacity-60 hover:!opacity-100'
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
                                Chưa có bình luận nào cho đoạn này. Thả emoji hoặc để lại bình luận bên dưới nhé!
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
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold" style={{ color: currentText }}>{cm.userName}</span>
                                      {(isAdmin || isEditor || (currentUser && currentUser.uid === cm.userUid)) && onDeleteComment && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
                                              onDeleteComment(cm.id);
                                            }
                                          }}
                                          className="text-red-400 hover:text-red-500 p-0.5 rounded transition"
                                          title="Xóa bình luận"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                    <span className="text-[10px] opacity-65" style={{ color: currentTextMuted }}>{cm.createdAt}</span>
                                  </div>
                                  <p className="leading-relaxed opacity-90" style={{ color: currentText }}>
                                    <FormattedCommentContent content={cm.content} />
                                  </p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Paragraph Reactions */}
                          <div className="pt-1.5 border-t" style={{ borderColor: currentBorder }}>
                            <span className="text-[11px] font-semibold opacity-75 block select-none mb-1" style={{ color: currentTextMuted }}>
                              Cảm xúc cho đoạn này:
                            </span>
                            <ReactionSummary
                              reactions={paraReactionsComment ? paraReactionsComment.reactions : {}}
                              currentUserUid={currentUser?.uid}
                              onToggleReaction={(emojiId) => handleQuickParagraphReaction(idx, block.rawText, emojiId)}
                            />
                          </div>

                          {/* Comment Input Box for this paragraph */}
                          <form onSubmit={(e) => handleParagraphCommentSubmit(e, idx, block.rawText)} className="flex gap-2 items-center pt-1">
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


          </div>

          {/* Chapter Comments Section */}
          <div 
            className="pt-6 border-t space-y-4 font-sans"
            style={{
              borderColor: currentBorder,
            }}
          >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: currentBorder }}>
            <h3 
              className={`text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 ${storySubtitleFont}`}
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
          <form onSubmit={handleGeneralCommentSubmit} className="flex gap-2 items-center mt-3">
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
            {(displayedComments || []).filter(c => c && !c.parentCommentId).length === 0 ? (
              <div className={`py-6 text-center text-xs ${storyMutedFont}`} style={{ color: currentTextMuted }}>
                {commentFilter === 'paragraph'
                  ? 'Chưa có bình luận theo đoạn nào. Bạn có thể bấm vào biểu tượng bình luận bên cạnh mỗi đoạn văn phía trên để viết!'
                  : 'Chưa có bình luận nào cho mục này.'}
              </div>
            ) : (
              (displayedComments || []).filter(c => c && !c.parentCommentId).map((cm) => {
                const currentReplies = safeComments.filter(c => c && c.parentCommentId === cm.id);
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
                    <p className={`opacity-95 leading-relaxed ${storyBodyFont}`} style={{ color: currentText }}>
                      <FormattedCommentContent content={cm.content} />
                    </p>

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

                      {(isAdmin || isEditor || (currentUser && currentUser.uid === cm.userUid)) && onDeleteComment && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
                              onDeleteComment(cm.id);
                            }
                          }}
                          className="text-[11px] font-semibold text-red-400 hover:text-red-500 hover:underline flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      )}
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
                        className="mt-2.5 flex gap-2 items-center pl-3 border-l"
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
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold" style={{ color: currentText }}>{reply.userName}</span>
                                {(isAdmin || isEditor || (currentUser && currentUser.uid === reply.userUid)) && onDeleteComment && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm('Bạn có chắc chắn muốn xóa phản hồi này không?')) {
                                        onDeleteComment(reply.id);
                                      }
                                    }}
                                    className="text-red-400 hover:text-red-500 p-0.5 rounded transition"
                                    title="Xóa phản hồi"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <span className="text-[10px]" style={{ color: currentTextMuted }}>{reply.createdAt}</span>
                            </div>
                            <p className="opacity-90" style={{ color: currentText }}>
                              <FormattedCommentContent content={reply.content} />
                            </p>
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
      </article>

      </main>
    </div>
  );
};
