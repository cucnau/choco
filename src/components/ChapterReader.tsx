import React, { useState, useEffect } from 'react';
import { Story, Chapter, Comment, UserProfile } from '../types';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  CornerDownRight, 
  X, 
  Send,
  Lock,
  Unlock,
  Key,
  Coins,
  RefreshCw,
  AlertCircle,
  ArrowUp,
  BookmarkCheck
} from 'lucide-react';
import { saveReadingProgress, getReadingProgress } from '../lib/readingProgress';
import { ReadingEffects } from './ReadingEffects';
import { getStoryBorderStyle, StoryCornerAccents } from '../lib/borderStyles';

const PRESET_PROGRESS_BAR_COLORS: Record<string, string> = {
  'dark-rose': '#ff99bb',
  'sepia': '#8c5e3c',
  'emerald': '#2a6b4e',
  'slate': '#60a5fa',
  'classic-dark': '#e5e5e5',
  'gradient-rose': '#ff99bb',
  'gradient-midnight': '#c084fc',
  'gradient-ocean': '#38bdf8',
  'gradient-emerald': '#34d399',
  'gradient-sunset': '#fb923c',
  'gradient-cyber': '#e879f9',
};

const THEME_TONES: Record<string, {
  containerBg: string;
  gradientBg?: string;
  cardBg: string;
  border: string;
  text: string;
  textMuted: string;
  inputBg: string;
  buttonBgPrimary: string;
  buttonBgSecondary: string;
  buttonBorderPrimary: string;
  buttonBorderSecondary: string;
  headerBorder: string;
  badgeLocked: string;
  badgeLockedBorder: string;
  badgeLockedText: string;
  badgeLockedIcon: string;
  badgeFree: string;
  badgeFreeBorder: string;
  badgeFreeText: string;
}> = {
  'dark-rose': {
    containerBg: 'bg-[#080406]',
    cardBg: 'bg-[#11090c]',
    border: 'border-[#2d1822]',
    text: 'text-[#e0d0d5]',
    textMuted: 'text-[#8a717a]',
    inputBg: 'bg-[#170d12]',
    buttonBgPrimary: 'bg-[#2b1620] hover:bg-[#3d1e2c]',
    buttonBgSecondary: 'bg-[#170d12] hover:bg-[#2b1620]',
    buttonBorderPrimary: 'border-[#5e2f46]',
    buttonBorderSecondary: 'border-[#2d1822]',
    headerBorder: 'border-[#23151b]',
    badgeLocked: 'bg-[#2b1620]',
    badgeLockedBorder: 'border-[#5e2f46]',
    badgeLockedText: 'text-[#ffd6e2]',
    badgeLockedIcon: 'text-[#ff99bb]',
    badgeFree: 'bg-[#12090c]',
    badgeFreeBorder: 'border-[#2d1822]',
    badgeFreeText: 'text-[#8a717a]'
  },
  'sepia': {
    containerBg: 'bg-[#f4ecd8]',
    cardBg: 'bg-[#fcf8ed]',
    border: 'border-[#d3c29f]',
    text: 'text-[#4a3525]',
    textMuted: 'text-[#8c7460]',
    inputBg: 'bg-[#f0e6cb]',
    buttonBgPrimary: 'bg-[#e2d5b6] hover:bg-[#d8cba8]',
    buttonBgSecondary: 'bg-[#faf6eb] hover:bg-[#e2d5b6]',
    buttonBorderPrimary: 'border-[#bca883]',
    buttonBorderSecondary: 'border-[#d3c29f]',
    headerBorder: 'border-[#dfd0b4]',
    badgeLocked: 'bg-[#e2d5b6]',
    badgeLockedBorder: 'border-[#bca883]',
    badgeLockedText: 'text-[#4a3525]',
    badgeLockedIcon: 'text-[#8c5e3c]',
    badgeFree: 'bg-[#faf6eb]',
    badgeFreeBorder: 'border-[#d3c29f]',
    badgeFreeText: 'text-[#8c7460]'
  },
  'emerald': {
    containerBg: 'bg-[#06100c]',
    cardBg: 'bg-[#0b1a14]',
    border: 'border-[#153327]',
    text: 'text-[#d1e7dd]',
    textMuted: 'text-[#628f7a]',
    inputBg: 'bg-[#0e251c]',
    buttonBgPrimary: 'bg-[#163f2d] hover:bg-[#1e543c]',
    buttonBgSecondary: 'bg-[#0e251c] hover:bg-[#163f2d]',
    buttonBorderPrimary: 'border-[#2a6b4e]',
    buttonBorderSecondary: 'border-[#153327]',
    headerBorder: 'border-[#122c20]',
    badgeLocked: 'bg-[#163f2d]',
    badgeLockedBorder: 'border-[#2a6b4e]',
    badgeLockedText: 'text-[#d1e7dd]',
    badgeLockedIcon: 'text-[#5eead4]',
    badgeFree: 'bg-[#0e251c]',
    badgeFreeBorder: 'border-[#153327]',
    badgeFreeText: 'text-[#628f7a]'
  },
  'slate': {
    containerBg: 'bg-[#0f172a]',
    cardBg: 'bg-[#1e293b]',
    border: 'border-[#334155]',
    text: 'text-[#f1f5f9]',
    textMuted: 'text-[#94a3b8]',
    inputBg: 'bg-[#0f172a]',
    buttonBgPrimary: 'bg-[#334155] hover:bg-[#475569]',
    buttonBgSecondary: 'bg-[#1e293b] hover:bg-[#334155]',
    buttonBorderPrimary: 'border-[#475569]',
    buttonBorderSecondary: 'border-[#334155]',
    headerBorder: 'border-[#1e293b]',
    badgeLocked: 'bg-[#334155]',
    badgeLockedBorder: 'border-[#475569]',
    badgeLockedText: 'text-[#f1f5f9]',
    badgeLockedIcon: 'text-[#93c5fd]',
    badgeFree: 'bg-[#1e293b]',
    badgeFreeBorder: 'border-[#334155]',
    badgeFreeText: 'text-[#94a3b8]'
  },
  'classic-dark': {
    containerBg: 'bg-[#0a0a0a]',
    cardBg: 'bg-[#121212]',
    border: 'border-[#242424]',
    text: 'text-[#e5e5e5]',
    textMuted: 'text-[#737373]',
    inputBg: 'bg-[#1a1a1a]',
    buttonBgPrimary: 'bg-[#262626] hover:bg-[#404040]',
    buttonBgSecondary: 'bg-[#171717] hover:bg-[#262626]',
    buttonBorderPrimary: 'border-[#404040]',
    buttonBorderSecondary: 'border-[#262626]',
    headerBorder: 'border-[#1f1f1f]',
    badgeLocked: 'bg-[#262626]',
    badgeLockedBorder: 'border-[#404040]',
    badgeLockedText: 'text-[#e5e5e5]',
    badgeLockedIcon: 'text-[#d4d4d4]',
    badgeFree: 'bg-[#171717]',
    badgeFreeBorder: 'border-[#262626]',
    badgeFreeText: 'text-[#737373]'
  },
  'gradient-rose': {
    containerBg: 'bg-[#0c0408]',
    gradientBg: 'linear-gradient(135deg, #4a1528 0%, #230b15 50%, #0c0408 100%)',
    cardBg: 'bg-[#1c0a13]/90 backdrop-blur-xs',
    border: 'border-[#682542]',
    text: 'text-[#fce7f0]',
    textMuted: 'text-[#f4a6c1]',
    inputBg: 'bg-[#280c1b]',
    buttonBgPrimary: 'bg-[#521930] hover:bg-[#6e2241]',
    buttonBgSecondary: 'bg-[#280c1b] hover:bg-[#521930]',
    buttonBorderPrimary: 'border-[#832e55]',
    buttonBorderSecondary: 'border-[#682542]',
    headerBorder: 'border-[#521930]',
    badgeLocked: 'bg-[#521930]',
    badgeLockedBorder: 'border-[#832e55]',
    badgeLockedText: 'text-[#ffc2d4]',
    badgeLockedIcon: 'text-[#ff99bb]',
    badgeFree: 'bg-[#280c1b]',
    badgeFreeBorder: 'border-[#682542]',
    badgeFreeText: 'text-[#f4a6c1]'
  },
  'gradient-midnight': {
    containerBg: 'bg-[#080314]',
    gradientBg: 'linear-gradient(135deg, #2e1065 0%, #160833 50%, #080314 100%)',
    cardBg: 'bg-[#170b33]/90 backdrop-blur-xs',
    border: 'border-[#581c87]',
    text: 'text-[#f3e8ff]',
    textMuted: 'text-[#c084fc]',
    inputBg: 'bg-[#210f47]',
    buttonBgPrimary: 'bg-[#3b1278] hover:bg-[#521ab0]',
    buttonBgSecondary: 'bg-[#210f47] hover:bg-[#3b1278]',
    buttonBorderPrimary: 'border-[#7e22ce]',
    buttonBorderSecondary: 'border-[#581c87]',
    headerBorder: 'border-[#3b1278]',
    badgeLocked: 'bg-[#3b1278]',
    badgeLockedBorder: 'border-[#7e22ce]',
    badgeLockedText: 'text-[#e9d5ff]',
    badgeLockedIcon: 'text-[#c084fc]',
    badgeFree: 'bg-[#210f47]',
    badgeFreeBorder: 'border-[#581c87]',
    badgeFreeText: 'text-[#c084fc]'
  },
  'gradient-ocean': {
    containerBg: 'bg-[#030d17]',
    gradientBg: 'linear-gradient(135deg, #0c4a6e 0%, #07273c 50%, #030d17 100%)',
    cardBg: 'bg-[#081d2c]/90 backdrop-blur-xs',
    border: 'border-[#0284c7]',
    text: 'text-[#e0f2fe]',
    textMuted: 'text-[#38bdf8]',
    inputBg: 'bg-[#0c273a]',
    buttonBgPrimary: 'bg-[#0369a1] hover:bg-[#0284c7]',
    buttonBgSecondary: 'bg-[#0c273a] hover:bg-[#0369a1]',
    buttonBorderPrimary: 'border-[#38bdf8]',
    buttonBorderSecondary: 'border-[#0284c7]',
    headerBorder: 'border-[#0369a1]',
    badgeLocked: 'bg-[#0369a1]',
    badgeLockedBorder: 'border-[#38bdf8]',
    badgeLockedText: 'text-[#bae6fd]',
    badgeLockedIcon: 'text-[#38bdf8]',
    badgeFree: 'bg-[#0c273a]',
    badgeFreeBorder: 'border-[#0284c7]',
    badgeFreeText: 'text-[#38bdf8]'
  },
  'gradient-emerald': {
    containerBg: 'bg-[#02120d]',
    gradientBg: 'linear-gradient(135deg, #064e3b 0%, #04291f 50%, #02120d 100%)',
    cardBg: 'bg-[#082119]/90 backdrop-blur-xs',
    border: 'border-[#059669]',
    text: 'text-[#ecfdf5]',
    textMuted: 'text-[#34d399]',
    inputBg: 'bg-[#0d3327]',
    buttonBgPrimary: 'bg-[#047857] hover:bg-[#059669]',
    buttonBgSecondary: 'bg-[#0d3327] hover:bg-[#047857]',
    buttonBorderPrimary: 'border-[#10b981]',
    buttonBorderSecondary: 'border-[#059669]',
    headerBorder: 'border-[#047857]',
    badgeLocked: 'bg-[#047857]',
    badgeLockedBorder: 'border-[#10b981]',
    badgeLockedText: 'text-[#a7f3d0]',
    badgeLockedIcon: 'text-[#34d399]',
    badgeFree: 'bg-[#0d3327]',
    badgeFreeBorder: 'border-[#059669]',
    badgeFreeText: 'text-[#34d399]'
  },
  'gradient-sunset': {
    containerBg: 'bg-[#120307]',
    gradientBg: 'linear-gradient(135deg, #681212 0%, #3b0914 50%, #120307 100%)',
    cardBg: 'bg-[#24080e]/90 backdrop-blur-xs',
    border: 'border-[#9f1239]',
    text: 'text-[#fff1f2]',
    textMuted: 'text-[#fb7185]',
    inputBg: 'bg-[#380b15]',
    buttonBgPrimary: 'bg-[#881337] hover:bg-[#9f1239]',
    buttonBgSecondary: 'bg-[#380b15] hover:bg-[#881337]',
    buttonBorderPrimary: 'border-[#e11d48]',
    buttonBorderSecondary: 'border-[#9f1239]',
    headerBorder: 'border-[#881337]',
    badgeLocked: 'bg-[#881337]',
    badgeLockedBorder: 'border-[#e11d48]',
    badgeLockedText: 'text-[#fecdd3]',
    badgeLockedIcon: 'text-[#fb7185]',
    badgeFree: 'bg-[#380b15]',
    badgeFreeBorder: 'border-[#9f1239]',
    badgeFreeText: 'text-[#fb7185]'
  },
  'gradient-cyber': {
    containerBg: 'bg-[#100220]',
    gradientBg: 'linear-gradient(135deg, #581c87 0%, #2e0854 50%, #100220 100%)',
    cardBg: 'bg-[#210638]/90 backdrop-blur-xs',
    border: 'border-[#a21caf]',
    text: 'text-[#fae8ff]',
    textMuted: 'text-[#e879f9]',
    inputBg: 'bg-[#320a52]',
    buttonBgPrimary: 'bg-[#7e22ce] hover:bg-[#9333ea]',
    buttonBgSecondary: 'bg-[#320a52] hover:bg-[#7e22ce]',
    buttonBorderPrimary: 'border-[#c084fc]',
    buttonBorderSecondary: 'border-[#a21caf]',
    headerBorder: 'border-[#7e22ce]',
    badgeLocked: 'bg-[#7e22ce]',
    badgeLockedBorder: 'border-[#c084fc]',
    badgeLockedText: 'text-[#f5d0fe]',
    badgeLockedIcon: 'text-[#e879f9]',
    badgeFree: 'bg-[#320a52]',
    badgeFreeBorder: 'border-[#a21caf]',
    badgeFreeText: 'text-[#e879f9]'
  },
  'gradient-gold': {
    containerBg: 'bg-[#180801]',
    gradientBg: 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #180801 100%)',
    cardBg: 'bg-[#290e02]/90 backdrop-blur-xs',
    border: 'border-[#b45309]',
    text: 'text-[#fef3c7]',
    textMuted: 'text-[#fbbf24]',
    inputBg: 'bg-[#3d1703]',
    buttonBgPrimary: 'bg-[#92400e] hover:bg-[#b45309]',
    buttonBgSecondary: 'bg-[#3d1703] hover:bg-[#92400e]',
    buttonBorderPrimary: 'border-[#d97706]',
    buttonBorderSecondary: 'border-[#b45309]',
    headerBorder: 'border-[#92400e]',
    badgeLocked: 'bg-[#92400e]',
    badgeLockedBorder: 'border-[#d97706]',
    badgeLockedText: 'text-[#fef3c7]',
    badgeLockedIcon: 'text-[#fbbf24]',
    badgeFree: 'bg-[#3d1703]',
    badgeFreeBorder: 'border-[#b45309]',
    badgeFreeText: 'text-[#fbbf24]'
  },
  'gradient-cherry': {
    containerBg: 'bg-[#1f020d]',
    gradientBg: 'linear-gradient(135deg, #831843 0%, #500724 50%, #1f020d 100%)',
    cardBg: 'bg-[#2e0516]/90 backdrop-blur-xs',
    border: 'border-[#be185d]',
    text: 'text-[#fce7f0]',
    textMuted: 'text-[#f472b6]',
    inputBg: 'bg-[#42081f]',
    buttonBgPrimary: 'bg-[#9d174d] hover:bg-[#be185d]',
    buttonBgSecondary: 'bg-[#42081f] hover:bg-[#9d174d]',
    buttonBorderPrimary: 'border-[#e11d48]',
    buttonBorderSecondary: 'border-[#be185d]',
    headerBorder: 'border-[#9d174d]',
    badgeLocked: 'bg-[#9d174d]',
    badgeLockedBorder: 'border-[#e11d48]',
    badgeLockedText: 'text-[#ffe4e6]',
    badgeLockedIcon: 'text-[#f472b6]',
    badgeFree: 'bg-[#42081f]',
    badgeFreeBorder: 'border-[#be185d]',
    badgeFreeText: 'text-[#f472b6]'
  }
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
  }, [story.id, story.customBodyFont, story.defaultFont]);

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

  // Tách biệt theme chương và truyện riêng biệt (nếu được bật)
  const hasSeparateTheme = story.useSeparateChapterTheme;
  const toneKey = hasSeparateTheme ? (story.chapterThemeTone || 'dark-rose') : (story.themeTone || 'dark-rose');
  const isCustomTheme = toneKey === 'custom';
  const tone = THEME_TONES[toneKey] || THEME_TONES['dark-rose'];

  const customBgColor = hasSeparateTheme ? story.chapterCustomBgColor : story.customBgColor;
  const customCardBgColor = hasSeparateTheme ? story.chapterCustomCardBgColor : story.customCardBgColor;
  const customTextColor = hasSeparateTheme ? story.chapterCustomTextColor : story.customTextColor;
  const customTextMutedColor = hasSeparateTheme ? story.chapterCustomTextMutedColor : story.customTextMutedColor;
  const customBorderColor = hasSeparateTheme ? story.chapterCustomBorderColor : story.customBorderColor;
  const customBtnBgColor = hasSeparateTheme ? story.chapterCustomBtnBgColor : story.customBtnBgColor;
  const customBtnSecondaryBgColor = hasSeparateTheme ? story.chapterCustomBtnSecondaryBgColor : story.customBtnSecondaryBgColor;

  const progressBarColor = isCustomTheme
    ? (customBtnBgColor && customBtnBgColor !== customBgColor ? customBtnBgColor : customTextColor || '#ff99bb')
    : (PRESET_PROGRESS_BAR_COLORS[toneKey] || '#ff99bb');

  // Cấu trúc dynamic inline style khi editor phối màu riêng
  const customStyles = {
    container: isCustomTheme
      ? { background: customBgColor || '#080406', color: customTextColor }
      : (tone.gradientBg ? { background: tone.gradientBg } : {}),
    card: isCustomTheme
      ? { background: customCardBgColor, color: customTextColor, borderColor: customBorderColor }
      : {},
    border: isCustomTheme ? { borderColor: customBorderColor } : {},
    text: isCustomTheme ? { color: customTextColor } : {},
    textMuted: isCustomTheme ? { color: customTextMutedColor } : {},
    input: isCustomTheme
      ? { background: customBtnSecondaryBgColor || customCardBgColor || customBgColor, color: customTextColor, borderColor: customBorderColor }
      : {},
    btnPrimary: isCustomTheme
      ? { background: customBtnBgColor, borderColor: customBorderColor, color: customTextColor }
      : {},
    btnSecondary: isCustomTheme
      ? { background: customBtnSecondaryBgColor || customCardBgColor || customBgColor, borderColor: customBorderColor, color: customTextColor }
      : {},
    headerBorder: isCustomTheme ? { borderColor: customBorderColor } : {},
  };

  // Cấu trúc viền, khung trang trí góc viền và phát sáng cho chương truyện
  const activeBorderStyle = hasSeparateTheme ? (story.chapterBorderStyle || 'solid') : (story.borderStyle || 'solid');
  const activeBorderWidth = hasSeparateTheme ? (story.chapterBorderWidth || 'thin') : (story.borderWidth || 'thin');
  const activeBorderRadius = hasSeparateTheme ? (story.chapterBorderRadius || 'none') : (story.borderRadius || 'none');
  const activeBorderCornerAccent = hasSeparateTheme ? (story.chapterBorderCornerAccent || 'none') : (story.borderCornerAccent || 'none');
  const activeBorderGlow = hasSeparateTheme ? (story.chapterBorderGlow || 'none') : (story.borderGlow || 'none');
  const activeReadingEffect = hasSeparateTheme ? (story.chapterReadingEffect || 'none') : (story.readingEffect || 'none');

  const borderObj = {
    borderStyle: activeBorderStyle,
    borderWidth: activeBorderWidth,
    borderRadius: activeBorderRadius,
    borderCornerAccent: activeBorderCornerAccent,
    borderGlow: activeBorderGlow,
    customBorderColor: customBorderColor,
  };

  const isDarkTheme = !customBgColor?.toLowerCase().includes('#fff') && !customBgColor?.toLowerCase().includes('255, 255, 255');

  const paragraphs = chapter.content
    ? chapter.content.split('\n').map((line) => line.trim()).filter(Boolean)
    : [];

  const generalComments = comments.filter((c) => c.paragraphIndex === undefined);
  const paragraphComments = comments.filter((c) => c.paragraphIndex !== undefined);

  const displayedComments = commentFilter === 'all'
    ? comments
    : commentFilter === 'general'
    ? generalComments
    : paragraphComments;

  return (
    <div 
      className={`min-h-screen ${isCustomTheme || toneKey.startsWith('gradient-') ? '' : tone.containerBg} ${tone.text} ${readerFont} pb-16 transition-colors duration-300 relative`}
      style={customStyles.container}
    >
      {/* Hiệu ứng hạt rơi ở trang đọc chương */}
      {activeReadingEffect !== 'none' && <ReadingEffects effect={activeReadingEffect} isDarkTheme={isDarkTheme} />}
      
      {/* Top Fixed Control Bar */}
      <div 
        className={`${isCustomTheme ? '' : `${tone.cardBg} border-b ${tone.border}`} sticky top-0 z-40 px-4 py-2.5 transition-colors duration-300 border-b relative`}
        style={isCustomTheme ? { backgroundColor: story.customCardBgColor, borderColor: story.customBorderColor } : {}}
      >
        {/* Active Reading Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 h-[3px] transition-all duration-150" 
          style={{ 
            width: `${readingProgressPercent}%`,
            backgroundColor: progressBarColor
          }} 
        />

        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code">
          
          <button
            onClick={onBackToStory}
            className={`flex items-center gap-1.5 hover:opacity-80 transition`}
            style={customStyles.textMuted}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Về trang truyện</span>
          </button>
          <span className="font-bold sm:hidden block truncate max-w-[120px]" style={customStyles.text}>{story.title}</span>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Chapter Selector */}
            <select
              value={chapter.id}
              onChange={(e) => {
                const selected = sortedChapters.find(c => c.id === e.target.value);
                if (selected) onSelectChapter(selected);
              }}
              className={`border px-3 py-1.5 focus:outline-none text-xs font-mono-code`}
              style={isCustomTheme ? { backgroundColor: story.customBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : { backgroundColor: tone.inputBg, borderColor: tone.border, color: tone.text }}
            >
              {sortedChapters.map((c) => (
                <option 
                  key={c.id} 
                  value={c.id} 
                  style={isCustomTheme ? { backgroundColor: story.customCardBgColor, color: story.customTextColor } : {}}
                  className={`${isCustomTheme ? '' : `${tone.cardBg} ${tone.text}`}`}
                >
                  {c.isLocked ? `${c.title} (${c.unlockPrice || 1} Chucu)` : c.title}
                </option>
              ))}
            </select>

            {/* Font Family Selector */}
            <div 
              className={`flex items-center gap-1 border px-2 py-1 text-xs`}
              style={isCustomTheme ? { backgroundColor: story.customBgColor, borderColor: story.customBorderColor } : { backgroundColor: tone.inputBg, borderColor: tone.border }}
            >
              <span className="mr-1 font-mono-code" style={customStyles.textMuted}>Font:</span>
              <select
                value={readerFont}
                onChange={(e) => {
                  const newFont = e.target.value;
                  setReaderFont(newFont);
                  localStorage.setItem('readerFont', newFont);
                }}
                className="bg-transparent text-current border-none outline-none focus:outline-none text-xs cursor-pointer font-bold"
                style={customStyles.text}
              >
                <option value="font-bevietnam" className="bg-[#11090c] text-[#e0d0d5]">Be Vietnam Pro</option>
                <option value="font-lora" className="bg-[#11090c] text-[#e0d0d5]">Lora</option>
                <option value="font-merriweather" className="bg-[#11090c] text-[#e0d0d5]">Merriweather</option>
                <option value="font-garamond" className="bg-[#11090c] text-[#e0d0d5]">Garamond</option>
                <option value="font-playfair" className="bg-[#11090c] text-[#e0d0d5]">Playfair Display</option>
                <option value="font-notoserif" className="bg-[#11090c] text-[#e0d0d5]">Noto Serif</option>
                <option value="font-robotoslab" className="bg-[#11090c] text-[#e0d0d5]">Roboto Slab</option>
                <option value="font-inter" className="bg-[#11090c] text-[#e0d0d5]">Inter</option>
                <option value="font-opensans" className="bg-[#11090c] text-[#e0d0d5]">Open Sans</option>
                <option value="font-roboto" className="bg-[#11090c] text-[#e0d0d5]">Roboto</option>
                <option value="font-montserrat" className="bg-[#11090c] text-[#e0d0d5]">Montserrat</option>
                <option value="font-nunito" className="bg-[#11090c] text-[#e0d0d5]">Nunito</option>
                <option value="font-quicksand" className="bg-[#11090c] text-[#e0d0d5]">Quicksand</option>
                <option value="font-mulish" className="bg-[#11090c] text-[#e0d0d5]">Mulish</option>
                <option value="font-notosans" className="bg-[#11090c] text-[#e0d0d5]">Noto Sans</option>
                <option value="font-sourcesans" className="bg-[#11090c] text-[#e0d0d5]">Source Sans 3</option>
                <option value="font-worksans" className="bg-[#11090c] text-[#e0d0d5]">Work Sans</option>
                <option value="font-saira" className="bg-[#11090c] text-[#e0d0d5]">Saira</option>
                <option value="font-charm" className="bg-[#11090c] text-[#e0d0d5]">Charm</option>
                <option value="font-patrick" className="bg-[#11090c] text-[#e0d0d5]">Patrick Hand</option>
                <option value="font-times" className="bg-[#11090c] text-[#e0d0d5]">Times New Roman</option>
                <option value="font-mono" className="bg-[#11090c] text-[#e0d0d5]">JetBrains Mono</option>
              </select>
            </div>

            {/* Font Size Adjust */}
            <div 
              className={`flex items-center gap-1 border px-2 py-1 text-xs`}
              style={isCustomTheme ? { backgroundColor: story.customBgColor, borderColor: story.customBorderColor } : { backgroundColor: tone.inputBg, borderColor: tone.border }}
            >
              <span className="mr-1 font-mono-code" style={customStyles.textMuted}>Cỡ:</span>
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                className={`px-1.5 hover:opacity-80 font-bold`}
                style={customStyles.text}
              >
                A-
              </button>
              <span className="font-bold" style={customStyles.text}>{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className={`px-1.5 hover:opacity-80 font-bold`}
                style={customStyles.text}
              >
                A+
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Chapter Content Container */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8 relative z-20">
        
        {/* Header Title */}
        <div 
          className="text-center space-y-2 border-b pb-6"
          style={customStyles.headerBorder}
        >
          <h2 className={`text-xs ${storyMutedFont}`} style={customStyles.textMuted}>{story.title}</h2>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className={`text-xl sm:text-2xl font-bold tracking-wide ${storyTitleFont}`} style={customStyles.text}>{chapter.title}</h1>
            {chapter.isLocked && (
              <span 
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-xs font-semibold shadow-xs ${storyBtnFont} ${
                  isCustomTheme ? '' : `${tone.badgeLocked} ${tone.badgeLockedBorder} ${tone.badgeLockedText}`
                }`}
                style={isCustomTheme ? { backgroundColor: story.customBtnBgColor || story.customCardBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
              >
                <Lock 
                  className={`w-3.5 h-3.5 ${isCustomTheme ? '' : tone.badgeLockedIcon}`} 
                  style={isCustomTheme ? { color: story.customTextColor } : {}}
                />
                <span>{unlockPrice} Chucu</span>
              </span>
            )}
          </div>
          <p className={`text-xs ${storyMutedFont}`} style={customStyles.textMuted}>Cập nhật: {chapter.createdAt}</p>
        </div>

        {/* Locked Screen or Chapter Content */}
        {!isChapterReadable ? (
          /* Locked Chapter Paywall Screen */
          <div 
            className={`border p-8 sm:p-12 text-center space-y-6 transition-colors duration-300 shadow-sm ${storyBodyFont} ${
              isCustomTheme ? '' : `${tone.cardBg} ${tone.border}`
            }`}
            style={isCustomTheme ? { backgroundColor: story.customCardBgColor, borderColor: story.customBorderColor } : {}}
          >
            <div className="space-y-2">
              <h3 className={`text-base sm:text-lg font-bold uppercase tracking-wider ${storyTitleFont}`} style={customStyles.text}>
                Chương này đã bị khóa
              </h3>
            </div>

            {unlockError && (
              <div className="max-w-md mx-auto p-3 bg-[#3e141a] border border-[#a2202f] text-xs text-[#ffccd1] flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-[#ff9aa6] shrink-0" />
                <span>{unlockError}</span>
              </div>
            )}

            <div 
              className={`border p-4 max-w-sm mx-auto space-y-2 text-xs ${storyMutedFont} ${
                isCustomTheme ? '' : `${tone.inputBg} ${tone.border}`
              }`}
              style={isCustomTheme ? { backgroundColor: story.customBgColor, borderColor: story.customBorderColor } : {}}
            >
              <div className="flex items-center justify-between">
                <span style={customStyles.textMuted}>Để mở khóa chương cần:</span>
                <span className="font-bold" style={customStyles.text}>{unlockPrice} Chucu</span>
              </div>
              <div 
                className={`flex items-center justify-between border-t pt-2 ${
                  isCustomTheme ? '' : tone.border
                }`}
                style={isCustomTheme ? { borderColor: story.customBorderColor } : {}}
              >
                <span style={customStyles.textMuted}>Số dư Chucu hiện tại:</span>
                <span className="font-bold" style={customStyles.text}>{currentChucuBalance} Chucu</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleUnlockClick}
                disabled={isUnlocking}
                className={`w-full sm:w-auto px-6 py-2.5 border font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 ${storyBtnFont} ${
                  isCustomTheme ? '' : `${tone.buttonBgPrimary} ${tone.buttonBorderPrimary} ${tone.text}`
                }`}
                style={isCustomTheme ? { backgroundColor: story.customBtnBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
              >
                {isUnlocking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang mở khóa...</span>
                  </>
                ) : (
                  <>
                    <Key className={`w-4 h-4 ${isCustomTheme ? '' : tone.badgeLockedIcon}`} style={isCustomTheme ? { color: story.customTextColor } : {}} />
                    <span>Mở khóa chương ({unlockPrice} Chucu)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
        /* Text Content with Paragraph-level commenting */
        <article
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.85,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: isCustomTheme ? customCardBgColor : undefined,
            color: isCustomTheme ? customTextColor : undefined,
            ...getStoryBorderStyle(borderObj, customBorderColor || '#2d1822'),
          }}
          className={`${isCustomTheme ? '' : `${tone.cardBg} border ${tone.border}`} p-6 sm:p-10 space-y-5 transition-colors duration-300 select-none`}
        >
          {/* Họa tiết trang trí góc viền chương */}
          <StoryCornerAccents accent={activeBorderCornerAccent} color={customBorderColor || '#2d1822'} />
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
                        style={
                          isCustomTheme
                            ? {
                                borderColor: story.customBorderColor,
                                color: story.customTextColor,
                                backgroundColor: paraComments.length > 0 ? story.customBtnBgColor : 'transparent',
                              }
                            : {}
                        }
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] rounded transition-all duration-200 border select-none ${
                          paraComments.length > 0
                            ? isCustomTheme
                              ? 'shadow-xs font-semibold'
                              : `${tone.buttonBgSecondary} ${tone.buttonBorderSecondary} opacity-90 hover:opacity-100 shadow-xs font-semibold`
                            : isCustomTheme
                            ? 'opacity-0 group-hover/para:opacity-60 hover:!opacity-100'
                            : `opacity-0 group-hover/para:opacity-60 hover:!opacity-100 border-transparent hover:${tone.border} hover:${tone.buttonBgSecondary}`
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
                      className={`mt-3 p-4 border text-xs space-y-3 transition-colors duration-200 rounded-sm shadow-sm ${
                        isCustomTheme ? '' : `${tone.inputBg} ${tone.border}`
                      }`}
                      style={isCustomTheme ? { backgroundColor: story.customBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
                    >
                      <div className="flex items-center justify-between border-b pb-2" style={customStyles.headerBorder}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs flex items-center gap-1.5" style={customStyles.text}>
                            <CornerDownRight className="w-3.5 h-3.5 opacity-70" />
                            <span>Bình luận đoạn #{idx + 1}</span>
                          </span>
                          <span className="text-[11px] opacity-70" style={customStyles.textMuted}>
                            ({paraComments.length} thảo luận)
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveParagraphIndex(null)}
                          className="opacity-60 hover:opacity-100 p-1 transition"
                          title="Đóng"
                          style={customStyles.text}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Comments list for this paragraph */}
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {paraComments.length === 0 ? (
                          <p className="text-[11px] italic py-1 opacity-70" style={customStyles.textMuted}>
                            Chưa có bình luận nào cho đoạn này.
                          </p>
                        ) : (
                          paraComments.map((cm) => (
                            <div 
                              key={cm.id} 
                              className={`p-2.5 border text-xs space-y-1 rounded-sm ${
                                isCustomTheme ? '' : `${tone.cardBg} ${tone.border}`
                              }`}
                              style={isCustomTheme ? { backgroundColor: story.customCardBgColor, borderColor: story.customBorderColor } : {}}
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold" style={customStyles.text}>{cm.userName}</span>
                                <span className="text-[10px] opacity-65" style={customStyles.textMuted}>{cm.createdAt}</span>
                              </div>
                              <p className="leading-relaxed opacity-90" style={customStyles.text}>
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
                          className={`flex-1 border p-2 text-xs focus:outline-none rounded-sm transition ${
                            isCustomTheme ? '' : `${tone.cardBg} ${tone.border}`
                          }`}
                          style={isCustomTheme ? { backgroundColor: story.customCardBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
                        />
                        <button
                          type="submit"
                          disabled={!paraCommentText.trim()}
                          className={`px-3 py-1.5 border text-xs font-semibold uppercase disabled:opacity-40 transition flex items-center gap-1 shrink-0 rounded-sm ${
                            isCustomTheme ? '' : `${tone.buttonBgPrimary} ${tone.buttonBorderPrimary}`
                          }`}
                          style={isCustomTheme ? { backgroundColor: story.customBtnBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
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
            <p className="italic" style={customStyles.textMuted}>Nội dung chương này chưa được cập nhật.</p>
          )}
        </article>
        )}

        {/* Navigation Buttons */}
        <div 
          className="flex items-center justify-between gap-4 pt-4 border-t"
          style={customStyles.headerBorder}
        >
          <button
            disabled={!prevChapter}
            onClick={() => prevChapter && onSelectChapter(prevChapter)}
            className={`px-4 py-2 border disabled:opacity-30 text-xs font-bold transition flex items-center gap-1.5 uppercase tracking-wider ${storyBtnFont}`}
            style={isCustomTheme ? { backgroundColor: story.customCardBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : { backgroundColor: tone.buttonBgSecondary, borderColor: tone.buttonBorderSecondary, color: tone.text }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Chương trước</span>
          </button>

          <button
            disabled={!nextChapter}
            onClick={() => nextChapter && onSelectChapter(nextChapter)}
            className={`px-4 py-2 border disabled:opacity-30 text-xs font-bold transition flex items-center gap-1.5 uppercase tracking-wider ${storyBtnFont}`}
            style={isCustomTheme ? { backgroundColor: story.customBtnBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : { backgroundColor: tone.buttonBgPrimary, borderColor: tone.buttonBorderPrimary, color: tone.text }}
          >
            <span>Chương sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Chapter Comments Section */}
        <div 
          className={`${isCustomTheme ? 'border' : `${tone.cardBg} border ${tone.border}`} p-5 space-y-4 transition-colors duration-300`}
          style={isCustomTheme ? { backgroundColor: story.customCardBgColor, borderColor: story.customBorderColor } : {}}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5" style={customStyles.headerBorder}>
            <h3 
              className={`text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 ${storyTitleFont}`}
            >
              <MessageSquare className="w-4 h-4 text-[#d0a0b0]" />
              <span style={customStyles.text}>Bình luận chương ({comments.length})</span>
            </h3>

            {/* Filter Tabs */}
            <div className={`flex items-center gap-1 text-[11px] ${storyBtnFont}`}>
              <button
                onClick={() => setCommentFilter('all')}
                className={`px-2 py-0.5 border transition ${
                  commentFilter === 'all'
                    ? 'bg-[#2b1620] border-[#5e2f46] text-[#e0c0cc] font-bold'
                    : 'bg-[#160c10] border-[#2d1822] text-[#8a717a] hover:text-[#e0c0cc]'
                }`}
              >
                Tất cả ({comments.length})
              </button>
              <button
                onClick={() => setCommentFilter('general')}
                className={`px-2 py-0.5 border transition ${
                  commentFilter === 'general'
                    ? 'bg-[#2b1620] border-[#5e2f46] text-[#e0c0cc] font-bold'
                    : 'bg-[#160c10] border-[#2d1822] text-[#8a717a] hover:text-[#e0c0cc]'
                }`}
              >
                Chung ({generalComments.length})
              </button>
              <button
                onClick={() => setCommentFilter('paragraph')}
                className={`px-2 py-0.5 border transition ${
                  commentFilter === 'paragraph'
                    ? 'bg-[#2b1620] border-[#5e2f46] text-[#e0c0cc] font-bold'
                    : 'bg-[#160c10] border-[#2d1822] text-[#8a717a] hover:text-[#e0c0cc]'
                }`}
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
              className={`flex-1 border p-2 text-xs text-current focus:outline-none focus:opacity-95 ${storyBodyFont}`}
              style={isCustomTheme ? { backgroundColor: story.customBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : { backgroundColor: tone.inputBg, borderColor: tone.border }}
            />
            <button
              type="submit"
              disabled={!generalCommentText.trim()}
              className={`px-4 py-1.5 border disabled:opacity-40 text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${storyBtnFont}`}
              style={isCustomTheme ? { backgroundColor: story.customBtnBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : { backgroundColor: tone.buttonBgPrimary, borderColor: tone.buttonBorderSecondary, color: tone.text }}
            >
              <Send className="w-3 h-3" />
              <span>Gửi</span>
            </button>
          </form>

          {/* List of comments */}
          <div className="space-y-2">
            {displayedComments.filter(c => !c.parentCommentId).length === 0 ? (
              <div className={`py-6 text-center text-xs ${storyMutedFont}`} style={customStyles.textMuted}>
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
                    className="border p-3.5 text-xs space-y-2 transition-colors duration-300"
                    style={isCustomTheme ? { backgroundColor: story.customBgColor, borderColor: story.customBorderColor } : { backgroundColor: tone.inputBg, borderColor: tone.border }}
                  >
                    {/* Header Info */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-current ${storyBtnFont}`} style={customStyles.text}>{cm.userName}</span>
                        {cm.paragraphIndex !== undefined && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveParagraphIndex(cm.paragraphIndex!);
                              document.getElementById(`para-${cm.paragraphIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className={`text-[10px] bg-[#221019] hover:bg-[#351826] border border-[#5e2f46] text-[#e0c0cc] px-1.5 py-0.2 transition flex items-center gap-1 ${storyMutedFont}`}
                            title="Bấm để cuộn đến đoạn văn này"
                          >
                            <CornerDownRight className="w-2.5 h-2.5 text-[#d0a0b0]" />
                            <span>Đoạn #{cm.paragraphIndex + 1}</span>
                          </button>
                        )}
                      </div>
                      <span style={customStyles.textMuted} className={`text-[11px] ${storyMutedFont}`}>{cm.createdAt}</span>
                    </div>

                    {/* Snippet (if comment by paragraph) */}
                    {cm.paragraphSnippet && (
                      <div className={`text-[11px] text-[#8a717a] italic p-1.5 bg-[#0c0608]/60 border-l-2 border-[#5e2f46] line-clamp-1 ${storyBodyFont}`}>
                        "{cm.paragraphSnippet}"
                      </div>
                    )}

                    {/* Comment Content */}
                    <p className={`opacity-95 leading-relaxed ${storyBodyFont}`} style={customStyles.text}>{cm.content}</p>

                    {/* Reply & Action Buttons */}
                    <div className="flex items-center gap-3 pt-1 border-t border-transparent">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingToId(replyingToId === cm.id ? null : cm.id);
                          setReplyText('');
                        }}
                        className="text-[11px] font-semibold text-[#ff99bb] hover:underline flex items-center gap-1"
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
                        className="mt-2.5 flex gap-2 pl-3 border-l border-[#ff99bb]/40"
                      >
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Phản hồi bình luận của ${cm.userName}...`}
                          className="flex-1 border p-1.5 text-xs text-current focus:outline-none bg-black/20"
                          style={isCustomTheme ? { borderColor: story.customBorderColor, color: story.customTextColor } : { borderColor: tone.border }}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className={`px-3 py-1 border text-[11px] font-bold uppercase transition`}
                          style={isCustomTheme ? { backgroundColor: story.customBtnBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : { backgroundColor: tone.buttonBgPrimary, borderColor: tone.buttonBorderSecondary, color: tone.text }}
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
                          style={customStyles.text}
                        >
                          Hủy
                        </button>
                      </form>
                    )}

                    {/* Nested Replies List */}
                    {currentReplies.length > 0 && (
                      <div className="mt-2 space-y-1.5 pl-3 border-l border-[#ff99bb]/20">
                        {currentReplies.map((reply) => (
                          <div 
                            key={reply.id}
                            className="p-2 bg-black/15 text-xs space-y-1 border-l-2 border-[#ff99bb]/30"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold flex items-center gap-1" style={customStyles.text}>
                                <CornerDownRight className="w-3 h-3 text-[#ff99bb]/80" />
                                <span>{reply.userName}</span>
                              </span>
                              <span style={customStyles.textMuted} className={`text-[10px] opacity-70 ${storyMutedFont}`}>{reply.createdAt}</span>
                            </div>
                            <p className="opacity-90 leading-relaxed" style={customStyles.text}>{reply.content}</p>
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

      {/* Auto-Resume Toast Notification */}
      {autoResumeNotice && (
        <div 
          className={`fixed bottom-6 right-6 z-50 max-w-sm border p-3 shadow-xl rounded-sm flex items-center justify-between gap-3 text-xs font-mono-code animate-fade-in ${isCustomTheme ? '' : `${tone.badgeLocked} ${tone.badgeLockedBorder} ${tone.text}`}`}
          style={isCustomTheme ? { backgroundColor: story.customCardBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
        >
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 shrink-0" style={{ color: progressBarColor }} />
            <span>{autoResumeNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setAutoResumeNotice(null);
            }}
            className={`px-2 py-1 border text-[10px] uppercase font-bold shrink-0 flex items-center gap-1 transition ${isCustomTheme ? '' : `${tone.buttonBgSecondary} ${tone.buttonBorderSecondary} ${tone.text}`}`}
            style={isCustomTheme ? { backgroundColor: story.customBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
          >
            <ArrowUp className="w-3 h-3" />
            <span>Đầu trang</span>
          </button>
        </div>
      )}
    </div>
  );
};

