import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Story, Chapter, Comment, UserProfile } from '../types';
import { ArrowLeft, Bookmark, BookOpen, Send, MessageSquare, Lock, Unlock, CheckCircle2, User, RotateCcw, BookmarkCheck } from 'lucide-react';
import { getReadingProgress } from '../lib/readingProgress';
import { ReadingEffects } from './ReadingEffects';
import {
  getStoryBorderStyle,
  getStoryButtonBorderStyle,
  StoryCornerAccents,
} from '../lib/borderStyles';

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

interface StoryDetailProps {
  story: Story;
  chapters: Chapter[];
  comments: Comment[];
  isBookmarked: boolean;
  userProfile?: UserProfile | null;
  currentUser?: { uid: string; email?: string | null } | null;
  isAdmin?: boolean;
  onToggleBookmark: (storyId: string) => void;
  onSelectChapter: (chapter: Chapter) => void;
  onBack: () => void;
  onAddComment: (content: string) => void;
}

export const StoryDetail: React.FC<StoryDetailProps> = ({
  story,
  chapters,
  comments,
  isBookmarked,
  userProfile,
  currentUser,
  isAdmin = false,
  onToggleBookmark,
  onSelectChapter,
  onBack,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [liveEditorProfile, setLiveEditorProfile] = useState<{ displayName?: string; photoURL?: string } | null>(null);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  // Lấy tiến trình đọc dở từ localStorage
  const lastReadProgress = getReadingProgress(story.id);
  const lastReadChapter = lastReadProgress ? chapters.find(c => c.id === lastReadProgress.chapterId) : null;

  // Lắng nghe realtime profile của tác giả/editor từ Firestore nếu có authorUid
  useEffect(() => {
    if (!story.authorUid) {
      setLiveEditorProfile(null);
      return;
    }

    if (userProfile && userProfile.uid === story.authorUid) {
      setLiveEditorProfile({
        displayName: userProfile.displayName,
        photoURL: userProfile.photoURL,
      });
      return;
    }

    try {
      const unsub = onSnapshot(doc(db, 'users', story.authorUid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setLiveEditorProfile({
            displayName: data.displayName || data.email?.split('@')[0],
            photoURL: data.photoURL || '',
          });
        }
      }, (err) => {
        console.warn('Could not fetch live editor profile:', err);
      });
      return () => unsub();
    } catch (err) {
      console.warn('Error setting up editor profile listener:', err);
    }
  }, [story.authorUid, userProfile]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
  };

  const storyTitleFont = story.customTitleFont || story.defaultFont || 'font-mono';
  const storyBodyFont = story.customBodyFont || story.defaultFont || 'font-mono';
  const storyMutedFont = story.customMutedFont || story.defaultFont || 'font-mono';
  const storyBtnFont = story.customBtnFont || story.defaultFont || 'font-mono';
  const toneKey = story.themeTone || 'dark-rose';
  const isCustomTheme = toneKey === 'custom';
  const tone = THEME_TONES[toneKey] || THEME_TONES['dark-rose'];

  const cardBgColor = isCustomTheme
    ? (story.customCardBgColor || '#11090c')
    : (tone.cardBg.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/)?.[0] ? `#${tone.cardBg.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/)![1]}` : '#11090c');

  const activeBorderColor = isCustomTheme
    ? (story.customBorderColor || '#2d1822')
    : (tone.border.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/)?.[0] ? `#${tone.border.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/)![1]}` : '#2d1822');

  const activeBtnBorderColor = isCustomTheme
    ? (story.customBorderColor || '#5e2f46')
    : (tone.buttonBorderPrimary.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/)?.[0] ? `#${tone.buttonBorderPrimary.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/)![1]}` : activeBorderColor);

  const storyBorderObj = {
    borderStyle: story.borderStyle || 'solid',
    borderWidth: story.borderWidth || 'thin',
    borderRadius: story.borderRadius || 'none',
    borderCornerAccent: story.borderCornerAccent || 'none',
    borderGlow: story.borderGlow || 'none',
  };

  const customStyles = {
    container: isCustomTheme
      ? { background: story.customBgColor || '#080406', color: story.customTextColor }
      : (tone.gradientBg ? { background: tone.gradientBg } : {}),
    card: isCustomTheme
      ? { background: story.customCardBgColor, color: story.customTextColor, borderColor: story.customBorderColor }
      : {},
    textMuted: isCustomTheme ? { color: story.customTextMutedColor } : {},
    text: isCustomTheme ? { color: story.customTextColor } : {},
    border: isCustomTheme ? { borderColor: story.customBorderColor } : {},
    input: isCustomTheme
      ? { background: story.customBgColor, color: story.customTextColor, borderColor: story.customBorderColor }
      : {},
    btnPrimary: isCustomTheme
      ? { background: story.customBtnBgColor, borderColor: story.customBorderColor, color: story.customTextColor }
      : {},
    btnSecondary: isCustomTheme
      ? { background: story.customCardBgColor, borderColor: story.customBorderColor, color: story.customTextColor }
      : {},
  };

  const editorDisplayName = 
    story.editorName ||
    liveEditorProfile?.displayName ||
    (userProfile && story.authorUid && userProfile.uid === story.authorUid ? userProfile.displayName : undefined) ||
    (currentUser && story.authorUid && currentUser.uid === story.authorUid ? currentUser.displayName || currentUser.email?.split('@')[0] : undefined) ||
    (userProfile?.displayName ? userProfile.displayName : undefined) ||
    (story.authorEmail ? story.authorEmail.split('@')[0] : 'Cục Nâu');

  const editorAvatarUrl =
    story.editorPhoto ||
    liveEditorProfile?.photoURL ||
    (userProfile && story.authorUid && userProfile.uid === story.authorUid ? userProfile.photoURL : undefined) ||
    (currentUser && story.authorUid && currentUser.uid === story.authorUid ? currentUser.photoURL : undefined) ||
    (userProfile?.photoURL ? userProfile.photoURL : undefined) ||
    '';

  const firstChapter = chapters.length > 0 ? (chapters.find(c => c.chapterNumber === 1) || chapters[0]) : null;

  return (
    <div 
      className={`max-w-4xl mx-auto px-4 py-6 space-y-6 ${storyBodyFont} ${isCustomTheme ? '' : tone.text}`}
      style={customStyles.container}
    >
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs hover:opacity-85 transition"
        style={customStyles.textMuted}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại trang chủ</span>
      </button>

      {/* Main Post Header */}
      <article 
        className={`${isCustomTheme ? '' : `${tone.cardBg}`} p-6 space-y-6 relative overflow-hidden transition-all duration-200`}
        style={{
          ...(isCustomTheme ? { background: story.customCardBgColor } : {}),
          ...getStoryBorderStyle(storyBorderObj, activeBorderColor),
        }}
      >
        {/* Corner Accents */}
        <StoryCornerAccents
          accent={story.borderCornerAccent}
          color={activeBorderColor}
        />

        <div className="grid grid-cols-1 sm:grid-cols-[224px_1fr] gap-6 items-start">
          {/* Cover: Luôn ở trên cùng hoặc cột trái */}
          {story.coverUrl && (
            <div className="order-1 sm:col-start-1 sm:row-start-1 w-full max-w-[224px] sm:max-w-none mx-auto sm:mx-0 shrink-0">
              <div 
                className="w-full aspect-[3/4] overflow-hidden flex justify-center items-center relative"
                style={{
                  ...(isCustomTheme
                    ? { background: story.customBtnSecondaryBgColor || story.customBgColor }
                    : { backgroundColor: tone.inputBg }),
                  ...getStoryBorderStyle(
                    {
                      borderStyle: story.borderStyle,
                      borderWidth: 'thin',
                      borderRadius: story.borderRadius,
                      borderGlow: 'none',
                    },
                    activeBorderColor
                  ),
                }}
              >
                <img
                  src={story.coverUrl}
                  alt={story.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Right Column (Title + Metadata + Synopsis): Trên mobile sẽ đứng thứ 2 (dưới ảnh bìa, trên editor/nút) */}
          <div className="order-2 sm:col-start-2 sm:row-start-1 sm:row-span-2 space-y-4">
            <h1 
              className={`font-bold tracking-[0.02em] ${storyTitleFont} ${story.titleFontSize ? '' : 'text-lg sm:text-2xl'}`}
              style={{
                ...customStyles.text,
                ...(story.titleFontSize ? { fontSize: story.titleFontSize } : {})
              }}
            >
              {story.title}
            </h1>

            <div 
              className={`text-xs space-y-1 border-b pb-3 ${storyMutedFont}`}
              style={isCustomTheme ? { borderColor: story.customBorderColor, color: story.customTextMutedColor } : { borderColor: tone.border, color: tone.textMuted }}
            >
              <p>Tác giả: <span className="font-semibold" style={customStyles.text}>{story.author}</span></p>
              <p>Ngày đăng: <span>{story.createdAt}</span></p>
              <p>Lượt xem: <span>{story.viewsCount}</span></p>
            </div>

            <div className="space-y-2">
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${storyBodyFont}`} style={customStyles.textMuted}>Giới thiệu:</h4>
              {story.synopsis ? (
                <div className="space-y-2">
                  <div 
                    className={`space-y-3 relative transition-all duration-300 ${
                      !isSynopsisExpanded ? 'max-h-72 sm:max-h-80 overflow-hidden' : ''
                    }`}
                  >
                    {story.synopsis
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((para, idx) => (
                        <p 
                          key={idx} 
                          className={`leading-relaxed opacity-90 text-justify ${story.bodyFontSize ? '' : 'text-sm'}`}
                          style={{
                            ...customStyles.text,
                            ...(story.bodyFontSize ? { fontSize: story.bodyFontSize } : {})
                          }}
                        >
                          {para}
                        </p>
                      ))}

                    {/* Gradient dải màu làm mờ chân chữ theo đúng màu nền của theme truyện */}
                    {!isSynopsisExpanded && story.synopsis.length > 250 && (
                      <div 
                        className="absolute bottom-0 inset-x-0 h-16 pointer-events-none"
                        style={{
                          background: `linear-gradient(to top, ${cardBgColor} 15%, transparent 100%)`
                        }}
                      />
                    )}
                  </div>

                  {story.synopsis.length > 250 && (
                    <button
                      type="button"
                      onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                      className="text-xs font-bold underline hover:opacity-80 transition cursor-pointer pt-0.5"
                      style={customStyles.textMuted}
                    >
                      {isSynopsisExpanded ? 'Thu gọn' : 'Xem thêm...'}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs italic" style={customStyles.textMuted}>Chưa có phần giới thiệu.</p>
              )}
            </div>
          </div>

          {/* Left Column Controls: Editor Info + Action Buttons + Tags (Trên mobile đứng thứ 3) */}
          <div className="order-3 sm:col-start-1 sm:row-start-2 w-full max-w-[224px] sm:max-w-none mx-auto sm:mx-0 shrink-0 flex flex-col gap-3.5">
            {/* Editor Info (Avatar + Name) */}
            <div 
              className={`p-2.5 flex items-center gap-2.5 ${isCustomTheme ? '' : `${tone.inputBg}`}`}
              style={{
                ...(isCustomTheme
                  ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor }
                  : {}),
                ...getStoryBorderStyle(
                  {
                    borderStyle: story.borderStyle,
                    borderWidth: 'thin',
                    borderRadius: story.borderRadius,
                    borderGlow: 'none',
                  },
                  activeBorderColor
                ),
              }}
            >
              <div 
                className={`w-8 h-8 rounded-full border overflow-hidden shrink-0 flex items-center justify-center ${isCustomTheme ? '' : tone.border}`}
                style={isCustomTheme ? { background: story.customCardBgColor, borderColor: story.customBorderColor } : { backgroundColor: tone.cardBg, borderColor: tone.border }}
              >
                {editorAvatarUrl ? (
                  <img
                    src={editorAvatarUrl}
                    alt={editorDisplayName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 opacity-70" style={customStyles.textMuted} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider block leading-tight opacity-75 ${storyMutedFont}`} style={customStyles.textMuted}>
                  Editor:
                </span>
                <span className={`text-xs font-bold truncate block leading-tight ${storyBtnFont}`} style={customStyles.text}>
                  {editorDisplayName}
                </span>
              </div>
            </div>

            {/* Action Buttons: Đọc tiếp / Đọc từ đầu & Lưu truyện */}
            <div className="space-y-2">
              {lastReadChapter ? (
                <>
                  <button
                    onClick={() => onSelectChapter(lastReadChapter)}
                    className={`w-full py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs ${storyBtnFont} ${isCustomTheme ? '' : `${tone.buttonBgPrimary} ${tone.text}`}`}
                    style={{
                      ...(isCustomTheme
                        ? { background: story.customBtnBgColor, color: story.customTextColor }
                        : {}),
                      ...getStoryButtonBorderStyle(
                        {
                          borderStyle: story.borderStyle,
                          borderRadius: story.borderRadius,
                        },
                        activeBtnBorderColor
                      ),
                    }}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Đọc tiếp (Ch. {lastReadChapter.chapterNumber}{lastReadProgress?.progressPercent !== undefined ? ` - ${lastReadProgress.progressPercent}%` : ''})</span>
                  </button>

                  {firstChapter && firstChapter.id !== lastReadChapter.id && (
                    <button
                      onClick={() => onSelectChapter(firstChapter)}
                      className={`w-full py-1.5 px-3 text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 opacity-80 hover:opacity-100 ${storyBtnFont} ${isCustomTheme ? '' : `${tone.buttonBgSecondary} ${tone.text}`}`}
                      style={{
                        ...(isCustomTheme
                          ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor, color: story.customTextColor }
                          : {}),
                        ...getStoryButtonBorderStyle(
                          {
                            borderStyle: story.borderStyle,
                            borderRadius: story.borderRadius,
                          },
                          activeBorderColor
                        ),
                      }}
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>Đọc từ đầu</span>
                    </button>
                  )}
                </>
              ) : (
                firstChapter && (
                  <button
                    onClick={() => onSelectChapter(firstChapter)}
                    className={`w-full py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs ${storyBtnFont} ${isCustomTheme ? '' : `${tone.buttonBgPrimary} ${tone.text}`}`}
                    style={{
                      ...(isCustomTheme
                        ? { background: story.customBtnBgColor, color: story.customTextColor }
                        : {}),
                      ...getStoryButtonBorderStyle(
                        {
                          borderStyle: story.borderStyle,
                          borderRadius: story.borderRadius,
                        },
                        activeBtnBorderColor
                      ),
                    }}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Đọc từ đầu</span>
                  </button>
                )
              )}

              <button
                onClick={() => onToggleBookmark(story.id)}
                className={`w-full py-2 px-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${storyBtnFont} ${isCustomTheme ? '' : `${tone.buttonBgSecondary} ${tone.text}`}`}
                style={{
                  ...(isCustomTheme
                    ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor, color: story.customTextColor }
                    : {}),
                  ...getStoryButtonBorderStyle(
                    {
                      borderStyle: story.borderStyle,
                      borderRadius: story.borderRadius,
                    },
                    activeBorderColor
                  ),
                }}
              >
                <Bookmark className={`w-4 h-4 shrink-0 ${isBookmarked ? 'fill-[#d0a0b0] text-[#d0a0b0]' : ''}`} />
                <span>{isBookmarked ? 'Đã lưu truyện' : 'Lưu truyện'}</span>
              </button>
            </div>

            {/* Story Tags under Save Story button */}
            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {story.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] px-2 py-0.5 leading-tight ${storyBtnFont} ${isCustomTheme ? '' : `${tone.inputBg}`}`}
                    style={{
                      ...(isCustomTheme
                        ? { background: story.customBtnSecondaryBgColor || story.customBgColor, color: story.customTextMutedColor || story.customTextColor }
                        : { color: tone.textMuted }),
                      ...getStoryBorderStyle(
                        {
                          borderStyle: story.borderStyle,
                          borderWidth: 'thin',
                          borderRadius: story.borderRadius,
                          borderGlow: 'none',
                        },
                        activeBorderColor
                      ),
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chapters List with Section Breaks / Ngắt Phần */}
        <div 
          className="space-y-3 pt-4 border-t"
          style={customStyles.border}
        >
          <h3 className={`text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-between ${storyBodyFont}`} style={customStyles.text}>
            <span>Danh sách chương ({chapters.length})</span>
          </h3>

          {chapters.length === 0 ? (
            <p className="text-xs italic py-4" style={customStyles.textMuted}>Chưa có chương nào được đăng.</p>
          ) : (
            <div className="space-y-2">
              {(() => {
                const sorted = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
                return sorted.map((chap, idx) => {
                  const prevChap = idx > 0 ? sorted[idx - 1] : null;
                  const isNewVolume = !!(chap.volumeTitle && (!prevChap || prevChap.volumeTitle !== chap.volumeTitle));
                  const isTransitionToNoVolume = !chap.volumeTitle && !!(prevChap && prevChap.volumeTitle);

                  const isUnlocked = !!(userProfile?.unlockedChapters && userProfile.unlockedChapters.includes(chap.id));
                  const isAuthorOrOwner = 
                    (currentUser?.uid && story.authorUid && currentUser.uid === story.authorUid) ||
                    (currentUser?.email && story.authorEmail && currentUser.email.toLowerCase() === story.authorEmail.toLowerCase()) ||
                    isAdmin;

                  return (
                    <React.Fragment key={chap.id}>
                      {/* Section Break / Ngắt Phần Header */}
                      {isNewVolume && (
                        <div className="pt-3 pb-1">
                          <div 
                            className="px-3.5 py-2 flex items-center justify-between border font-bold text-xs uppercase tracking-wider rounded-xs select-none shadow-xs"
                            style={{
                              background: isCustomTheme
                                ? (story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor)
                                : undefined,
                              borderColor: activeBorderColor,
                              color: customStyles.text.color,
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 opacity-80" />
                              <span className={storyBodyFont}>{chap.volumeTitle}</span>
                            </div>
                            <span className={`text-[10px] font-normal font-mono ${storyMutedFont}`} style={customStyles.textMuted}>
                              {sorted.filter(c => c.volumeTitle === chap.volumeTitle).length} chương
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Divider when transitioning to chapters without a volume */}
                      {isTransitionToNoVolume && (
                        <div className="pt-3 pb-1">
                          <div 
                            className="px-3 py-1.5 flex items-center gap-2 border border-dashed text-xs opacity-75 rounded-xs"
                            style={{
                              borderColor: activeBorderColor,
                              color: customStyles.textMuted.color,
                            }}
                          >
                            <BookOpen className="w-3 h-3 opacity-60" />
                            <span className={`text-[11px] uppercase tracking-wider font-semibold ${storyMutedFont}`}>Các chương tiếp theo</span>
                          </div>
                        </div>
                      )}

                      <div
                        onClick={() => onSelectChapter(chap)}
                        className={`p-3 text-xs flex items-center justify-between cursor-pointer transition ${isCustomTheme ? '' : `${tone.inputBg}`}`}
                        style={{
                          ...(isCustomTheme
                            ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor }
                            : {}),
                          ...getStoryBorderStyle(
                            {
                              borderStyle: story.borderStyle,
                              borderWidth: 'thin',
                              borderRadius: story.borderRadius,
                              borderGlow: 'none',
                            },
                            activeBorderColor
                          ),
                        }}
                      >
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span 
                            className={`font-bold ${storyBodyFont} ${story.bodyFontSize ? '' : 'text-sm'}`} 
                            style={{
                              ...customStyles.text,
                              ...(story.bodyFontSize ? { fontSize: story.bodyFontSize } : {})
                            }}
                          >
                            {chap.title}
                          </span>
                          
                          {lastReadProgress && lastReadProgress.chapterId === chap.id && (
                            <span 
                              className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[11px] font-semibold ${storyBtnFont} ${isCustomTheme ? '' : `${tone.badgeLocked} ${tone.badgeLockedBorder} ${tone.badgeLockedText}`}`}
                              style={isCustomTheme ? { backgroundColor: story.customBtnBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
                            >
                              <BookmarkCheck className="w-3.5 h-3.5 opacity-80" />
                              <span>Đang đọc dở ({lastReadProgress.progressPercent || 0}%)</span>
                            </span>
                          )}
                          {chap.isLocked ? (
                            (isUnlocked && !isAuthorOrOwner) ? (
                              <span 
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[11px] font-semibold ${storyBtnFont} ${isCustomTheme ? '' : `${tone.badgeFree} ${tone.badgeFreeBorder} ${tone.badgeFreeText}`}`}
                                style={isCustomTheme ? { backgroundColor: story.customCardBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 opacity-80" />
                                <span>Đã mở khóa</span>
                              </span>
                            ) : (
                              <span 
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[11px] font-semibold shadow-xs ${storyBtnFont} ${isCustomTheme ? '' : `${tone.badgeLocked} ${tone.badgeLockedBorder} ${tone.badgeLockedText}`}`}
                                style={isCustomTheme ? { backgroundColor: story.customBtnBgColor || story.customCardBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
                              >
                                <Lock 
                                  className={`w-3.5 h-3.5 ${isCustomTheme ? '' : tone.badgeLockedIcon}`} 
                                  style={isCustomTheme ? { color: story.customTextColor } : {}}
                                />
                                <span>{chap.unlockPrice || 1} Chucu</span>
                              </span>
                            )
                          ) : null}
                        </div>
                        <span className={`text-xs ${storyMutedFont}`} style={customStyles.textMuted}>{chap.createdAt}</span>
                      </div>
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Comment Section */}
        <div 
          className="space-y-4 pt-6 border-t"
          style={customStyles.border}
        >
          <h3 className={`text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 ${storyBodyFont}`} style={customStyles.text}>
            <MessageSquare className="w-4 h-4 opacity-85" style={customStyles.textMuted} />
            <span>Bình luận ({comments.length})</span>
          </h3>

          {/* Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className={`flex-1 border p-2 text-xs focus:outline-none ${storyBodyFont} ${isCustomTheme ? '' : `${tone.inputBg} ${tone.border} ${tone.text}`}`}
              style={isCustomTheme ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={`px-4 py-2 border disabled:opacity-40 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 ${storyBtnFont} ${isCustomTheme ? '' : `${tone.buttonBgPrimary} ${tone.buttonBorderPrimary} ${tone.text}`}`}
              style={isCustomTheme ? { background: story.customBtnBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </button>
          </form>

          {/* List */}
          <div className="space-y-2">
            {comments.map((cm) => (
              <div 
                key={cm.id} 
                className={`border p-3 space-y-1 ${isCustomTheme ? '' : `${tone.inputBg} ${tone.border}`}`}
                style={isCustomTheme ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor, borderColor: story.customBorderColor } : {}}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${storyBtnFont}`} style={customStyles.text}>{cm.userName}</span>
                  <span className={storyMutedFont} style={customStyles.textMuted}>{cm.createdAt}</span>
                </div>
                <p className={`text-xs opacity-90 ${storyBodyFont}`} style={customStyles.text}>{cm.content}</p>
              </div>
            ))}
          </div>
        </div>

      </article>

      {/* Hiệu ứng đọc truyện hiển thị trực tiếp ở trang chi tiết truyện */}
      <ReadingEffects 
        effect={story.readingEffect} 
        isDarkTheme={
          isCustomTheme 
            ? !(story.customBgColor && (
                story.customBgColor.toLowerCase().includes('#fff') || 
                story.customBgColor.toLowerCase().includes('255, 255, 255') ||
                story.customBgColor.toLowerCase() === '#f4ecd8' ||
                story.customBgColor.toLowerCase() === '#ffffff'
              ))
            : toneKey !== 'sepia'
        } 
      />
    </div>
  );
};
