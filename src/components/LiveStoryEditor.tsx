import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { saveUserFontToCloud, deleteUserFontFromCloud, getUserFontsFromCloud } from '../lib/storage';
import { getIdbFonts, saveIdbFonts, deleteIdbFont, migrateLocalStorageFonts, StoredUserFont } from '../lib/idbStorage';
import { Story, UserProfile, CharacterInfo, Chapter } from '../types';
import { BulkChapterModal } from './BulkChapterModal';
import {
  ArrowLeft,
  Check,
  Upload,
  Link,
  BookOpen,
  Bookmark,
  RotateCcw,
  User,
  Users,
  TrendingUp,
  Palette,
  Type,
  Square,
  Sparkles,
  Sliders,
  X,
  Plus,
  Trash2,
  Edit3,
  Pipette,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Folder,
  GitCommit,
  Table,
  Columns2,
  Tag,
  LayoutList,
  FileText,
  Lock,
  Key,
  UploadCloud,
} from 'lucide-react';
import { ReadingEffects } from './ReadingEffects';
import {
  BORDER_STYLE_OPTIONS,
  BORDER_WIDTH_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  BORDER_CORNER_ACCENT_OPTIONS,
  BORDER_GLOW_OPTIONS,
  getStoryBorderStyle,
  getStoryButtonBorderStyle,
  StoryCornerAccents,
} from '../lib/borderStyles';

const FONT_OPTIONS = [
  // Serif
  { value: 'font-lora', label: 'Lora' },
  { value: 'font-garamond', label: 'EB Garamond' },
  { value: 'font-merriweather', label: 'Merriweather' },
  { value: 'font-playfair', label: 'Playfair Display' },
  { value: 'font-notoserif', label: 'Noto Serif' },
  { value: 'font-robotoslab', label: 'Roboto Slab' },
  { value: 'font-times', label: 'Times New Roman' },
  { value: 'font-cormorant', label: 'Cormorant Garamond' },

  // Sans-serif
  { value: 'font-bevietnam', label: 'Be Vietnam Pro' },
  { value: 'font-inter', label: 'Inter' },
  { value: 'font-opensans', label: 'Open Sans' },
  { value: 'font-roboto', label: 'Roboto' },
  { value: 'font-montserrat', label: 'Montserrat' },
  { value: 'font-nunito', label: 'Nunito' },
  { value: 'font-quicksand', label: 'Quicksand' },
  { value: 'font-mulish', label: 'Mulish' },
  { value: 'font-notosans', label: 'Noto Sans' },
  { value: 'font-sourcesans', label: 'Source Sans 3' },
  { value: 'font-worksans', label: 'Work Sans' },
  { value: 'font-sarabun', label: 'Sarabun' },
  { value: 'font-lexend', label: 'Lexend' },
  { value: 'font-comfortaa', label: 'Comfortaa' },
  { value: 'font-baloo', label: 'Baloo 2' },

  // Calligraphy & Script
  { value: 'font-charm', label: 'Charm' },
  { value: 'font-dancing', label: 'Dancing Script' },
  { value: 'font-pacifico', label: 'Pacifico' },
  { value: 'font-lobster', label: 'Lobster' },
  { value: 'font-pattaya', label: 'Pattaya' },
  { value: 'font-arima', label: 'Arima' },

  // Comic & Handwritten
  { value: 'font-patrick', label: 'Patrick Hand' },
  { value: 'font-itim', label: 'Itim' },
  { value: 'font-sriracha', label: 'Sriracha' },
  { value: 'font-cabinsketch', label: 'Cabin Sketch' },

  // Monospace
  { value: 'font-mono', label: 'JetBrains Mono' },
  { value: 'font-vt323', label: 'VT323' },
  { value: 'font-bungee', label: 'Bungee' },
];

const PRESET_THEME_COLORS: Record<string, {
  name: string;
  bg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  border: string;
  btnBg: string;
  btnSecondaryBg?: string;
  btnBorder: string;
  btnText: string;
}> = {
  'dark-rose': {
    name: 'Dark Rose (Hồng Đen)',
    bg: '#080406',
    cardBg: '#11090c',
    text: '#f2e6ea',
    textMuted: '#d0a0b0',
    border: '#2d1822',
    btnBg: '#2b1620',
    btnSecondaryBg: '#1c0f16',
    btnBorder: '#5e2f46',
    btnText: '#ffd6e2',
  },
  'classic-black': {
    name: 'Classic Black (Đen Tuyến)',
    bg: '#0a0a0a',
    cardBg: '#141414',
    text: '#f5f5f5',
    textMuted: '#a3a3a3',
    border: '#262626',
    btnBg: '#1f1f1f',
    btnSecondaryBg: '#171717',
    btnBorder: '#404040',
    btnText: '#ffffff',
  },
  'dark-violet': {
    name: 'Dark Violet (Tím Đêm)',
    bg: '#06030a',
    cardBg: '#0f0817',
    text: '#f2e8f8',
    textMuted: '#b690d4',
    border: '#28153b',
    btnBg: '#28133b',
    btnSecondaryBg: '#1a0c27',
    btnBorder: '#562c7e',
    btnText: '#ebd6fb',
  },
  'navy-blue': {
    name: 'Navy Blue (Xanh Đêm)',
    bg: '#03080d',
    cardBg: '#08121d',
    text: '#e6eff8',
    textMuted: '#8dafcb',
    border: '#152a40',
    btnBg: '#13283e',
    btnSecondaryBg: '#0c1b2c',
    btnBorder: '#295480',
    btnText: '#cce2f8',
  },
  'sepia': {
    name: 'Sepia (Giấy Cổ Điển)',
    bg: '#f4ecd8',
    cardBg: '#fcf8ed',
    text: '#4a3525',
    textMuted: '#8c7460',
    border: '#d3c29f',
    btnBg: '#e2d5b6',
    btnSecondaryBg: '#faf6eb',
    btnBorder: '#bca883',
    btnText: '#4a3525',
  },
  'emerald': {
    name: 'Emerald (Xanh Ngọc Lục)',
    bg: '#06100c',
    cardBg: '#0b1a14',
    text: '#d1e7dd',
    textMuted: '#628f7a',
    border: '#153327',
    btnBg: '#163f2d',
    btnSecondaryBg: '#0e251c',
    btnBorder: '#2a6b4e',
    btnText: '#d1e7dd',
  },
  'slate': {
    name: 'Slate (Xanh Đá Xám)',
    bg: '#0f172a',
    cardBg: '#1e293b',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: '#334155',
    btnBg: '#334155',
    btnSecondaryBg: '#1e293b',
    btnBorder: '#475569',
    btnText: '#f1f5f9',
  },
  'cyberpunk': {
    name: 'Cyberpunk (Neon Tím)',
    bg: '#05000a',
    cardBg: '#0d001a',
    text: '#00ffff',
    textMuted: '#ff007f',
    border: '#ff007f',
    btnBg: '#1f0038',
    btnSecondaryBg: '#120021',
    btnBorder: '#00ffff',
    btnText: '#00ffff',
  },
  'forest-dark': {
    name: 'Forest Dark (Rừng Đêm)',
    bg: '#030805',
    cardBg: '#08140c',
    text: '#e8f5ec',
    textMuted: '#88b894',
    border: '#163320',
    btnBg: '#14301d',
    btnSecondaryBg: '#0d2113',
    btnBorder: '#2d633c',
    btnText: '#c9e8d1',
  },
  'warm-coffee': {
    name: 'Warm Coffee (Cà Phê Ấm)',
    bg: '#0a0705',
    cardBg: '#140f0a',
    text: '#f5eee6',
    textMuted: '#c4ad97',
    border: '#332417',
    btnBg: '#2e1f13',
    btnSecondaryBg: '#21160d',
    btnBorder: '#5c4129',
    btnText: '#fceee1',
  },
  'gradient-rose': {
    name: 'Gradient Rose (Hồng Đen)',
    bg: 'linear-gradient(135deg, #4a1528 0%, #230b15 50%, #0c0408 100%)',
    cardBg: 'linear-gradient(135deg, #280c1b 0%, #1c0a13 100%)',
    text: '#fce7f0',
    textMuted: '#f4a6c1',
    border: '#682542',
    btnBg: '#521930',
    btnSecondaryBg: '#280c1b',
    btnBorder: '#832e55',
    btnText: '#ffc2d4',
  },
  'gradient-midnight': {
    name: 'Gradient Midnight (Đêm Tím)',
    bg: 'linear-gradient(135deg, #2e1065 0%, #160833 50%, #080314 100%)',
    cardBg: 'linear-gradient(135deg, #210f47 0%, #170b33 100%)',
    text: '#f3e8ff',
    textMuted: '#c084fc',
    border: '#581c87',
    btnBg: '#3b1278',
    btnSecondaryBg: '#210f47',
    btnBorder: '#7e22ce',
    btnText: '#e9d5ff',
  },
  'gradient-ocean': {
    name: 'Gradient Ocean (Đại Dương)',
    bg: 'linear-gradient(135deg, #0c4a6e 0%, #07273c 50%, #030d17 100%)',
    cardBg: 'linear-gradient(135deg, #0c273a 0%, #081d2c 100%)',
    text: '#e0f2fe',
    textMuted: '#38bdf8',
    border: '#0284c7',
    btnBg: '#0369a1',
    btnSecondaryBg: '#0c273a',
    btnBorder: '#38bdf8',
    btnText: '#bae6fd',
  },
  'gradient-emerald': {
    name: 'Gradient Emerald (Ngọc Lục Bảo)',
    bg: 'linear-gradient(135deg, #064e3b 0%, #04291f 50%, #02120d 100%)',
    cardBg: 'linear-gradient(135deg, #0d3327 0%, #082119 100%)',
    text: '#ecfdf5',
    textMuted: '#34d399',
    border: '#059669',
    btnBg: '#047857',
    btnSecondaryBg: '#0d3327',
    btnBorder: '#10b981',
    btnText: '#a7f3d0',
  },
  'gradient-sunset': {
    name: 'Gradient Sunset (Hoàng Hôn)',
    bg: 'linear-gradient(135deg, #681212 0%, #3b0914 50%, #120307 100%)',
    cardBg: 'linear-gradient(135deg, #380b15 0%, #24080e 100%)',
    text: '#fff1f2',
    textMuted: '#fb7185',
    border: '#9f1239',
    btnBg: '#881337',
    btnSecondaryBg: '#380b15',
    btnBorder: '#e11d48',
    btnText: '#fecdd3',
  },
  'gradient-cyber': {
    name: 'Gradient Cyber (Viễn Tưởng)',
    bg: 'linear-gradient(135deg, #581c87 0%, #2e0854 50%, #100220 100%)',
    cardBg: 'linear-gradient(135deg, #320a52 0%, #210638 100%)',
    text: '#fae8ff',
    textMuted: '#e879f9',
    border: '#a21caf',
    btnBg: '#7e22ce',
    btnSecondaryBg: '#320a52',
    btnBorder: '#c084fc',
    btnText: '#f5d0fe',
  },
  'gradient-gold': {
    name: 'Gradient Gold (Hoàng Gia Vàng)',
    bg: 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #180801 100%)',
    cardBg: 'linear-gradient(135deg, #3d1703 0%, #290e02 100%)',
    text: '#fef3c7',
    textMuted: '#fbbf24',
    border: '#b45309',
    btnBg: '#92400e',
    btnSecondaryBg: '#3d1703',
    btnBorder: '#d97706',
    btnText: '#fef3c7',
  },
  'gradient-cherry': {
    name: 'Gradient Cherry (Hoa Đào)',
    bg: 'linear-gradient(135deg, #831843 0%, #500724 50%, #1f020d 100%)',
    cardBg: 'linear-gradient(135deg, #42081f 0%, #2e0516 100%)',
    text: '#fce7f0',
    textMuted: '#f472b6',
    border: '#be185d',
    btnBg: '#9d174d',
    btnSecondaryBg: '#42081f',
    btnBorder: '#e11d48',
    btnText: '#ffe4e6',
  },
};

interface LiveStoryEditorProps {
  initialStory?: Story | null;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  chapters?: Chapter[];
  onOpenChapterManager?: (story: Story) => void;
  onSave: (storyData: Partial<Story>) => void;
  onCancel: () => void;
  onSaveChapter?: (chapter: Chapter) => void;
  onDeleteChapter?: (chapterId: string, storyId: string) => void;
  onSaveBatchChapters?: (chapters: Chapter[]) => Promise<void>;
}

interface LocalColorFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  allowGradient?: boolean;
  currentBg: string;
  currentBorder: string;
  currentText: string;
  currentCardBg: string;
}

const LocalColorField: React.FC<LocalColorFieldProps> = ({
  label,
  value,
  onChange,
  allowGradient = false,
  currentBg,
  currentBorder,
  currentText,
  currentCardBg,
}) => {
  const isGradient = allowGradient && value.includes('gradient');

  let color1 = '#080406';
  let color2 = '#000000';

  if (isGradient) {
    const colorMatches = value.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g);
    if (colorMatches && colorMatches.length >= 2) {
      color1 = colorMatches[0];
      color2 = colorMatches[1];
    } else if (colorMatches && colorMatches.length === 1) {
      color1 = colorMatches[0];
    }
  } else {
    color1 = value.startsWith('#') ? value : '#080406';
  }

  const handleToggleGradient = (checked: boolean) => {
    if (checked) {
      const c1 = value.startsWith('#') ? value : '#2b1620';
      const c2 = '#080406';
      onChange(`linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`);
    } else {
      onChange(color1);
    }
  };

  const handleUpdateC1 = (newC1: string) => {
    if (isGradient) {
      onChange(`linear-gradient(135deg, ${newC1} 0%, ${color2} 100%)`);
    } else {
      onChange(newC1);
    }
  };

  const handleUpdateC2 = (newC2: string) => {
    onChange(`linear-gradient(135deg, ${color1} 0%, ${newC2} 100%)`);
  };

  return (
    <div className="space-y-1.5 p-2 rounded border" style={{ background: currentCardBg, borderColor: currentBorder }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold" style={{ color: currentText }}>{label}:</span>
        {allowGradient && (
          <label className="flex items-center gap-1 cursor-pointer text-[9px] select-none">
            <input
              type="checkbox"
              checked={isGradient}
              onChange={(e) => handleToggleGradient(e.target.checked)}
              className="w-3.5 h-3.5 rounded border accent-[#a8446b]"
            />
            <span style={{ color: currentText }}>Gradient</span>
          </label>
        )}
      </div>

      {!isGradient ? (
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={color1.startsWith('#') ? color1 : '#080406'}
            onChange={(e) => handleUpdateC1(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border-0 p-0 shrink-0"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-1.5 py-0.5 border rounded text-[10px] font-mono"
            style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
          />
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] shrink-0 w-8" style={{ color: currentText }}>Màu 1:</span>
            <input
              type="color"
              value={color1}
              onChange={(e) => handleUpdateC1(e.target.value)}
              className="w-4 h-4 rounded cursor-pointer border-0 p-0 shrink-0"
            />
            <input
              type="text"
              value={color1}
              onChange={(e) => handleUpdateC1(e.target.value)}
              className="w-full px-1.5 py-0.5 border rounded text-[9px] font-mono"
              style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] shrink-0 w-8" style={{ color: currentText }}>Màu 2:</span>
            <input
              type="color"
              value={color2}
              onChange={(e) => handleUpdateC2(e.target.value)}
              className="w-4 h-4 rounded cursor-pointer border-0 p-0 shrink-0"
            />
            <input
              type="text"
              value={color2}
              onChange={(e) => handleUpdateC2(e.target.value)}
              className="w-full px-1.5 py-0.5 border rounded text-[9px] font-mono"
              style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const LiveStoryEditor: React.FC<LiveStoryEditorProps> = ({
  initialStory,
  currentUser,
  userProfile,
  chapters,
  onOpenChapterManager,
  onSave,
  onCancel,
  onSaveChapter,
  onDeleteChapter,
  onSaveBatchChapters,
}) => {
  // Story fields
  const [title, setTitle] = useState(initialStory?.title || '');
  const [author, setAuthor] = useState(initialStory?.author || 'Tử Thời Hoan');
  const [editorName, setEditorName] = useState(
    initialStory?.editorName ||
      userProfile?.displayName ||
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      'Cục Nâu'
  );
  const [editorPhoto, setEditorPhoto] = useState(
    initialStory?.editorPhoto ||
      userProfile?.photoURL ||
      currentUser?.photoURL ||
      ''
  );
  const [coverUrl, setCoverUrl] = useState(initialStory?.coverUrl || '');
  const [synopsis, setSynopsis] = useState(initialStory?.synopsis || '');
  const [tags, setTags] = useState<string[]>(initialStory?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const currentChapterCount = chapters ? chapters.length : (initialStory?.chapterCount || 0);

  // Styles & Theme
  const [themeTone, setThemeTone] = useState<string>(
    initialStory?.themeTone ||
      (initialStory?.customBtnBgColor || initialStory?.customBgColor ? 'custom' : 'dark-rose')
  );
  const [customTitleFont, setCustomTitleFont] = useState(initialStory?.customTitleFont || initialStory?.defaultFont || 'font-mono');
  const [customBodyFont, setCustomBodyFont] = useState(initialStory?.customBodyFont || initialStory?.defaultFont || 'font-mono');
  const [customMutedFont, setCustomMutedFont] = useState(initialStory?.customMutedFont || initialStory?.defaultFont || 'font-mono');
  const [customBtnFont, setCustomBtnFont] = useState(initialStory?.customBtnFont || initialStory?.defaultFont || 'font-mono');
  const [titleFontSize, setTitleFontSize] = useState<string>(initialStory?.titleFontSize || '24px');
  const [bodyFontSize, setBodyFontSize] = useState<string>(initialStory?.bodyFontSize || '14px');

  // Custom Colors
  const [customBgColor, setCustomBgColor] = useState(initialStory?.customBgColor || '#080406');
  const [customCardBgColor, setCustomCardBgColor] = useState(initialStory?.customCardBgColor || '#11090c');
  const [customTextColor, setCustomTextColor] = useState(initialStory?.customTextColor || '#e0d0d5');
  const [customTextMutedColor, setCustomTextMutedColor] = useState(initialStory?.customTextMutedColor || '#8a717a');
  const [customBorderColor, setCustomBorderColor] = useState(initialStory?.customBorderColor || '#2d1822');
  const [customBtnBgColor, setCustomBtnBgColor] = useState(initialStory?.customBtnBgColor || '#2b1620');
  const [customBtnSecondaryBgColor, setCustomBtnSecondaryBgColor] = useState(initialStory?.customBtnSecondaryBgColor || '#1c0f16');

  // Border & Frame & Card Pattern
  const [borderStyle, setBorderStyle] = useState<NonNullable<Story['borderStyle']>>(initialStory?.borderStyle || 'solid');
  const [borderWidth, setBorderWidth] = useState<NonNullable<Story['borderWidth']>>(initialStory?.borderWidth || 'thin');
  const [borderRadius, setBorderRadius] = useState<NonNullable<Story['borderRadius']>>(initialStory?.borderRadius || 'none');
  const [borderCornerAccent, setBorderCornerAccent] = useState<NonNullable<Story['borderCornerAccent']>>(initialStory?.borderCornerAccent || 'none');
  const [borderGlow, setBorderGlow] = useState<NonNullable<Story['borderGlow']>>(initialStory?.borderGlow || 'none');
  const [customBorderGradientColor2, setCustomBorderGradientColor2] = useState<string>(initialStory?.customBorderGradientColor2 || '#ff6b9d');
  const [customBorderGlowColor1, setCustomBorderGlowColor1] = useState<string>(initialStory?.customBorderGlowColor1 || '#ff6b9d');
  const [customBorderGlowColor2, setCustomBorderGlowColor2] = useState<string>(initialStory?.customBorderGlowColor2 || '#38bdf8');

  // Reading Effect
  const [readingEffect, setReadingEffect] = useState<'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'ginkgo'>(
    (initialStory?.readingEffect as any) || 'none'
  );

  // Working Story ID & Chapter Management States
  const [workingStoryId] = useState<string>(() => initialStory?.id || 'story-' + Date.now());

  // Editing active chapter state (null => Story Page view; not null => Chapter Reader & Editor view)
  const [editingChapterItem, setEditingChapterItem] = useState<Chapter | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState<boolean>(false);
  const [chapterToDeleteItem, setChapterToDeleteItem] = useState<Chapter | null>(null);

  // Form fields for active editing chapter
  const [chapterTitleInput, setChapterTitleInput] = useState<string>('');
  const [chapterVolumeTitleInput, setChapterVolumeTitleInput] = useState<string>('');
  const [chapterContentInput, setChapterContentInput] = useState<string>('');
  const [isChapterLockedInput, setIsChapterLockedInput] = useState<boolean>(false);
  const [chapterUnlockPriceInput, setChapterUnlockPriceInput] = useState<number>(1);
  const [isChapterPasswordProtectedInput, setIsChapterPasswordProtectedInput] = useState<boolean>(false);
  const [chapterPasswordInput, setChapterPasswordInput] = useState<string>('');
  const [chapterPasswordHintInput, setChapterPasswordHintInput] = useState<string>('');

  const storyChapters = (chapters || []).filter((c) => c && c.storyId === workingStoryId);

  // Trạng thái Tách theme và hiệu ứng chương và truyện riêng biệt
  const [useSeparateChapterTheme, setUseSeparateChapterTheme] = useState<boolean>(initialStory?.useSeparateChapterTheme || false);
  const [useSeparateChapterEffect, setUseSeparateChapterEffect] = useState<boolean>(
    initialStory?.useSeparateChapterEffect ?? (initialStory?.useSeparateChapterTheme || false)
  );
  const [chapterThemeTone, setChapterThemeTone] = useState<string>(initialStory?.chapterThemeTone || initialStory?.themeTone || 'dark-rose');
  const [chapterCustomBgColor, setChapterCustomBgColor] = useState(initialStory?.chapterCustomBgColor || '#080406');
  const [chapterCustomCardBgColor, setChapterCustomCardBgColor] = useState(initialStory?.chapterCustomCardBgColor || '#11090c');
  const [chapterCustomTextColor, setChapterCustomTextColor] = useState(initialStory?.chapterCustomTextColor || '#e0d0d5');
  const [chapterCustomTextMutedColor, setChapterCustomTextMutedColor] = useState(initialStory?.chapterCustomTextMutedColor || '#8a717a');
  const [chapterCustomBorderColor, setChapterCustomBorderColor] = useState(initialStory?.chapterCustomBorderColor || '#2d1822');
  const [chapterCustomBtnBgColor, setChapterCustomBtnBgColor] = useState(initialStory?.chapterCustomBtnBgColor || '#2b1620');
  const [chapterCustomBtnSecondaryBgColor, setChapterCustomBtnSecondaryBgColor] = useState(initialStory?.chapterCustomBtnSecondaryBgColor || '#1c0f16');

  const [chapterBorderStyle, setChapterBorderStyle] = useState<NonNullable<Story['borderStyle']>>(initialStory?.chapterBorderStyle || 'solid');
  const [chapterBorderWidth, setChapterBorderWidth] = useState<NonNullable<Story['borderWidth']>>(initialStory?.chapterBorderWidth || 'thin');
  const [chapterBorderRadius, setChapterBorderRadius] = useState<NonNullable<Story['borderRadius']>>(initialStory?.chapterBorderRadius || 'none');
  const [chapterBorderCornerAccent, setChapterBorderCornerAccent] = useState<NonNullable<Story['borderCornerAccent']>>(initialStory?.chapterBorderCornerAccent || 'none');
  const [chapterBorderGlow, setChapterBorderGlow] = useState<NonNullable<Story['borderGlow']>>(initialStory?.chapterBorderGlow || 'none');
  const [chapterCustomBorderGradientColor2, setChapterCustomBorderGradientColor2] = useState<string>(initialStory?.chapterCustomBorderGradientColor2 || '#ff6b9d');
  const [chapterCustomBorderGlowColor1, setChapterCustomBorderGlowColor1] = useState<string>(initialStory?.chapterCustomBorderGlowColor1 || '#ff6b9d');
  const [chapterCustomBorderGlowColor2, setChapterCustomBorderGlowColor2] = useState<string>(initialStory?.chapterCustomBorderGlowColor2 || '#38bdf8');
  const [chapterReadingEffect, setChapterReadingEffect] = useState<'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'ginkgo'>(
    (initialStory?.chapterReadingEffect as any) || 'none'
  );

  // Widget thông tin nhân vật (Character Info Widget)
  const [showCharacterWidget, setShowCharacterWidget] = useState<boolean>(
    initialStory?.showCharacterWidget ?? false
  );
  const [characterWidgetTitle, setCharacterWidgetTitle] = useState<string>(
    initialStory?.characterWidgetTitle || 'Thông tin nhân vật'
  );
  const [characters, setCharacters] = useState<CharacterInfo[]>(
    initialStory?.characters || []
  );

  // Widget tiến độ bộ truyện (Story Progress Widget)
  const [showProgressWidget, setShowProgressWidget] = useState<boolean>(
    initialStory?.showProgressWidget ?? false
  );
  const [progressWidgetTitle, setProgressWidgetTitle] = useState<string>(
    initialStory?.progressWidgetTitle || 'Tiến độ bộ truyện'
  );
  const [totalPlannedChapters, setTotalPlannedChapters] = useState<number>(
    initialStory?.totalPlannedChapters || 0
  );

  // Kiểu trình bày danh sách chương (Chapter List Display Style)
  const [chapterListStyle, setChapterListStyle] = useState<NonNullable<Story['chapterListStyle']>>(
    initialStory?.chapterListStyle || 'standard'
  );

  // Form thêm/sửa nhân vật
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [charName, setCharName] = useState('');
  const [charRole, setCharRole] = useState('');
  const [charDesc, setCharDesc] = useState('');
  const [charAvatar, setCharAvatar] = useState('');
  const [showCharModal, setShowCharModal] = useState(false);
  const [isCompressingCharAvatar, setIsCompressingCharAvatar] = useState(false);
  const charAvatarFileInputRef = useRef<HTMLInputElement>(null);

  // Floating Design Drawer Tabs
  const [activeDrawerTab, setActiveDrawerTab] = useState<'theme' | 'fonts' | 'borders' | 'effects' | 'widgets' | null>(null);
  const [isCompressingCover, setIsCompressingCover] = useState(false);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);
  const [showCoverUrlModal, setShowCoverUrlModal] = useState(false);
  const [tempCoverUrl, setTempCoverUrl] = useState('');

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Custom User-Uploaded Fonts (lưu trữ trong IndexedDB an toàn, đồng bộ Firestore)
  const [userUploadedFonts, setUserUploadedFonts] = useState<StoredUserFont[]>([]);

  // Tự động nạp fonts từ IndexedDB khi mount
  useEffect(() => {
    migrateLocalStorageFonts().then((fonts) => {
      setUserUploadedFonts(fonts);
      fonts.forEach(font => {
        if (font.value && font.fontData) {
          injectFontFace(font);
        }
      });
    }).catch(err => {
      console.warn('[LiveStoryEditor] Error loading IDB fonts:', err);
    });
  }, []);

  const injectFontFace = (font: { value: string; fontData: string }) => {
    const styleId = `style-${font.value}`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @font-face {
        font-family: '${font.value}';
        src: url('${font.fontData}');
      }
      .${font.value} {
        font-family: '${font.value}', sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  };

  useEffect(() => {
    userUploadedFonts.forEach(font => {
      injectFontFace(font);
    });
  }, [userUploadedFonts]);

  // Sync fonts from Firestore to IndexedDB and State when user logs in
  useEffect(() => {
    const syncFontsFromCloud = async () => {
      if (!currentUser?.uid) return;
      try {
        const cloudFonts = await getUserFontsFromCloud(currentUser.uid);
        if (cloudFonts.length > 0) {
          const currentIdbFonts = await getIdbFonts();
          const merged: StoredUserFont[] = [...currentIdbFonts];

          cloudFonts.forEach(cf => {
            const exists = merged.find(lf => lf.value === cf.value);
            if (!exists) {
              merged.push({
                value: cf.value,
                label: cf.name,
                styleId: `style-${cf.value}`,
                fontData: cf.fileData
              });
            }
          });

          setUserUploadedFonts(merged);
          await saveIdbFonts(merged);
          merged.forEach(font => {
            injectFontFace(font);
          });
        }
      } catch (err) {
        console.warn('[Sync Fonts] Lỗi khi tải font cá nhân từ Firestore:', err);
      }
    };
    syncFontsFromCloud();
  }, [currentUser]);

  const handleUploadFontFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files) as File[];
    let updatedFonts = [...userUploadedFonts];
    let skippedCount = 0;
    let successCount = 0;

    for (const file of filesArray) {
      // Cho phép font đến 3MB an toàn trên IndexedDB
      if (file.size > 3 * 1024 * 1024) {
        alert(`Kích thước font "${file.name}" quá lớn! Hãy chọn file dưới 3MB.`);
        continue;
      }

      // Read file to base64
      const base64Data = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string || null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

      if (!base64Data) continue;

      const fontName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
      const label = `${fontName} (Tùy biến)`;

      // Check for duplicates (case insensitive name, or same base64 data)
      const isDuplicate = updatedFonts.some(f => 
        f.label.replace(' (Tùy biến)', '').toLowerCase() === fontName.toLowerCase() ||
        f.fontData === base64Data
      );

      if (isDuplicate) {
        skippedCount++;
        continue;
      }

      const fontValue = `font-user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const styleId = `style-${fontValue}`;

      const newFont: StoredUserFont = {
        value: fontValue,
        label,
        styleId,
        fontData: base64Data
      };

      updatedFonts.push(newFont);
      injectFontFace(newFont);
      successCount++;

      // Lưu lên Firestore nếu người dùng đã đăng nhập
      if (currentUser?.uid) {
        try {
          await saveUserFontToCloud(currentUser.uid, newFont.label, newFont.value, newFont.fontData);
        } catch (err) {
          console.warn('[Sync Fonts] Không thể sao lưu font lên Firestore:', err);
        }
      }
    }

    if (successCount > 0) {
      setUserUploadedFonts(updatedFonts);
      await saveIdbFonts(updatedFonts);
    }

    if (filesArray.length > 1) {
      alert(`Đã tải lên thành công ${successCount} font. Bỏ qua ${skippedCount} font trùng lặp.`);
    } else if (skippedCount > 0) {
      alert(`Font "${filesArray[0].name}" đã tồn tại trên hệ thống (đã lọc trùng).`);
    }

    // Reset input value so same files can be selected again
    e.target.value = '';
  };

  const handleDeleteUploadedFont = async (fontValue: string) => {
    const updated = userUploadedFonts.filter(f => f.value !== fontValue);
    setUserUploadedFonts(updated);
    await deleteIdbFont(fontValue);

    const styleEl = document.getElementById(`style-${fontValue}`);
    if (styleEl) {
      styleEl.remove();
    }

    // Xóa khỏi Firestore nếu người dùng đã đăng nhập
    if (currentUser?.uid) {
      try {
        await deleteUserFontFromCloud(currentUser.uid, fontValue);
      } catch (err) {
        console.warn('[Sync Fonts] Không thể xóa font trên Firestore:', err);
      }
    }
  };

  const ALL_FONTS = [...userUploadedFonts, ...FONT_OPTIONS];

  // Lock body overflow while live editor is open full screen
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Compute live visual tokens based on active preview page (if split)
  const isViewingChapterTheme = useSeparateChapterTheme && editingChapterItem !== null;
  const activeTone = isViewingChapterTheme ? chapterThemeTone : themeTone;
  const isCustomTheme = activeTone === 'custom';
  const activePreset = PRESET_THEME_COLORS[activeTone] || PRESET_THEME_COLORS['dark-rose'];

  const currentBg = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomBgColor : customBgColor) 
    : activePreset.bg;
  const currentCardBg = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomCardBgColor : customCardBgColor) 
    : activePreset.cardBg;
  const currentText = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomTextColor : customTextColor) 
    : activePreset.text;
  const currentTextMuted = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomTextMutedColor : customTextMutedColor) 
    : activePreset.textMuted;
  const currentBorder = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomBorderColor : customBorderColor) 
    : activePreset.border;
  const currentBtnBg = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomBtnBgColor : customBtnBgColor) 
    : activePreset.btnBg;
  const currentBtnSecondaryBg = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomBtnSecondaryBgColor : customBtnSecondaryBgColor) 
    : (activePreset.btnSecondaryBg || activePreset.btnBg);
  const currentBtnBorder = isCustomTheme ? currentBorder : activePreset.btnBorder;
  const currentBtnText = isCustomTheme ? currentText : activePreset.btnText;

  // Check if background is dark for effect visibility
  const isDarkTheme = !currentBg.toLowerCase().includes('#fff') && !currentBg.toLowerCase().includes('255, 255, 255');

  const activeBStyle = isViewingChapterTheme ? chapterBorderStyle : borderStyle;
  const activeBWidth = isViewingChapterTheme ? chapterBorderWidth : borderWidth;
  const activeBRadius = isViewingChapterTheme ? chapterBorderRadius : borderRadius;
  const activeBCorner = isViewingChapterTheme ? chapterBorderCornerAccent : borderCornerAccent;
  const activeBGlow = isViewingChapterTheme ? chapterBorderGlow : borderGlow;

  const isSeparatedEffect = useSeparateChapterEffect || useSeparateChapterTheme;
  const isViewingChapterEffect = isSeparatedEffect && editingChapterItem !== null;
  const activeReadingEffect = isViewingChapterEffect ? chapterReadingEffect : readingEffect;

  const currentBorderObj = {
    borderStyle: activeBStyle,
    borderWidth: activeBWidth,
    borderRadius: activeBRadius,
    borderCornerAccent: activeBCorner,
    borderGlow: activeBGlow,
    customBorderColor: currentBorder,
    customCardBgColor: currentCardBg,
    customBorderGradientColor2: isViewingChapterTheme ? chapterCustomBorderGradientColor2 : customBorderGradientColor2,
    customBorderGlowColor1: isViewingChapterTheme ? chapterCustomBorderGlowColor1 : customBorderGlowColor1,
    customBorderGlowColor2: isViewingChapterTheme ? chapterCustomBorderGlowColor2 : customBorderGlowColor2,
  };

  // Getters/setters for Customizer Drawer controls (handles automatic target switching)
  const activeThemeTone = isViewingChapterTheme ? chapterThemeTone : themeTone;
  const activeBgColorVal = isViewingChapterTheme ? chapterCustomBgColor : customBgColor;
  const activeCardBgColorVal = isViewingChapterTheme ? chapterCustomCardBgColor : customCardBgColor;
  const activeTextColorVal = isViewingChapterTheme ? chapterCustomTextColor : customTextColor;
  const activeTextMutedColorVal = isViewingChapterTheme ? chapterCustomTextMutedColor : customTextMutedColor;
  const activeBorderColorVal = isViewingChapterTheme ? chapterCustomBorderColor : customBorderColor;
  const activeBtnBgColorVal = isViewingChapterTheme ? chapterCustomBtnBgColor : customBtnBgColor;
  const activeBtnSecondaryBgColorVal = isViewingChapterTheme ? chapterCustomBtnSecondaryBgColor : customBtnSecondaryBgColor;
  const activeBorderGradientColor2Val = isViewingChapterTheme ? chapterCustomBorderGradientColor2 : customBorderGradientColor2;
  const activeBorderGlowColor1Val = isViewingChapterTheme ? chapterCustomBorderGlowColor1 : customBorderGlowColor1;
  const activeBorderGlowColor2Val = isViewingChapterTheme ? chapterCustomBorderGlowColor2 : customBorderGlowColor2;

  const handleSetBorderGradientColor2 = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomBorderGradientColor2(val);
    else setCustomBorderGradientColor2(val);
  };
  const handleSetBorderGlowColor1 = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomBorderGlowColor1(val);
    else setCustomBorderGlowColor1(val);
  };
  const handleSetBorderGlowColor2 = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomBorderGlowColor2(val);
    else setCustomBorderGlowColor2(val);
  };

  const handleSetThemeTone = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterThemeTone(val);
      if (val === 'custom') {
        const preset = PRESET_THEME_COLORS[chapterThemeTone] || PRESET_THEME_COLORS['dark-rose'];
        if (preset) {
          setChapterCustomBgColor(preset.bg);
          setChapterCustomCardBgColor(preset.cardBg);
          setChapterCustomTextColor(preset.text);
          setChapterCustomTextMutedColor(preset.textMuted);
          setChapterCustomBorderColor(preset.border);
          setChapterCustomBtnBgColor(preset.btnBg);
          setChapterCustomBtnSecondaryBgColor(preset.btnSecondaryBg || preset.btnBg);
        }
      }
    } else {
      setThemeTone(val);
      if (val === 'custom') {
        const preset = PRESET_THEME_COLORS[themeTone] || PRESET_THEME_COLORS['dark-rose'];
        if (preset) {
          setCustomBgColor(preset.bg);
          setCustomCardBgColor(preset.cardBg);
          setCustomTextColor(preset.text);
          setCustomTextMutedColor(preset.textMuted);
          setCustomBorderColor(preset.border);
          setCustomBtnBgColor(preset.btnBg);
          setCustomBtnSecondaryBgColor(preset.btnSecondaryBg || preset.btnBg);
        }
      }
    }
  };
  const handleSetBgColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomBgColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomBgColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetCardBgColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomCardBgColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomCardBgColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetTextColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomTextColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomTextColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetTextMutedColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomTextMutedColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomTextMutedColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetBorderColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomBorderColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomBorderColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetBtnBgColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomBtnBgColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomBtnBgColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetBtnSecondaryBgColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomBtnSecondaryBgColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomBtnSecondaryBgColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };

  const handleSetBorderStyle = (val: any) => {
    if (isViewingChapterTheme) {
      setChapterBorderStyle(val);
      if (val === 'sketch') {
        setChapterBorderRadius('none');
        setChapterBorderCornerAccent('none');
      }
    } else {
      setBorderStyle(val);
      if (val === 'sketch') {
        setBorderRadius('none');
        setBorderCornerAccent('none');
      }
    }
  };
  const handleSetBorderWidth = (val: any) => {
    if (isViewingChapterTheme) setChapterBorderWidth(val);
    else setBorderWidth(val);
  };
  const handleSetBorderRadius = (val: any) => {
    if (activeBStyle === 'sketch') return;
    if (isViewingChapterTheme) setChapterBorderRadius(val);
    else setBorderRadius(val);
  };
  const handleSetBorderCornerAccent = (val: any) => {
    if (activeBStyle === 'sketch') return;
    if (isViewingChapterTheme) setChapterBorderCornerAccent(val);
    else setBorderCornerAccent(val);
  };
  const handleSetBorderGlow = (val: any) => {
    if (isViewingChapterTheme) setChapterBorderGlow(val);
    else setBorderGlow(val);
  };
  const handleSetReadingEffect = (val: any) => {
    if (isViewingChapterEffect) setChapterReadingEffect(val);
    else setReadingEffect(val);
  };

  // Image compressor
  const handleCompressAndSetImage = (file: File, target: 'cover' | 'avatar') => {
    if (target === 'cover') setIsCompressingCover(true);
    else setIsCompressingAvatar(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = target === 'cover' ? 800 : 256;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          if (target === 'cover') {
            setCoverUrl(dataUrl);
            setIsCompressingCover(false);
          } else {
            setEditorPhoto(dataUrl);
            setIsCompressingAvatar(false);
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const rawTags = newTagInput.split(/[,，\n]/);
    const updatedTags = [...tags];
    rawTags.forEach((item) => {
      const cleanTag = item.trim().replace(/^#/, '');
      if (cleanTag && !updatedTags.includes(cleanTag)) {
        updatedTags.push(cleanTag);
      }
    });
    setTags(updatedTags);
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Helper functions cho Widget nhân vật
  const handleOpenAddChar = () => {
    setEditingCharId(null);
    setCharName('');
    setCharRole('');
    setCharDesc('');
    setCharAvatar('');
    setShowCharModal(true);
  };

  const handleOpenEditChar = (char: CharacterInfo) => {
    setEditingCharId(char.id);
    setCharName(char.name);
    setCharRole(char.role || '');
    setCharDesc(char.description || '');
    setCharAvatar(char.avatarUrl || '');
    setShowCharModal(true);
  };

  const handleSaveChar = () => {
    if (!charName.trim()) {
      alert('Vui lòng nhập tên nhân vật!');
      return;
    }
    if (editingCharId) {
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === editingCharId
            ? {
                id: editingCharId,
                name: charName.trim(),
                role: charRole.trim() || undefined,
                description: charDesc.trim() || undefined,
                avatarUrl: charAvatar.trim() || undefined,
              }
            : c
        )
      );
    } else {
      const newChar: CharacterInfo = {
        id: 'char-' + Date.now(),
        name: charName.trim(),
        role: charRole.trim() || undefined,
        description: charDesc.trim() || undefined,
        avatarUrl: charAvatar.trim() || undefined,
      };
      setCharacters((prev) => [...prev, newChar]);
    }
    setShowCharModal(false);
    setEditingCharId(null);
  };

  const handleDeleteChar = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCompressCharAvatar = (file: File) => {
    setIsCompressingCharAvatar(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 256;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setCharAvatar(canvas.toDataURL('image/jpeg', 0.85));
        }
        setIsCompressingCharAvatar(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEditChapterItem = (chap: Chapter) => {
    setEditingChapterItem(chap);
    setChapterTitleInput(chap.title || '');
    setChapterVolumeTitleInput(chap.volumeTitle || '');
    setChapterContentInput(chap.content || '');
    setIsChapterLockedInput(!!chap.isLocked);
    setChapterUnlockPriceInput(chap.unlockPrice && chap.unlockPrice > 0 ? chap.unlockPrice : 1);
    setIsChapterPasswordProtectedInput(!!chap.isPasswordProtected || !!chap.password);
    setChapterPasswordInput(chap.password || '');
    setChapterPasswordHintInput(chap.passwordHint || '');
  };

  const handleOpenCreateNewChapter = (presetVolume = '') => {
    const nextNum = storyChapters.length + 1;
    const newChap: Chapter = {
      id: 'chap-' + Date.now(),
      storyId: workingStoryId,
      chapterNumber: nextNum,
      title: `Chương ${nextNum}`,
      volumeTitle: presetVolume,
      content: '',
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isLocked: false,
      unlockPrice: 1,
      isPasswordProtected: false,
      password: '',
      passwordHint: '',
    };
    handleOpenEditChapterItem(newChap);
  };

  const handleSaveChapterItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingChapterItem) return;

    if (!chapterTitleInput.trim()) {
      alert('Vui lòng nhập tiêu đề chương.');
      return;
    }

    if (isChapterPasswordProtectedInput && !chapterPasswordInput.trim()) {
      alert('Vui lòng nhập mật khẩu (Pass) cho chương hoặc bỏ chọn ô đặt mật khẩu.');
      return;
    }

    const updatedChap: Chapter = {
      ...editingChapterItem,
      storyId: workingStoryId,
      title: chapterTitleInput.trim(),
      volumeTitle: chapterVolumeTitleInput.trim() || undefined,
      content: chapterContentInput.trim(),
      isLocked: isChapterLockedInput,
      unlockPrice: isChapterLockedInput ? Math.max(1, chapterUnlockPriceInput) : undefined,
      isPasswordProtected: isChapterPasswordProtectedInput,
      password: isChapterPasswordProtectedInput ? chapterPasswordInput.trim() : undefined,
      passwordHint: isChapterPasswordProtectedInput ? (chapterPasswordHintInput.trim() || undefined) : undefined,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (onSaveChapter) {
      onSaveChapter(updatedChap);
    }
    setEditingChapterItem(null);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên truyện!');
      return;
    }

    onSave({
      id: workingStoryId,
      title: title.trim(),
      author: author.trim() || 'Tác giả',
      editorName: editorName.trim() || 'Cục Nâu',
      editorPhoto: editorPhoto.trim(),
      coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
      synopsis: synopsis.trim(),
      tags: tags.length > 0 ? tags : undefined,

      // Widget thông tin nhân vật
      showCharacterWidget,
      characterWidgetTitle: characterWidgetTitle.trim() || 'Thông tin nhân vật',
      characters: characters.length > 0 ? characters : undefined,

      // Widget tiến độ bộ truyện
      showProgressWidget,
      progressWidgetTitle: progressWidgetTitle.trim() || 'Tiến độ bộ truyện',
      totalPlannedChapters: totalPlannedChapters || 0,

      // Kiểu trình bày danh sách chương
      chapterListStyle,
      themeTone,
      defaultFont: customBodyFont,
      customTitleFont,
      customBodyFont,
      customMutedFont,
      customBtnFont,
      titleFontSize,
      bodyFontSize,
      customBgColor: themeTone === 'custom' ? customBgColor : undefined,
      customCardBgColor: themeTone === 'custom' ? customCardBgColor : undefined,
      customTextColor: themeTone === 'custom' ? customTextColor : undefined,
      customTextMutedColor: themeTone === 'custom' ? customTextMutedColor : undefined,
      customBorderColor: themeTone === 'custom' ? customBorderColor : undefined,
      customBtnBgColor: themeTone === 'custom' ? customBtnBgColor : undefined,
      customBtnSecondaryBgColor: themeTone === 'custom' ? customBtnSecondaryBgColor : undefined,
      borderStyle,
      borderWidth,
      borderRadius,
      borderCornerAccent,
      borderGlow,
      customBorderGradientColor2,
      customBorderGlowColor1,
      customBorderGlowColor2,
      readingEffect,

      // Thông số theme & hiệu ứng chương riêng biệt
      useSeparateChapterTheme,
      useSeparateChapterEffect,
      chapterThemeTone,
      chapterCustomBgColor: chapterThemeTone === 'custom' ? chapterCustomBgColor : undefined,
      chapterCustomCardBgColor: chapterThemeTone === 'custom' ? chapterCustomCardBgColor : undefined,
      chapterCustomTextColor: chapterThemeTone === 'custom' ? chapterCustomTextColor : undefined,
      chapterCustomTextMutedColor: chapterThemeTone === 'custom' ? chapterCustomTextMutedColor : undefined,
      chapterCustomBorderColor: chapterThemeTone === 'custom' ? chapterCustomBorderColor : undefined,
      chapterCustomBtnBgColor: chapterThemeTone === 'custom' ? chapterCustomBtnBgColor : undefined,
      chapterCustomBtnSecondaryBgColor: chapterThemeTone === 'custom' ? chapterCustomBtnSecondaryBgColor : undefined,
      chapterBorderStyle,
      chapterBorderWidth,
      chapterBorderRadius,
      chapterBorderCornerAccent,
      chapterBorderGlow,
      chapterCustomBorderGradientColor2,
      chapterCustomBorderGlowColor1,
      chapterCustomBorderGlowColor2,
      chapterReadingEffect,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto w-full h-full min-h-screen transition-colors duration-200"
      style={{
        background: currentBg,
        color: currentText,
      }}
    >
      {/* Hiệu ứng đọc thời gian thực */}
      {activeReadingEffect !== 'none' && <ReadingEffects effect={activeReadingEffect} isDarkTheme={isDarkTheme} />}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={coverFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleCompressAndSetImage(e.target.files[0], 'cover');
          }
        }}
      />
      <input
        type="file"
        ref={avatarFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleCompressAndSetImage(e.target.files[0], 'avatar');
          }
        }}
      />

      {/* STICKY TOP TOOLBAR */}
      <header
        className="sticky top-0 z-40 px-4 py-2.5 backdrop-blur-md border-b flex items-center justify-between shadow-lg"
        style={{
          background: currentCardBg,
          borderColor: currentBorder,
          color: currentText,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded border hover:opacity-80 transition"
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hủy / Quay lại</span>
          </button>

          <span
            className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block px-2.5 py-1 rounded font-mono border"
            style={{
              background: currentBtnBg,
              borderColor: currentBtnBorder,
              color: currentBtnText,
            }}
          >
            {initialStory ? 'Chế độ chỉnh sửa trực tiếp' : 'Chế độ tạo truyện trực tiếp'}
          </span>
        </div>

        {/* Quick Design Switchers */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'theme' ? null : 'theme')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition ${
              activeDrawerTab === 'theme' ? 'ring-2 ring-white/50' : 'hover:opacity-90'
            }`}
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
            title="Đổi màu sắc & Tông màu"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Màu sắc</span>
          </button>

          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'fonts' ? null : 'fonts')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition ${
              activeDrawerTab === 'fonts' ? 'ring-2 ring-white/50' : 'hover:opacity-90'
            }`}
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
            title="Đổi font chữ"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Font chữ</span>
          </button>

          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'borders' ? null : 'borders')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition ${
              activeDrawerTab === 'borders' ? 'ring-2 ring-white/50' : 'hover:opacity-90'
            }`}
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
            title="Đổi đường viền & Khung trang trí"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Khung viền</span>
          </button>

          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'effects' ? null : 'effects')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition ${
              activeDrawerTab === 'effects' ? 'ring-2 ring-white/50' : 'hover:opacity-90'
            }`}
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
            title="Hiệu ứng rơi / mưa / sao / tuyết"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Hiệu ứng</span>
          </button>

          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'widgets' ? null : 'widgets')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition ${
              activeDrawerTab === 'widgets' ? 'ring-2 ring-white/50' : 'hover:opacity-90'
            }`}
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
            title="Cài đặt Widget Nhân vật"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Nhân vật</span>
          </button>

          {/* Primary Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded border shadow-md hover:opacity-90 active:scale-95 transition"
            style={{
              background: currentBtnBg,
              borderColor: currentBtnBorder,
              color: currentBtnText,
            }}
          >
            <Check className="w-4 h-4" />
            <span>Lưu truyện</span>
          </button>
        </div>
      </header>

      {/* FLOATING DESIGN DRAWER */}
      {activeDrawerTab && (
        <div
          className="fixed top-14 right-4 z-50 w-full max-w-sm sm:max-w-md p-4 rounded-lg shadow-2xl border backdrop-blur-xl max-h-[80vh] overflow-y-auto space-y-4 font-mono"
          style={{
            background: currentCardBg,
            borderColor: currentBorder,
            color: currentText,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: currentBorder }}>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: currentText }}>
              {activeDrawerTab === 'theme' && <Palette className="w-4 h-4" />}
              {activeDrawerTab === 'fonts' && <Type className="w-4 h-4" />}
              {activeDrawerTab === 'borders' && <Square className="w-4 h-4" />}
              {activeDrawerTab === 'effects' && <Sparkles className="w-4 h-4" />}
              {activeDrawerTab === 'widgets' && <Users className="w-4 h-4" />}
              <span>
                {activeDrawerTab === 'theme' && 'Cài đặt màu sắc & Tông nền'}
                {activeDrawerTab === 'fonts' && 'Cài đặt Font chữ'}
                {activeDrawerTab === 'borders' && 'Cài đặt Viền & Khung trang trí'}
                {activeDrawerTab === 'effects' && 'Cài đặt Hiệu ứng nền'}
                {activeDrawerTab === 'widgets' && 'Cài đặt Widget Nhân vật'}
              </span>
            </span>
            <button
              onClick={() => setActiveDrawerTab(null)}
              className="p-1 hover:opacity-70 transition rounded"
              style={{ color: currentText }}
              title="Đóng bảng thiết kế"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* TAB 1: THEME / COLORS */}
          {activeDrawerTab === 'theme' && (
            <div className="space-y-3 text-xs">
              {/* Nút bật/tắt tách theme */}
              <div className="p-2.5 rounded border border-dashed flex items-center justify-between" style={{ borderColor: currentBorder }}>
                <div className="pr-2">
                  <span className="font-bold block text-[11px]" style={{ color: currentText }}>Tách biệt theme truyện & chương</span>
                  <span className="text-[10px] leading-tight block" style={{ color: currentTextMuted }}>Cho phép thiết kế giao diện chương đọc khác với trang giới thiệu.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseSeparateChapterTheme(!useSeparateChapterTheme)}
                  className="w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0"
                  style={{
                    backgroundColor: useSeparateChapterTheme ? currentBtnBg : 'rgb(75, 85, 99)'
                  }}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                      useSeparateChapterTheme ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {useSeparateChapterTheme && (
                <div className="p-2 rounded text-[10px] font-mono border text-center font-bold" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                  {editingChapterItem === null ? (
                    <span className="text-amber-500">Thiết lập: Giao diện trang truyện</span>
                  ) : (
                    <span className="text-emerald-500">Thiết lập: Giao diện đọc chương</span>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Chọn bộ màu có sẵn:
                </label>
                <select
                  value={activeThemeTone}
                  onChange={(e) => handleSetThemeTone(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none font-semibold"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  <optgroup label="Đơn sắc & Trầm ấm" style={{ background: currentCardBg, color: currentText }}>
                    <option value="dark-rose" style={{ background: currentCardBg, color: currentText }}>Dark Rose (Hồng Đen)</option>
                    <option value="classic-black" style={{ background: currentCardBg, color: currentText }}>Classic Black (Đen Tuyến)</option>
                    <option value="dark-violet" style={{ background: currentCardBg, color: currentText }}>Dark Violet (Tím Đêm)</option>
                    <option value="navy-blue" style={{ background: currentCardBg, color: currentText }}>Navy Blue (Xanh Đêm)</option>
                    <option value="forest-dark" style={{ background: currentCardBg, color: currentText }}>Forest Dark (Rừng Đêm)</option>
                    <option value="warm-coffee" style={{ background: currentCardBg, color: currentText }}>Warm Coffee (Cà Phê Ấm)</option>
                    <option value="sepia" style={{ background: currentCardBg, color: currentText }}>Sepia (Giấy Cổ Điển)</option>
                    <option value="emerald" style={{ background: currentCardBg, color: currentText }}>Emerald (Xanh Ngọc Lục)</option>
                    <option value="slate" style={{ background: currentCardBg, color: currentText }}>Slate (Xanh Đá Xám)</option>
                    <option value="cyberpunk" style={{ background: currentCardBg, color: currentText }}>Cyberpunk (Neon Tím)</option>
                  </optgroup>
                  <optgroup label="Gradient (Chuyển sắc)" style={{ background: currentCardBg, color: currentText }}>
                    <option value="gradient-rose" style={{ background: currentCardBg, color: currentText }}>Gradient Rose (Hồng Đen)</option>
                    <option value="gradient-midnight" style={{ background: currentCardBg, color: currentText }}>Gradient Midnight (Đêm Tím)</option>
                    <option value="gradient-ocean" style={{ background: currentCardBg, color: currentText }}>Gradient Ocean (Đại Dương)</option>
                    <option value="gradient-emerald" style={{ background: currentCardBg, color: currentText }}>Gradient Emerald (Ngọc Lục Bảo)</option>
                    <option value="gradient-sunset" style={{ background: currentCardBg, color: currentText }}>Gradient Sunset (Hoàng Hôn)</option>
                    <option value="gradient-cyber" style={{ background: currentCardBg, color: currentText }}>Gradient Cyber (Viễn Tưởng)</option>
                    <option value="gradient-gold" style={{ background: currentCardBg, color: currentText }}>Gradient Gold (Hoàng Gia Vàng)</option>
                    <option value="gradient-cherry" style={{ background: currentCardBg, color: currentText }}>Gradient Cherry (Hoa Đào)</option>
                  </optgroup>
                  <optgroup label="Tùy biến tự do" style={{ background: currentCardBg, color: currentText }}>
                    <option value="custom" style={{ background: currentCardBg, color: currentText }}>Tùy biến bảng màu chi tiết (Custom)</option>
                  </optgroup>
                </select>
              </div>

              {/* Chi tiết từng mã màu khi chọn Custom */}
              {isCustomTheme && (
                <div className="p-3 rounded border space-y-2.5" style={{ background: currentBg, borderColor: currentBorder }}>
                  <div className="text-[11px] font-bold pb-1 border-b flex items-center justify-between" style={{ borderColor: currentBorder, color: currentText }}>
                    <span>Bảng mã màu tùy biến:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <LocalColorField
                      label="Màu nền chính"
                      value={activeBgColorVal}
                      onChange={handleSetBgColor}
                      allowGradient
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu thẻ nội dung"
                      value={activeCardBgColorVal}
                      onChange={handleSetCardBgColor}
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu nút chính"
                      value={activeBtnBgColorVal}
                      onChange={handleSetBtnBgColor}
                      allowGradient
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu nút phụ & Ô chứa"
                      value={activeBtnSecondaryBgColorVal}
                      onChange={handleSetBtnSecondaryBgColor}
                      allowGradient
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu chữ chính"
                      value={activeTextColorVal}
                      onChange={handleSetTextColor}
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu chữ phụ / mờ"
                      value={activeTextMutedColorVal}
                      onChange={handleSetTextMutedColor}
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu đường viền"
                      value={activeBorderColorVal}
                      onChange={handleSetBorderColor}
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FONTS */}
          {activeDrawerTab === 'fonts' && (
            <div className="space-y-4 text-xs">
              {/* Custom Upload Font Box */}
              <div className="p-3 rounded-lg border space-y-2.5" style={{ background: currentCardBg, borderColor: currentBorder }}>
                <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: currentText }}>
                  Tải Font cá nhân (.ttf, .otf, .woff, .woff2):
                </span>
                <p className="text-[9px] leading-tight" style={{ color: currentTextMuted }}>
                  * Font chữ được lưu trữ trong trình duyệt của bạn (chỉ thiết bị này mới sử dụng được và không lưu chung). Dung lượng giới hạn dưới 1.5MB.
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    multiple
                    onChange={handleUploadFontFile}
                    className="hidden"
                    id="user-custom-font-upload"
                  />
                  <label
                    htmlFor="user-custom-font-upload"
                    className="w-full py-1.5 px-3 bg-opacity-10 rounded border text-center font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-opacity-20 transition flex items-center justify-center gap-1.5 shadow-sm"
                    style={{
                      background: currentBtnBg,
                      borderColor: currentBtnBorder,
                      color: currentBtnText,
                    }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn File Font từ máy</span>
                  </label>
                  
                  {/* List of uploaded custom fonts with delete option */}
                  {userUploadedFonts.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentBorder }}>
                      <span className="block text-[9px] font-bold" style={{ color: currentTextMuted }}>
                        Font đã tải lên:
                      </span>
                      <div className="space-y-1 max-h-[100px] overflow-y-auto">
                        {userUploadedFonts.map((font) => (
                          <div key={font.value} className="flex items-center justify-between gap-1.5 p-1 rounded bg-black/10 border" style={{ borderColor: currentBorder }}>
                            <span className="text-[10px] truncate font-semibold" style={{ color: currentText, fontFamily: font.value }}>
                              {font.label.replace(' (Tùy biến)', '')}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteUploadedFont(font.value)}
                              className="text-red-400 hover:text-red-300 p-0.5"
                              title="Xóa font"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Font tiêu đề truyện:
                </label>
                <select
                  value={customTitleFont}
                  onChange={(e) => setCustomTitleFont(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: currentCardBg, color: currentText }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Font thân bài & giới thiệu:
                </label>
                <select
                  value={customBodyFont}
                  onChange={(e) => setCustomBodyFont(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: currentCardBg, color: currentText }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Font nút bấm:
                </label>
                <select
                  value={customBtnFont}
                  onChange={(e) => setCustomBtnFont(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: currentCardBg, color: currentText }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Font thông tin phụ / tác giả:
                </label>
                <select
                  value={customMutedFont}
                  onChange={(e) => setCustomMutedFont(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: currentCardBg, color: currentText }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-dashed space-y-3" style={{ borderColor: currentBorder }}>
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                    Cỡ chữ tiêu đề (Trang truyện):
                  </label>
                  <select
                    value={titleFontSize}
                    onChange={(e) => setTitleFontSize(e.target.value)}
                    className="w-full p-2 rounded border text-xs focus:outline-none"
                    style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                  >
                    <option value="18px" style={{ background: currentCardBg, color: currentText }}>Nhỏ (18px)</option>
                    <option value="20px" style={{ background: currentCardBg, color: currentText }}>Vừa (20px)</option>
                    <option value="24px" style={{ background: currentCardBg, color: currentText }}>Mặc định (24px)</option>
                    <option value="28px" style={{ background: currentCardBg, color: currentText }}>Lớn (28px)</option>
                    <option value="32px" style={{ background: currentCardBg, color: currentText }}>Rất lớn (32px)</option>
                    <option value="36px" style={{ background: currentCardBg, color: currentText }}>Cực lớn (36px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                    Cỡ chữ tóm tắt & danh sách chương:
                  </label>
                  <select
                    value={bodyFontSize}
                    onChange={(e) => setBodyFontSize(e.target.value)}
                    className="w-full p-2 rounded border text-xs focus:outline-none"
                    style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                  >
                    <option value="12px" style={{ background: currentCardBg, color: currentText }}>Nhỏ (12px)</option>
                    <option value="13px" style={{ background: currentCardBg, color: currentText }}>Hơi nhỏ (13px)</option>
                    <option value="14px" style={{ background: currentCardBg, color: currentText }}>Mặc định (14px)</option>
                    <option value="15px" style={{ background: currentCardBg, color: currentText }}>Vừa (15px)</option>
                    <option value="16px" style={{ background: currentCardBg, color: currentText }}>Chuẩn (16px)</option>
                    <option value="18px" style={{ background: currentCardBg, color: currentText }}>Lớn (18px)</option>
                    <option value="20px" style={{ background: currentCardBg, color: currentText }}>Rất lớn (20px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BORDERS & FRAMES */}
          {activeDrawerTab === 'borders' && (
            <div className="space-y-4 text-xs">
              {useSeparateChapterTheme && (
                <div className="p-2 rounded text-[10px] font-mono border text-center font-bold" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                  {editingChapterItem === null ? (
                    <span className="text-amber-500">Thiết lập viền: Giao diện trang truyện</span>
                  ) : (
                    <span className="text-emerald-500">Thiết lập viền: Giao diện đọc chương</span>
                  )}
                </div>
              )}

              {/* 1. Kiểu nét viền */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold" style={{ color: currentText }}>
                    1. Kiểu nét viền:
                  </label>
                  <span className="text-[10px] opacity-75 font-mono" style={{ color: currentTextMuted }}>
                    {BORDER_STYLE_OPTIONS.find(o => o.value === activeBStyle)?.label || activeBStyle}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {BORDER_STYLE_OPTIONS.map((opt) => {
                    const isSelected = activeBStyle === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSetBorderStyle(opt.value)}
                        className={`p-2 rounded text-left transition relative border ${
                          isSelected ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                        }`}
                        style={{
                          background: isSelected ? currentBtnBg : currentCardBg,
                          borderColor: isSelected ? (currentText || '#ff99bb') : currentBorder,
                          color: isSelected ? currentBtnText : currentText,
                        }}
                      >
                        <div className="text-[11px] font-bold truncate">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Tùy chỉnh 2 màu cho dải chuyển sắc (Gradient) */}
                {activeBStyle === 'gradient' && (
                  <div className="p-3 rounded border mt-2 space-y-2.5" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                    <div className="text-[11px] font-bold flex items-center justify-between" style={{ color: currentText }}>
                      <span>🎨 Tùy chỉnh 2 màu dải chuyển sắc (Gradient):</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Màu 1 */}
                      <div className="p-2 rounded bg-black/30 border border-white/10 space-y-1">
                        <span className="text-[10px] font-medium block" style={{ color: currentTextMuted }}>Màu 1 (Màu bắt đầu):</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={currentBorder}
                            onChange={(e) => handleSetBorderColor(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-white/20 p-0 bg-transparent shrink-0"
                          />
                          <span className="font-mono text-[10px] uppercase opacity-90 truncate" style={{ color: currentText }}>{currentBorder}</span>
                        </div>
                      </div>

                      {/* Màu 2 */}
                      <div className="p-2 rounded bg-black/30 border border-white/10 space-y-1">
                        <span className="text-[10px] font-medium block" style={{ color: currentTextMuted }}>Màu 2 (Màu kết thúc):</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={activeBorderGradientColor2Val}
                            onChange={(e) => handleSetBorderGradientColor2(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-white/20 p-0 bg-transparent shrink-0"
                          />
                          <span className="font-mono text-[10px] uppercase opacity-90 truncate" style={{ color: currentText }}>{activeBorderGradientColor2Val}</span>
                        </div>
                      </div>
                    </div>

                    {/* Phối màu Gradient mẫu */}
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <span className="text-[10px] opacity-75 block font-mono" style={{ color: currentTextMuted }}>Phối màu gradient gợi ý:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Hồng - Tím', c1: '#ff6b9d', c2: '#a855f7' },
                          { name: 'Vàng - Cam', c1: '#f59e0b', c2: '#ef4444' },
                          { name: 'Xanh - Lam', c1: '#10b981', c2: '#06b6d4' },
                          { name: 'Tím - Neon', c1: '#8b5cf6', c2: '#ec4899' },
                          { name: 'Kim loại', c1: '#e2e8f0', c2: '#64748b' },
                          { name: 'Hào quang', c1: '#f43f5e', c2: '#38bdf8' },
                        ].map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              handleSetBorderColor(p.c1);
                              handleSetBorderGradientColor2(p.c2);
                            }}
                            className="px-2 py-1 rounded text-[10px] font-medium border border-white/20 transition hover:scale-105 flex items-center gap-1 text-white shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
                          >
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Độ dày nét viền */}
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold" style={{ color: currentText }}>
                    2. Độ dày nét viền:
                  </label>
                  <span className="text-[10px] opacity-75 font-mono" style={{ color: currentTextMuted }}>
                    {BORDER_WIDTH_OPTIONS.find(o => o.value === activeBWidth)?.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {BORDER_WIDTH_OPTIONS.map((opt) => {
                    const isSelected = activeBWidth === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSetBorderWidth(opt.value)}
                        className={`py-2 px-1.5 rounded text-center transition border ${
                          isSelected ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                        }`}
                        style={{
                          background: isSelected ? currentBtnBg : currentCardBg,
                          borderColor: isSelected ? (currentText || '#ff99bb') : currentBorder,
                          color: isSelected ? currentBtnText : currentText,
                        }}
                      >
                        <div className="text-[10px] font-bold">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Kiểu bo góc & Hình dáng */}
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold" style={{ color: currentText }}>
                    3. Kiểu bo góc:
                  </label>
                  <span className="text-[10px] opacity-75 font-mono" style={{ color: currentTextMuted }}>
                    {activeBStyle === 'sketch' ? 'Vuông vức (Mặc định Nét vẽ tay)' : BORDER_RADIUS_OPTIONS.find(o => o.value === activeBRadius)?.label}
                  </span>
                </div>
                {activeBStyle === 'sketch' ? (
                  <div className="p-2 text-[11px] rounded border text-amber-500/90 font-medium bg-amber-500/10 border-amber-500/20">
                    🔒 Khi chọn Nét vẽ tay, góc viền sẽ mặc định vuông vức và không thể chọn bo góc.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                    {BORDER_RADIUS_OPTIONS.map((opt) => {
                      const isSelected = activeBRadius === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSetBorderRadius(opt.value)}
                          className={`p-2 rounded text-left transition border ${
                            isSelected ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                          }`}
                          style={{
                            background: isSelected ? currentBtnBg : currentCardBg,
                            borderColor: isSelected ? (currentText || '#ff99bb') : currentBorder,
                            color: isSelected ? currentBtnText : currentText,
                          }}
                        >
                          <div className="text-[10px] font-bold truncate">{opt.label}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Họa tiết 4 góc nghệ thuật */}
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold" style={{ color: currentText }}>
                    4. Họa tiết 4 góc nghệ thuật:
                  </label>
                  <span className="text-[10px] opacity-75 font-mono" style={{ color: currentTextMuted }}>
                    {activeBStyle === 'sketch' ? 'Không có (Mặc định Nét vẽ tay)' : BORDER_CORNER_ACCENT_OPTIONS.find(o => o.value === activeBCorner)?.label}
                  </span>
                </div>
                {activeBStyle === 'sketch' ? (
                  <div className="p-2 text-[11px] rounded border text-amber-500/90 font-medium bg-amber-500/10 border-amber-500/20">
                    🔒 Khi chọn Nét vẽ tay, mặc định không có họa tiết góc và không thể chọn họa tiết.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {BORDER_CORNER_ACCENT_OPTIONS.map((opt) => {
                      const isSelected = activeBCorner === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSetBorderCornerAccent(opt.value)}
                          className={`p-2 rounded text-left transition border ${
                            isSelected ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                          }`}
                          style={{
                            background: isSelected ? currentBtnBg : currentCardBg,
                            borderColor: isSelected ? (currentText || '#ff99bb') : currentBorder,
                            color: isSelected ? currentBtnText : currentText,
                          }}
                        >
                          <div className="text-[10px] font-bold truncate">{opt.label}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Hiệu ứng viền & Đổ bóng */}
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold" style={{ color: currentText }}>
                    5. Hiệu ứng phát sáng & Đổ bóng:
                  </label>
                  <span className="text-[10px] opacity-75 font-mono" style={{ color: currentTextMuted }}>
                    {BORDER_GLOW_OPTIONS.find(o => o.value === activeBGlow)?.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {BORDER_GLOW_OPTIONS.map((opt) => {
                    const isSelected = activeBGlow === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSetBorderGlow(opt.value)}
                        className={`p-2 rounded text-left transition border ${
                          isSelected ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                        }`}
                        style={{
                          background: isSelected ? currentBtnBg : currentCardBg,
                          borderColor: isSelected ? (currentText || '#ff99bb') : currentBorder,
                          color: isSelected ? currentBtnText : currentText,
                        }}
                      >
                        <div className="text-[10px] font-bold truncate">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Tùy chỉnh màu hào quang khi chọn Hào quang chuyển sắc */}
                {activeBGlow === 'gradient-aura' && (
                  <div className="p-2.5 rounded border mt-2 space-y-2" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                    <div className="text-[11px] font-bold" style={{ color: currentText }}>Tùy chọn màu hào quang:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-1.5 rounded bg-black/20">
                        <span className="text-[10px]" style={{ color: currentTextMuted }}>Màu 1:</span>
                        <input
                          type="color"
                          value={activeBorderGlowColor1Val}
                          onChange={(e) => handleSetBorderGlowColor1(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border border-white/20 p-0 bg-transparent"
                        />
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded bg-black/20">
                        <span className="text-[10px]" style={{ color: currentTextMuted }}>Màu 2:</span>
                        <input
                          type="color"
                          value={activeBorderGlowColor2Val}
                          onChange={(e) => handleSetBorderGlowColor2(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border border-white/20 p-0 bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: READING EFFECTS */}
          {activeDrawerTab === 'effects' && (
            <div className="space-y-3.5 text-xs">
              {/* Nút bật/tắt tách hiệu ứng */}
              <div className="p-2.5 rounded border border-dashed flex items-center justify-between" style={{ borderColor: currentBorder }}>
                <div className="pr-2">
                  <span className="font-bold block text-[11px]" style={{ color: currentText }}>Tách biệt hiệu ứng truyện & chương</span>
                  <span className="text-[10px] leading-tight block" style={{ color: currentTextMuted }}>
                    Cho phép chọn hiệu ứng rơi riêng biệt cho trang giới thiệu truyện và trang đọc chương.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseSeparateChapterEffect(!useSeparateChapterEffect)}
                  className="w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0"
                  style={{
                    backgroundColor: isSeparatedEffect ? currentBtnBg : 'rgb(75, 85, 99)'
                  }}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                      isSeparatedEffect ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Khi bật tách hiệu ứng: Hiển thị cả 2 bộ chọn */}
              {isSeparatedEffect ? (
                <div className="space-y-3">
                  {/* Thông tin mục tiêu cấu hình */}
                  <div className="p-2 rounded text-[10px] font-mono border text-center font-bold" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                    {editingChapterItem === null ? (
                      <span className="text-amber-500">Đang hiển thị hiệu ứng: Trang truyện</span>
                    ) : (
                      <span className="text-emerald-500">Đang hiển thị hiệu ứng: Đọc chương</span>
                    )}
                  </div>

                  {/* 1. Hiệu ứng Trang giới thiệu truyện */}
                  <div className={`p-2.5 rounded border space-y-1.5 transition-all ${
                    editingChapterItem === null ? 'ring-1 ring-amber-500/50' : 'opacity-80'
                  }`} style={{ background: currentBg, borderColor: currentBorder }}>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-amber-500">
                        Hiệu ứng Trang giới thiệu truyện:
                      </label>
                      {editingChapterItem !== null && (
                        <button
                          type="button"
                          onClick={() => setEditingChapterItem(null)}
                          className="text-[10px] text-amber-400 underline hover:opacity-80 font-mono cursor-pointer"
                        >
                          Trở về trang truyện
                        </button>
                      )}
                    </div>
                    <select
                      value={readingEffect}
                      onChange={(e) => setReadingEffect(e.target.value as any)}
                      className="w-full p-2 rounded border text-xs focus:outline-none"
                      style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                    >
                      <option value="none" style={{ background: currentCardBg, color: currentText }}>Không hiệu ứng (Tắt)</option>
                      <option value="rain" style={{ background: currentCardBg, color: currentText }}>Mưa rơi</option>
                      <option value="snow" style={{ background: currentCardBg, color: currentText }}>Tuyết rơi</option>
                      <option value="star" style={{ background: currentCardBg, color: currentText }}>Bụi sao</option>
                      <option value="leaf" style={{ background: currentCardBg, color: currentText }}>Lá phong rơi</option>
                      <option value="ginkgo" style={{ background: currentCardBg, color: currentText }}>Lá bạch quả rơi</option>
                      <option value="cherry_blossom" style={{ background: currentCardBg, color: currentText }}>Cánh hoa đào rơi</option>
                      <option value="firefly" style={{ background: currentCardBg, color: currentText }}>Đom đóm</option>
                      <option value="soap_bubble" style={{ background: currentCardBg, color: currentText }}>Bong bóng xà phòng</option>
                      <option value="glitch" style={{ background: currentCardBg, color: currentText }}>Nhiễu sóng</option>
                    </select>
                  </div>

                  {/* 2. Hiệu ứng Trang đọc chương */}
                  <div className={`p-2.5 rounded border space-y-1.5 transition-all ${
                    editingChapterItem !== null ? 'ring-1 ring-emerald-500/50' : 'opacity-80'
                  }`} style={{ background: currentBg, borderColor: currentBorder }}>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-emerald-500">
                        Hiệu ứng Trang đọc chương:
                      </label>
                    </div>
                    <select
                      value={chapterReadingEffect}
                      onChange={(e) => setChapterReadingEffect(e.target.value as any)}
                      className="w-full p-2 rounded border text-xs focus:outline-none"
                      style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                    >
                      <option value="none" style={{ background: currentCardBg, color: currentText }}>Không hiệu ứng (Tắt)</option>
                      <option value="rain" style={{ background: currentCardBg, color: currentText }}>Mưa rơi</option>
                      <option value="snow" style={{ background: currentCardBg, color: currentText }}>Tuyết rơi</option>
                      <option value="star" style={{ background: currentCardBg, color: currentText }}>Bụi sao</option>
                      <option value="leaf" style={{ background: currentCardBg, color: currentText }}>Lá phong rơi</option>
                      <option value="ginkgo" style={{ background: currentCardBg, color: currentText }}>Lá bạch quả rơi</option>
                      <option value="cherry_blossom" style={{ background: currentCardBg, color: currentText }}>Cánh hoa đào rơi</option>
                      <option value="firefly" style={{ background: currentCardBg, color: currentText }}>Đom đóm</option>
                      <option value="soap_bubble" style={{ background: currentCardBg, color: currentText }}>Bong bóng xà phòng</option>
                      <option value="glitch" style={{ background: currentCardBg, color: currentText }}>Nhiễu sóng</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* Dùng chung hiệu ứng */
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                    Hiệu ứng rơi chung (Áp dụng cho cả trang truyện & chương):
                  </label>
                  <select
                    value={readingEffect}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setReadingEffect(val);
                      setChapterReadingEffect(val);
                    }}
                    className="w-full p-2 rounded border text-xs focus:outline-none"
                    style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                  >
                    <option value="none" style={{ background: currentCardBg, color: currentText }}>Không hiệu ứng (Tắt)</option>
                    <option value="rain" style={{ background: currentCardBg, color: currentText }}>Mưa rơi</option>
                    <option value="snow" style={{ background: currentCardBg, color: currentText }}>Tuyết rơi</option>
                    <option value="star" style={{ background: currentCardBg, color: currentText }}>Bụi sao</option>
                    <option value="leaf" style={{ background: currentCardBg, color: currentText }}>Lá phong rơi</option>
                    <option value="ginkgo" style={{ background: currentCardBg, color: currentText }}>Lá bạch quả rơi</option>
                    <option value="cherry_blossom" style={{ background: currentCardBg, color: currentText }}>Cánh hoa đào rơi</option>
                    <option value="firefly" style={{ background: currentCardBg, color: currentText }}>Đom đóm</option>
                    <option value="soap_bubble" style={{ background: currentCardBg, color: currentText }}>Bong bóng xà phòng</option>
                    <option value="glitch" style={{ background: currentCardBg, color: currentText }}>Nhiễu sóng</option>
                  </select>
                </div>
              )}

              <p className="text-[10px] leading-relaxed" style={{ color: currentTextMuted }}>
                Hiệu ứng rơi sẽ tự động kích hoạt ngay trên nền trang đọc và trang chi tiết của bộ truyện theo từng cài đặt riêng.
              </p>
            </div>
          )}

          {/* TAB 5: WIDGETS (WIDGET NHÂN VẬT) */}
          {activeDrawerTab === 'widgets' && (
            <div className="space-y-4 text-xs">
              {/* Switch bật/tắt widget */}
              <div className="p-3 rounded border border-dashed flex items-center justify-between" style={{ borderColor: currentBorder, background: currentBg }}>
                <div className="pr-2">
                  <span className="font-bold block text-xs" style={{ color: currentText }}>Bật ô Widget nhân vật</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCharacterWidget(!showCharacterWidget)}
                  className="w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0"
                  style={{
                    backgroundColor: showCharacterWidget ? currentBtnBg : 'rgb(75, 85, 99)'
                  }}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                      showCharacterWidget ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {showCharacterWidget && (
                <>
                  {/* Cấu hình tiêu đề widget */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                      Tiêu đề ô Widget:
                    </label>
                    <input
                      type="text"
                      value={characterWidgetTitle}
                      onChange={(e) => setCharacterWidgetTitle(e.target.value)}
                      placeholder="Thông tin nhân vật"
                      className="w-full p-2 rounded border text-xs focus:outline-none"
                      style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                    />
                  </div>

                  {/* Nút thêm nhân vật */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-[11px]" style={{ color: currentText }}>
                      Danh sách nhân vật ({characters.length}):
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenAddChar}
                      className="px-2.5 py-1 text-[11px] font-bold rounded border flex items-center gap-1 hover:opacity-90 transition"
                      style={{
                        background: currentBtnBg,
                        borderColor: currentBtnBorder,
                        color: currentBtnText,
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm nhân vật</span>
                    </button>
                  </div>

                  {/* Danh sách nhân vật hiện tại */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {characters.length === 0 ? (
                      <p className="text-[11px] italic text-center py-3 opacity-70" style={{ color: currentTextMuted }}>
                        Chưa có nhân vật nào. Nhấp "Thêm nhân vật" để bắt đầu tạo.
                      </p>
                    ) : (
                      characters.map((char) => (
                        <div
                          key={char.id}
                          className="p-2 rounded border flex items-center justify-between gap-2"
                          style={{ background: currentBg, borderColor: currentBorder }}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className="w-8 h-8 rounded-full border shrink-0 overflow-hidden flex items-center justify-center bg-black/20"
                              style={{ borderColor: currentBorder }}
                            >
                              {char.avatarUrl ? (
                                <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 opacity-60" style={{ color: currentText }} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold truncate text-xs" style={{ color: currentText }}>
                                  {char.name}
                                </span>
                                {char.role && (
                                  <span
                                    className="text-[9px] px-1 rounded font-mono shrink-0"
                                    style={{ background: currentBtnBg, color: currentBtnText }}
                                  >
                                    {char.role}
                                  </span>
                                )}
                              </div>
                              {char.description && (
                                <p className="text-[10px] truncate opacity-75" style={{ color: currentTextMuted }}>
                                  {char.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditChar(char)}
                              className="p-1 hover:opacity-80 transition rounded text-blue-400"
                              title="Chỉnh sửa nhân vật"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteChar(char.id)}
                              className="p-1 hover:opacity-80 transition rounded text-red-400"
                              title="Xóa nhân vật"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* PHẦN 2: WIDGET TIẾN ĐỘ BỘ TRUYỆN */}
              <div className="pt-3 border-t space-y-3" style={{ borderColor: currentBorder }}>
                <div className="p-3 rounded border border-dashed flex items-center justify-between" style={{ borderColor: currentBorder, background: currentBg }}>
                  <div className="pr-2">
                    <span className="font-bold block text-xs" style={{ color: currentText }}>Bật ô Widget Tiến độ</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProgressWidget(!showProgressWidget)}
                    className="w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0"
                    style={{
                      backgroundColor: showProgressWidget ? currentBtnBg : 'rgb(75, 85, 99)'
                    }}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                        showProgressWidget ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {showProgressWidget && (
                  <div className="space-y-3 p-3 rounded border" style={{ borderColor: currentBorder, background: currentBg }}>
                    {/* Cấu hình tiêu đề widget tiến độ */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                        Tiêu đề Widget Tiến độ:
                      </label>
                      <input
                        type="text"
                        value={progressWidgetTitle}
                        onChange={(e) => setProgressWidgetTitle(e.target.value)}
                        placeholder="Tiến độ bộ truyện"
                        className="w-full p-2 rounded border text-xs focus:outline-none"
                        style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                      />
                    </div>

                    {/* Cấu hình tổng số chương dự kiến */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                        Tổng số chương dự kiến của bộ truyện:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={totalPlannedChapters || ''}
                        onChange={(e) => setTotalPlannedChapters(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="Ví dụ: 100, 500, 1000..."
                        className="w-full p-2 rounded border text-xs focus:outline-none font-mono"
                        style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                      />
                    </div>

                    {/* Xem trước tiến độ */}
                    <div className="p-2.5 rounded border space-y-1.5" style={{ background: currentCardBg, borderColor: currentBorder }}>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span style={{ color: currentText }}>{progressWidgetTitle || 'Tiến độ bộ truyện'}</span>
                        <span className="font-mono" style={{ color: currentBtnBg }}>
                          {totalPlannedChapters > 0
                            ? `${Math.min(100, Math.round(((initialStory?.chapterCount || 0) / totalPlannedChapters) * 100))}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden bg-black/30 border" style={{ borderColor: currentBorder }}>
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: currentBtnBg,
                            width: `${totalPlannedChapters > 0
                              ? Math.min(100, Math.round(((initialStory?.chapterCount || 0) / totalPlannedChapters) * 100))
                              : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PHẦN 3: KIỂU TRÌNH BÀY DANH SÁCH CHƯƠNG */}
              <div className="pt-3 border-t space-y-2.5" style={{ borderColor: currentBorder }}>
                <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: currentText }}>
                  Kiểu trình bày Danh sách chương:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'standard', name: 'Thẻ truyền thống', desc: 'Danh sách thẻ dọc chi tiết đầy đủ với hiệu ứng viền', icon: List },
                    { id: 'grid', name: 'Lưới ô gọn gàng', desc: 'Các ô nút chương gọn nhẹ kiểu Webtoon/Manga', icon: LayoutGrid },
                    { id: 'accordion', name: 'Gấp gọn theo Quyển', desc: 'Có thể bấm thu/mở từng Quyển hoặc Tập', icon: Folder },
                    { id: 'timeline', name: 'Dòng thời gian nghệ thuật', desc: 'Trục mốc thời gian nối dọc phát sáng theo theme', icon: GitCommit },
                    { id: 'minimal_table', name: 'Bảng phẳng tối giản', desc: 'Hàng phẳng đơn giản, cổ điển thanh lịch', icon: Table },
                    { id: 'book_catalog', name: 'Mục lục sách xuất bản', desc: 'Chấm lửng nối liền giữa tên chương và số từ', icon: Columns2 },
                    { id: 'scroll_strip', name: 'Thẻ con nhộng huy hiệu', desc: 'Các thẻ pill bo tròn mềm mại xếp cụm', icon: Tag },
                    { id: 'cards_bento', name: 'Thẻ Bento đa giác quan', desc: 'Các khối chương to nhỏ nổi bật chương đọc dở', icon: LayoutList },
                    { id: 'modern_compact', name: 'Hàng ngang số to', desc: 'Đánh số thứ tự 01, 02 nổi bật phong cách hiện đại', icon: List },
                  ].map((styleOpt) => {
                    const IconComp = styleOpt.icon;
                    const isSelected = chapterListStyle === styleOpt.id;
                    return (
                      <button
                        key={styleOpt.id}
                        type="button"
                        onClick={() => setChapterListStyle(styleOpt.id as any)}
                        className={`p-2.5 rounded border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected ? 'ring-2' : 'hover:opacity-90 opacity-75'
                        }`}
                        style={{
                          background: isSelected ? currentBtnSecondaryBg : currentBg,
                          borderColor: isSelected ? currentBtnBg : currentBorder,
                        }}
                      >
                        <div
                          className="p-1.5 rounded border shrink-0 mt-0.5"
                          style={{
                            borderColor: currentBorder,
                            backgroundColor: isSelected ? currentBtnBg : 'transparent',
                            color: isSelected ? currentBtnText : currentText,
                          }}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold block text-xs" style={{ color: currentText }}>
                            {styleOpt.name} {isSelected && '✓'}
                          </span>
                          <span className="text-[10px] leading-tight block opacity-75" style={{ color: currentTextMuted }}>
                            {styleOpt.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL THÊM / SỬA NHÂN VẬT */}
      {showCharModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div
            className="w-full max-w-md p-5 rounded-lg border shadow-2xl space-y-4"
            style={{
              background: currentCardBg,
              borderColor: currentBorder,
              color: currentText,
            }}
          >
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: currentBorder }}>
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: currentText }}>
                <Users className="w-4 h-4" />
                <span>{editingCharId ? 'Chỉnh sửa nhân vật' : 'Thêm nhân vật mới'}</span>
              </span>
              <button onClick={() => setShowCharModal(false)} className="hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Ảnh đại diện nhân vật */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                  Ảnh đại diện nhân vật:
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border overflow-hidden shrink-0 flex items-center justify-center bg-black/30 relative"
                    style={{ borderColor: currentBorder }}
                  >
                    {charAvatar ? (
                      <img src={charAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 opacity-50" style={{ color: currentTextMuted }} />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="Dán URL ảnh đại diện..."
                      value={charAvatar}
                      onChange={(e) => setCharAvatar(e.target.value)}
                      className="w-full p-2 rounded border text-xs focus:outline-none"
                      style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => charAvatarFileInputRef.current?.click()}
                        className="px-2 py-1 text-[10px] rounded border flex items-center gap-1 hover:opacity-80 transition"
                        style={{ background: currentBtnSecondaryBg, borderColor: currentBtnBorder, color: currentText }}
                      >
                        <Upload className="w-3 h-3" />
                        <span>{isCompressingCharAvatar ? 'Đang xử lý...' : 'Tải ảnh từ máy'}</span>
                      </button>
                      {charAvatar && (
                        <button
                          type="button"
                          onClick={() => setCharAvatar('')}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Xóa ảnh
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  ref={charAvatarFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCompressCharAvatar(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Tên nhân vật */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                  Tên nhân vật <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lâm Nhược Vũ"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                />
              </div>

              {/* Vai trò / Danh xưng */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                  Vai trò / Danh xưng (Tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nam chính, Nữ chính, Sư phụ, Phản diện..."
                  value={charRole}
                  onChange={(e) => setCharRole(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                />
              </div>

              {/* Mô tả nhân vật */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                  Mô tả ngắn nhân vật (Tùy chọn):
                </label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Tộc trưởng Lâm gia, sở hữu Thái Cổ Thần Thể..."
                  value={charDesc}
                  onChange={(e) => setCharDesc(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none resize-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: currentBorder }}>
              <button
                type="button"
                onClick={() => setShowCharModal(false)}
                className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
                style={{ borderColor: currentBorder, color: currentTextMuted }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveChar}
                className="px-4 py-1.5 text-xs font-bold rounded border shadow-sm flex items-center gap-1.5"
                style={{
                  background: currentBtnBg,
                  borderColor: currentBtnBorder,
                  color: currentBtnText,
                }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lưu nhân vật</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NHẬP LINK ẢNH BÌA */}
      {showCoverUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div
            className="w-full max-w-md p-5 rounded-lg border shadow-2xl space-y-4"
            style={{
              background: currentCardBg,
              borderColor: currentBorder,
              color: currentText,
            }}
          >
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: currentBorder }}>
              <span className="text-xs font-bold uppercase tracking-wider">Dán liên kết ảnh bìa trực tiếp</span>
              <button onClick={() => setShowCoverUrlModal(false)} className="hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold" style={{ color: currentText }}>Đường dẫn ảnh (URL):</label>
              <input
                type="text"
                placeholder="https://example.com/cover.jpg"
                value={tempCoverUrl}
                onChange={(e) => setTempCoverUrl(e.target.value)}
                className="w-full p-2.5 rounded border text-xs focus:outline-none"
                style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCoverUrlModal(false)}
                className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
                style={{ borderColor: currentBorder, color: currentTextMuted }}
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (tempCoverUrl.trim()) {
                    setCoverUrl(tempCoverUrl.trim());
                  }
                  setShowCoverUrlModal(false);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded border shadow-sm"
                style={{
                  background: currentBtnBg,
                  borderColor: currentBtnBorder,
                  color: currentBtnText,
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN INTERACTIVE STORY PAGE CONTAINER */}
      <main className={`max-w-4xl mx-auto px-4 py-6 space-y-6 ${customBodyFont}`}>
        {/* Helper Banner */}
        <div
          className="p-3.5 rounded-lg border text-xs flex items-center justify-between gap-3 font-mono shadow-sm"
          style={{
            background: currentCardBg,
            borderColor: currentBorder,
            color: currentText,
          }}
        >
          <span className="font-medium">Bạn có thể nhấp chuột trực tiếp vào Tên truyện, Tác giả, Ảnh bìa, Giới thiệu hoặc Tag bên dưới để chỉnh sửa ngay tại chỗ.</span>
          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab ? null : 'theme')}
            className="shrink-0 px-3 py-1.5 text-[11px] font-bold rounded border hover:opacity-90 transition shadow-xs"
            style={{
              background: currentBtnBg,
              borderColor: currentBtnBorder,
              color: currentBtnText,
            }}
          >
            Mở bảng thiết kế
          </button>
        </div>

        {/* CHAPTER EDITOR VIEW VS STORY PAGE VIEW */}
        {editingChapterItem !== null ? (
          <div className="space-y-6 font-mono text-xs">
            {/* Top Action Header */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border font-mono shadow-sm" style={{ background: currentCardBg, borderColor: currentBorder }}>
              <button
                type="button"
                onClick={() => setEditingChapterItem(null)}
                className="px-3 py-1.5 text-xs font-bold rounded border flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer"
                style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại trang truyện</span>
              </button>
              <div className="text-xs sm:text-sm font-bold truncate max-w-xs sm:max-w-md" style={{ color: currentText }}>
                Sửa chương {editingChapterItem.chapterNumber}: {chapterTitleInput || '(Chưa có tiêu đề)'}
              </div>
              <button
                type="button"
                onClick={handleSaveChapterItem}
                className="px-4 py-1.5 text-xs font-bold uppercase rounded border shadow-sm flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer"
                style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
              >
                <Check className="w-4 h-4" />
                <span>Lưu chương</span>
              </button>
            </div>

            {/* LIVE CHAPTER READER PREVIEW */}
            <article
              className="p-6 sm:p-8 space-y-6 relative transition-all duration-200 shadow-xl rounded"
              style={{
                background: currentCardBg,
                ...getStoryBorderStyle(currentBorderObj, currentBorder),
              }}
            >
              <StoryCornerAccents accent={activeBCorner} borderStyle={currentBorderObj?.borderStyle} color={currentBorder} />

              {/* Header: Chapter title, volume, author/editor, word count */}
              <div className="text-center space-y-2 pb-5 border-b border-dashed" style={{ borderColor: currentBorder }}>
                {chapterVolumeTitleInput && (
                  <span className={`text-xs font-bold uppercase tracking-widest block ${customMutedFont}`} style={{ color: currentTextMuted }}>
                    {chapterVolumeTitleInput}
                  </span>
                )}
                <h2 className={`text-2xl sm:text-3xl font-bold tracking-wide leading-snug ${customTitleFont}`} style={{ color: currentText }}>
                  {chapterTitleInput || `Chương ${editingChapterItem.chapterNumber}`}
                </h2>
                <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-mono ${customMutedFont}`} style={{ color: currentTextMuted }}>
                  <span>Người đăng: {editorName}</span>
                  <span>•</span>
                  <span>{(chapterContentInput.match(/\S+/g) || []).length} chữ</span>
                  {isChapterLockedInput && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> {chapterUnlockPriceInput} Chucu</span>
                    </>
                  )}
                  {isChapterPasswordProtectedInput && (
                    <>
                      <span>•</span>
                      <span className="text-rose-400 font-bold flex items-center gap-1"><Key className="w-3 h-3" /> Có Pass</span>
                    </>
                  )}
                </div>
              </div>

              {/* Chapter Content Live Reading */}
              <div className={`space-y-4 text-base leading-relaxed whitespace-pre-line ${customBodyFont}`} style={{ color: currentText }}>
                {chapterContentInput.trim() ? (
                  chapterContentInput
                ) : (
                  <span className="italic opacity-50 block text-center py-6">(Chưa có nội dung chữ. Nhập nội dung ở khung bên dưới để xem trực tiếp...)</span>
                )}
              </div>
            </article>

            {/* INTERACTIVE CHAPTER EDITING PANEL */}
            <div className="p-5 sm:p-6 rounded border space-y-5 font-mono text-xs shadow-md" style={{ background: currentCardBg, borderColor: currentBorder }}>
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 pb-2 border-b" style={{ borderColor: currentBorder, color: currentText }}>
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>Nội dung & Thông tin chương</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold block" style={{ color: currentText }}>Tiêu đề chương *</label>
                  <input
                    type="text"
                    value={chapterTitleInput}
                    onChange={(e) => setChapterTitleInput(e.target.value)}
                    placeholder="Ví dụ: Chương 1: Mở đầu định mệnh"
                    className="w-full px-3 py-2 rounded border focus:outline-none"
                    style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold block" style={{ color: currentText }}>Tên phần / Quyển (Tùy chọn)</label>
                  <input
                    type="text"
                    value={chapterVolumeTitleInput}
                    onChange={(e) => setChapterVolumeTitleInput(e.target.value)}
                    placeholder="Ví dụ: Quyển 1: Khởi đầu"
                    className="w-full px-3 py-2 rounded border focus:outline-none"
                    style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-bold block" style={{ color: currentText }}>Nội dung chữ của chương *</label>
                  <span style={{ color: currentTextMuted }}>{(chapterContentInput.match(/\S+/g) || []).length} từ</span>
                </div>
                <textarea
                  rows={14}
                  value={chapterContentInput}
                  onChange={(e) => setChapterContentInput(e.target.value)}
                  placeholder="Dán hoặc gõ nội dung chương vào đây..."
                  className="w-full px-3 py-2 rounded border focus:outline-none leading-relaxed text-sm font-sans"
                  style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                />
              </div>

              {/* Lock & Pass Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: currentBorder }}>
                {/* Lock Chucu */}
                <div className="p-3.5 rounded border space-y-3" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                  <label className="flex items-center gap-2 font-bold cursor-pointer" style={{ color: currentText }}>
                    <input
                      type="checkbox"
                      checked={isChapterLockedInput}
                      onChange={(e) => setIsChapterLockedInput(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>Khóa chương bằng Chucu</span>
                  </label>
                  {isChapterLockedInput && (
                    <div className="space-y-1 pl-6">
                      <label className="block text-[11px]" style={{ color: currentTextMuted }}>Số Chucu để mở khóa chương:</label>
                      <input
                        type="number"
                        min={1}
                        value={chapterUnlockPriceInput}
                        onChange={(e) => setChapterUnlockPriceInput(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded border focus:outline-none font-bold text-amber-400 text-sm"
                        style={{ background: currentCardBg, borderColor: currentBorder }}
                      />
                    </div>
                  )}
                </div>

                {/* Password Protection */}
                <div className="p-3.5 rounded border space-y-3" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                  <label className="flex items-center gap-2 font-bold cursor-pointer" style={{ color: currentText }}>
                    <input
                      type="checkbox"
                      checked={isChapterPasswordProtectedInput}
                      onChange={(e) => setIsChapterPasswordProtectedInput(e.target.checked)}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <Key className="w-4 h-4 text-rose-500" />
                    <span>Đặt mật khẩu (Pass) cho chương</span>
                  </label>
                  {isChapterPasswordProtectedInput && (
                    <div className="space-y-2 pl-6">
                      <div>
                        <label className="block text-[11px]" style={{ color: currentTextMuted }}>Mật khẩu mở chương *:</label>
                        <input
                          type="text"
                          value={chapterPasswordInput}
                          onChange={(e) => setChapterPasswordInput(e.target.value)}
                          placeholder="Nhập mật khẩu..."
                          className="w-full px-3 py-1.5 rounded border focus:outline-none font-bold text-rose-400 text-sm"
                          style={{ background: currentCardBg, borderColor: currentBorder }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px]" style={{ color: currentTextMuted }}>Gợi ý mật khẩu (Tùy chọn):</label>
                        <input
                          type="text"
                          value={chapterPasswordHintInput}
                          onChange={(e) => setChapterPasswordHintInput(e.target.value)}
                          placeholder="VD: Ngày sinh tác giả"
                          className="w-full px-3 py-1.5 rounded border focus:outline-none text-xs"
                          style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Separate Chapter Theme & Effects Toggle */}
              <div className="pt-3 border-t space-y-3" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="flex items-center gap-2 font-bold cursor-pointer" style={{ color: currentText }}>
                    <input
                      type="checkbox"
                      checked={useSeparateChapterTheme}
                      onChange={(e) => {
                        setUseSeparateChapterTheme(e.target.checked);
                        setUseSeparateChapterEffect(e.target.checked);
                      }}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <Palette className="w-4 h-4 text-emerald-500" />
                    <span>Thiết kế giao diện & hiệu ứng riêng cho chương này (Des giao diện)</span>
                  </label>
                  {useSeparateChapterTheme && (
                    <button
                      type="button"
                      onClick={() => setActiveDrawerTab(activeDrawerTab ? null : 'theme')}
                      className="px-3 py-1 text-[11px] font-bold rounded border hover:opacity-90 transition cursor-pointer"
                      style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                    >
                      Mở bảng Des giao diện chương
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Actions inside Chapter Editor */}
              <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: currentBorder }}>
                <button
                  type="button"
                  onClick={() => setEditingChapterItem(null)}
                  className="px-4 py-2 rounded border hover:opacity-80 transition cursor-pointer"
                  style={{ borderColor: currentBorder, color: currentTextMuted }}
                >
                  ← Trở về trang truyện
                </button>
                <button
                  type="button"
                  onClick={handleSaveChapterItem}
                  className="px-6 py-2 font-bold uppercase rounded border shadow hover:opacity-90 transition flex items-center gap-2 cursor-pointer"
                  style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu chương</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <article
            className="p-6 space-y-6 relative transition-all duration-200"
            style={{
              background: currentCardBg,
              ...getStoryBorderStyle(currentBorderObj, currentBorder),
            }}
          >
            {/* Corner Accents */}
            <StoryCornerAccents accent={activeBCorner} borderStyle={currentBorderObj?.borderStyle} color={currentBorder} />

          <div className="grid grid-cols-1 sm:grid-cols-[224px_1fr] gap-6 items-start">
            {/* LEFT COLUMN: COVER & EDITOR INFO & TAGS */}
            <div className="order-1 sm:col-start-1 sm:row-start-1 sm:row-span-2 w-full max-w-[224px] sm:max-w-none mx-auto sm:mx-0 shrink-0 flex flex-col gap-4">
              {/* 1. INTERACTIVE COVER BOX */}
              <div
                className="w-full aspect-[3/4] overflow-hidden flex flex-col justify-center items-center relative group rounded cursor-pointer transition-all"
                style={{
                  background: currentBtnSecondaryBg,
                  ...getStoryBorderStyle(
                    {
                      borderStyle: 'solid',
                      borderWidth: 'thin',
                      borderRadius,
                      borderGlow: 'none',
                    },
                    currentBorder
                  ),
                }}
              >
                {coverUrl ? (
                  <>
                    <img
                      src={coverUrl}
                      alt={title || 'Bìa truyện'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 p-3 transition-opacity duration-200 font-mono">
                      <button
                        onClick={() => coverFileInputRef.current?.click()}
                        className="w-full py-1.5 px-2 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] flex items-center justify-center gap-1.5 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh mới</span>
                      </button>
                      <button
                        onClick={() => {
                          setTempCoverUrl(coverUrl);
                          setShowCoverUrlModal(true);
                        }}
                        className="w-full py-1.5 px-2 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] flex items-center justify-center gap-1.5 transition"
                      >
                        <Link className="w-3.5 h-3.5" />
                        <span>Dán link ảnh</span>
                      </button>
                      <button
                        onClick={() => setCoverUrl('')}
                        className="w-full py-1 px-2 bg-red-900/60 hover:bg-red-800 text-red-200 rounded text-[10px] transition"
                      >
                        Xóa ảnh bìa
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center space-y-2.5 font-mono">
                    <Upload className="w-8 h-8 mx-auto opacity-60" style={{ color: currentTextMuted }} />
                    <p className="text-xs font-bold leading-tight" style={{ color: currentText }}>
                      Chưa có ảnh bìa
                    </p>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <button
                        onClick={() => coverFileInputRef.current?.click()}
                        disabled={isCompressingCover}
                        className="py-1 px-2.5 rounded border text-[11px] font-bold hover:opacity-90 transition flex items-center justify-center gap-1"
                        style={{
                          background: currentBtnBg,
                          borderColor: currentBtnBorder,
                          color: currentBtnText,
                        }}
                      >
                        <Upload className="w-3 h-3" />
                        <span>{isCompressingCover ? 'Đang nén...' : 'Tải ảnh từ máy'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setTempCoverUrl('');
                          setShowCoverUrlModal(true);
                        }}
                        className="py-1 px-2.5 rounded border text-[10px] hover:opacity-90 transition flex items-center justify-center gap-1"
                        style={{
                          background: currentBtnSecondaryBg,
                          borderColor: currentBtnBorder,
                          color: currentText,
                        }}
                      >
                        <Link className="w-3 h-3" />
                        <span>Dán URL ảnh</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. EDITOR INFO + ACTION BUTTONS PREVIEW + TAGS */}
              <div className="w-full flex flex-col gap-3.5">
                {/* Editor Box */}
                <div
                  className="p-2.5 flex items-center gap-2.5 rounded transition relative group"
                  style={{
                    background: currentBtnSecondaryBg,
                    ...getStoryBorderStyle(
                      {
                        borderStyle: 'solid',
                        borderWidth: 'thin',
                        borderRadius,
                        borderGlow: 'none',
                      },
                      currentBorder
                    ),
                  }}
                >
                  {/* Editor Avatar */}
                  <div
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="w-9 h-9 rounded-full border overflow-hidden shrink-0 flex items-center justify-center cursor-pointer relative group/avatar"
                    style={{ borderColor: currentBorder, background: currentCardBg }}
                    title="Nhấp để đổi ảnh đại diện Editor"
                  >
                    {editorPhoto ? (
                      <img src={editorPhoto} alt={editorName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" style={{ color: currentTextMuted }} />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition">
                      <Upload className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Editor Name Input */}
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wider block opacity-70 font-mono" style={{ color: currentTextMuted }}>
                      Người đăng / Editor:
                    </span>
                    <input
                      type="text"
                      value={editorName}
                      onChange={(e) => setEditorName(e.target.value)}
                      className="w-full text-xs font-bold bg-transparent border-b border-dashed focus:outline-none truncate"
                      style={{ borderColor: currentBorder, color: currentText }}
                    />
                  </div>
                </div>

                {/* Preview Action Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    className={`w-full py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs cursor-default ${customBtnFont}`}
                    style={{
                      background: currentBtnBg,
                      color: currentBtnText,
                      ...getStoryButtonBorderStyle(
                        {
                          borderStyle,
                          borderRadius,
                        },
                        currentBtnBorder
                      ),
                    }}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Đọc từ đầu (Demo)</span>
                  </button>

                  <button
                    type="button"
                    className={`w-full py-2 px-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-default ${customBtnFont}`}
                    style={{
                      background: currentBtnSecondaryBg,
                      color: currentText,
                      ...getStoryButtonBorderStyle(
                        {
                          borderStyle,
                          borderRadius,
                        },
                        currentBorder
                      ),
                    }}
                  >
                    <Bookmark className="w-4 h-4 shrink-0" />
                    <span>Lưu truyện (Demo)</span>
                  </button>
                </div>

                {/* Tags Section */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase tracking-wider block opacity-75 font-mono" style={{ color: currentTextMuted }}>
                    Thể loại & Thẻ tag (Tags):
                  </span>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 leading-tight flex items-center gap-1 rounded-xs group ${customBtnFont}`}
                        style={{
                          background: currentBtnSecondaryBg,
                          color: currentTextMuted,
                          ...getStoryBorderStyle(
                            {
                              borderStyle: 'solid',
                              borderWidth: 'thin',
                              borderRadius,
                              borderGlow: 'none',
                            },
                            currentBorder
                          ),
                        }}
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400 opacity-60 group-hover:opacity-100 transition"
                          title="Xóa tag này"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Input Add Tag */}
                  <div className="flex items-center gap-1 mt-1 font-mono">
                    <input
                      type="text"
                      placeholder="Thêm tag (cách nhau bởi dấu phẩy)..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-2 py-1 bg-transparent rounded border border-dashed hover:border-solid focus:border-solid transition-all text-[11px] focus:outline-none"
                      style={{ borderColor: currentBorder, color: currentText }}
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-2 py-1 rounded border text-[11px] hover:opacity-80 transition"
                      style={{
                        background: currentBtnSecondaryBg,
                        borderColor: currentBtnBorder,
                        color: currentText,
                      }}
                      title="Thêm tag"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Character Info Widget (nằm dưới Tag) */}
                <div className="pt-2 border-t border-dashed space-y-2" style={{ borderColor: currentBorder }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-mono font-bold flex items-center gap-1" style={{ color: currentTextMuted }}>
                      <Users className="w-3 h-3" />
                      <span>Widget Nhân vật:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCharacterWidget(!showCharacterWidget)}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition ${
                        showCharacterWidget ? '' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={showCharacterWidget ? { backgroundColor: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText } : { borderColor: currentBorder, color: currentTextMuted }}
                    >
                      {showCharacterWidget ? '✓ Đang bật Widget' : '+ Bật Widget'}
                    </button>
                  </div>

                  {showCharacterWidget && (
                    <div
                      className="p-2.5 space-y-2 rounded transition font-mono"
                      style={{
                        background: currentBtnSecondaryBg,
                        ...getStoryBorderStyle(
                          {
                            borderStyle: 'solid',
                            borderWidth: 'thin',
                            borderRadius,
                            borderGlow: 'none',
                          },
                          currentBorder
                        ),
                      }}
                    >
                      <div className="flex items-center justify-between border-b pb-1" style={{ borderColor: currentBorder }}>
                        <div className="flex items-center gap-1 flex-1 min-w-0 pr-2">
                          <Users className="w-3 h-3 shrink-0" style={{ color: currentText }} />
                          <input
                            type="text"
                            value={characterWidgetTitle}
                            onChange={(e) => setCharacterWidgetTitle(e.target.value)}
                            placeholder="Tiêu đề widget..."
                            className="text-[11px] font-bold bg-transparent border-b border-dashed focus:outline-none w-full"
                            style={{ borderColor: currentBorder, color: currentText }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenAddChar}
                          className="px-1.5 py-0.5 text-[10px] font-bold rounded border flex items-center gap-0.5 hover:opacity-80 shrink-0"
                          style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                          title="Thêm nhân vật mới"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Thêm</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                        {characters.length === 0 ? (
                          <p className="text-[10px] italic text-center py-2 opacity-70" style={{ color: currentTextMuted }}>
                            Chưa có nhân vật nào. Nhấp "+ Thêm" để tạo nhân vật.
                          </p>
                        ) : (
                          characters.map((char) => (
                            <div key={char.id} className="flex items-start gap-2 text-[11px] group/char">
                              <div
                                className="w-7 h-7 rounded-full border shrink-0 overflow-hidden flex items-center justify-center bg-black/20"
                                style={{ borderColor: currentBorder }}
                              >
                                {char.avatarUrl ? (
                                  <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-3.5 h-3.5 opacity-60" style={{ color: currentText }} />
                                )}
                              </div>
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="font-bold" style={{ color: currentText }}>
                                    {char.name}
                                  </span>
                                  {char.role && (
                                    <span
                                      className="text-[9px] px-1 py-0.1 rounded font-mono"
                                      style={{ background: currentBtnBg, color: currentBtnText }}
                                    >
                                      {char.role}
                                    </span>
                                  )}
                                </div>
                                {char.description && (
                                  <p className="text-[10px] leading-tight opacity-75" style={{ color: currentTextMuted }}>
                                    {char.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-0.5 opacity-60 group-hover/char:opacity-100 transition shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditChar(char)}
                                  className="p-0.5 hover:text-blue-400"
                                  title="Sửa"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteChar(char.id)}
                                  className="p-0.5 hover:text-red-400"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. TITLE + METADATA + SYNOPSIS (EDITABLE DIRECTLY) */}
            <div className="order-2 sm:col-start-2 sm:row-start-1 sm:row-span-2 space-y-4">
              {/* Title Input */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider block opacity-70" style={{ color: currentTextMuted }}>
                  Tên truyện (Nhấp để sửa trực tiếp):
                </span>
                <input
                  type="text"
                  placeholder="Nhập tên truyện tại đây..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-2.5 bg-transparent rounded border border-dashed hover:border-solid focus:border-solid transition-all font-bold tracking-[0.02em] focus:outline-none focus:ring-1 ${customTitleFont}`}
                  style={{
                    borderColor: currentBorder,
                    color: currentText,
                    fontSize: titleFontSize,
                  }}
                />
              </div>

              {/* Author & Stats Box */}
              <div
                className={`text-xs space-y-2 border-b pb-3.5 ${customMutedFont}`}
                style={{ borderColor: currentBorder, color: currentTextMuted }}
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0 font-medium">Tác giả:</span>
                  <input
                    type="text"
                    placeholder="Tên tác giả..."
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="flex-1 px-2 py-1 bg-transparent rounded border border-dashed hover:border-solid focus:border-solid transition-all text-xs font-semibold focus:outline-none"
                    style={{ borderColor: currentBorder, color: currentText }}
                  />
                </div>
                <div className="flex items-center gap-4 text-[11px] opacity-75 font-mono">
                  <p>Ngày tạo: <span>{initialStory?.createdAt || new Date().toISOString().split('T')[0]}</span></p>
                  <p>Lượt xem: <span>{initialStory?.viewsCount || 0}</span></p>
                </div>
              </div>

              {/* Synopsis Editable Box */}
              <div className="space-y-1.5">
                <span className={`text-xs font-bold uppercase tracking-wider block ${customBodyFont}`} style={{ color: currentTextMuted }}>
                  Giới thiệu truyện (Nhấp để sửa):
                </span>
                <textarea
                  rows={7}
                  placeholder="Nhập phần tóm tắt, trích đoạn hoặc giới thiệu nội dung cuốn hút của bộ truyện..."
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className={`w-full p-3 bg-transparent rounded border border-dashed hover:border-solid focus:border-solid transition-all leading-relaxed focus:outline-none focus:ring-1 resize-y ${customBodyFont}`}
                  style={{
                    borderColor: currentBorder,
                    color: currentText,
                    fontSize: bodyFontSize,
                  }}
                />
              </div>

              {/* Progress Widget Preview / Editable under Synopsis */}
              <div className="pt-2 border-t border-dashed space-y-2 font-mono" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: currentTextMuted }}>
                    <TrendingUp className="w-3 h-3" />
                    <span>Widget Tiến độ bộ truyện:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowProgressWidget(!showProgressWidget)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border transition ${
                      showProgressWidget ? '' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={showProgressWidget ? { backgroundColor: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText } : { borderColor: currentBorder, color: currentTextMuted }}
                  >
                    {showProgressWidget ? '✓ Đang bật Widget' : '+ Bật Widget'}
                  </button>
                </div>

                {showProgressWidget && (
                  <div
                    className="p-3 space-y-2.5 rounded transition"
                    style={{
                      background: currentBtnSecondaryBg,
                      ...getStoryBorderStyle(
                        {
                          borderStyle: 'solid',
                          borderWidth: 'thin',
                          borderRadius,
                          borderGlow: 'none',
                        },
                        currentBorder
                      ),
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <TrendingUp className="w-3.5 h-3.5 shrink-0" style={{ color: currentText }} />
                        <input
                          type="text"
                          value={progressWidgetTitle}
                          onChange={(e) => setProgressWidgetTitle(e.target.value)}
                          placeholder="Tiêu đề widget..."
                          className="text-xs font-bold bg-transparent border-b border-dashed focus:outline-none w-full"
                          style={{ borderColor: currentBorder, color: currentText }}
                        />
                      </div>
                      <span className="text-xs font-bold font-mono shrink-0" style={{ color: currentText }}>
                        {totalPlannedChapters > 0
                          ? `${Math.min(100, Math.round(((initialStory?.chapterCount || 0) / totalPlannedChapters) * 100))}%`
                          : '0%'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full overflow-hidden bg-black/20 border" style={{ borderColor: currentBorder }}>
                      <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{
                          width: `${totalPlannedChapters > 0
                            ? Math.min(100, Math.round(((initialStory?.chapterCount || 0) / totalPlannedChapters) * 100))
                            : 0}%`,
                          background: currentBtnBg || currentBorder,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] gap-2 flex-wrap" style={{ color: currentTextMuted }}>
                      <span>Tiến độ:</span>
                      <div className="flex items-center gap-1 font-mono">
                        <strong style={{ color: currentText }}>{initialStory?.chapterCount || 0}</strong>
                        <span>/</span>
                        <input
                          type="number"
                          min="1"
                          value={totalPlannedChapters || ''}
                          onChange={(e) => setTotalPlannedChapters(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="Tổng..."
                          className="w-14 p-0.5 bg-transparent rounded border border-dashed text-xs text-center font-bold focus:outline-none"
                          style={{ borderColor: currentBorder, color: currentText }}
                        />
                        <span>chương</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* LIVE CHAPTER LIST & MANAGEMENT IN STORY PAGE */}
              <div className="space-y-3 pt-4 border-t font-mono" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${customBodyFont}`} style={{ color: currentText }}>
                      <BookOpen className="w-4 h-4 opacity-80" />
                      <span>Danh sách chương ({storyChapters.length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleOpenCreateNewChapter()}
                      className="px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1 transition shadow-xs hover:opacity-90 cursor-pointer"
                      style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm chương mới</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCreateNewChapter('Quyển 1: ...')}
                      className="px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1 transition shadow-xs hover:opacity-90 cursor-pointer"
                      style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                    >
                      <Folder className="w-3.5 h-3.5" />
                      <span>Ngắt phần/quyển</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBulkUploading(true)}
                      className="px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1 transition shadow-xs hover:opacity-90 cursor-pointer"
                      style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Tải file tổng</span>
                    </button>
                  </div>

                  {/* Quick Layout Style Switcher */}
                  <div className="flex items-center gap-1 p-0.5 rounded border flex-wrap" style={{ borderColor: currentBorder, background: currentBg }}>
                    {[
                      { id: 'standard', label: 'Thẻ', icon: List },
                      { id: 'grid', label: 'Lưới', icon: LayoutGrid },
                      { id: 'accordion', label: 'Quyển', icon: Folder },
                      { id: 'timeline', label: 'Mốc dọc', icon: GitCommit },
                      { id: 'minimal_table', label: 'Bảng', icon: Table },
                      { id: 'book_catalog', label: 'Mục lục', icon: Columns2 },
                      { id: 'scroll_strip', label: 'Huy hiệu', icon: Tag },
                      { id: 'cards_bento', label: 'Bento', icon: LayoutList },
                      { id: 'modern_compact', label: 'Số to', icon: FileText },
                    ].map((st) => {
                      const IconC = st.icon;
                      const active = chapterListStyle === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setChapterListStyle(st.id as any)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 transition cursor-pointer ${
                            active ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={active ? { backgroundColor: currentBtnBg, color: currentBtnText } : { color: currentText }}
                          title={`Kiểu ${st.label}`}
                        >
                          <IconC className="w-3 h-3" />
                          <span>{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* REAL CHAPTERS LIST RENDER */}
                {storyChapters.length === 0 ? (
                  <div className="p-8 text-center rounded border space-y-3" style={{ background: currentCardBg, borderColor: currentBorder }}>
                    <BookOpen className="w-8 h-8 mx-auto opacity-50" style={{ color: currentTextMuted }} />
                    <p className="text-sm font-medium" style={{ color: currentText }}>Chưa có chương nào trong bộ truyện này.</p>
                    <p className="text-xs" style={{ color: currentTextMuted }}>Bấm nút "+ Thêm chương mới" hoặc "Tải file tổng" ở trên để tạo chương đầu tiên!</p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCreateNewChapter()}
                        className="px-4 py-2 rounded border text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90 cursor-pointer"
                        style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Thêm chương 1</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsBulkUploading(true)}
                        className="px-4 py-2 rounded border text-xs font-bold flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                        style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Tải file tổng</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {storyChapters.map((chap) => (
                      <div
                        key={chap.id}
                        className="p-3 rounded border flex items-center justify-between gap-3 transition hover:opacity-95 group shadow-xs"
                        style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}
                      >
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleOpenEditChapterItem(chap)}
                        >
                          {chap.volumeTitle && (
                            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70" style={{ color: currentTextMuted }}>
                              {chap.volumeTitle}
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs truncate" style={{ color: currentText }}>
                              {chap.title || `Chương ${chap.chapterNumber}`}
                            </span>
                            {chap.isLocked && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> {chap.unlockPrice || 1}
                              </span>
                            )}
                            {chap.isPasswordProtected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-0.5">
                                <Key className="w-2.5 h-2.5" /> Pass
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono opacity-65 flex items-center gap-2 mt-0.5" style={{ color: currentTextMuted }}>
                            <span>{(chap.content || '').match(/\S+/g)?.length || 0} từ</span>
                            <span>•</span>
                            <span>Cập nhật: {chap.updatedAt || chap.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditChapterItem(chap)}
                            className="px-2.5 py-1 text-xs font-bold rounded border flex items-center gap-1 hover:opacity-80 transition cursor-pointer"
                            style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa chương</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setChapterToDeleteItem(chap)}
                            className="p-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition cursor-pointer"
                            title="Xóa chương này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      )}

        {/* BOTTOM FLOATING SAVE BAR */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t font-mono" style={{ borderColor: currentBorder }}>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs rounded border hover:opacity-80 transition"
            style={{
              borderColor: currentBorder,
              color: currentTextMuted,
            }}
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-xs font-bold uppercase tracking-wider rounded border shadow-lg hover:opacity-90 active:scale-95 transition flex items-center gap-2"
            style={{
              background: currentBtnBg,
              borderColor: currentBtnBorder,
              color: currentBtnText,
            }}
          >
            <Check className="w-4 h-4" />
            <span>{initialStory ? 'Cập nhật truyện' : 'Hoàn tất & Đăng truyện'}</span>
          </button>
        </div>
      </main>

      {/* BULK CHAPTER UPLOAD MODAL */}
      {isBulkUploading && (
        <BulkChapterModal
          story={{
            id: workingStoryId,
            title: title || 'Truyện mới',
            author: author,
            coverUrl: coverUrl,
            synopsis: synopsis,
            tags: tags,
            viewsCount: initialStory?.viewsCount || 0,
            createdAt: initialStory?.createdAt || new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
          }}
          existingChapters={chapters || []}
          onClose={() => setIsBulkUploading(false)}
          onSaveBatch={async (importedChapters) => {
            if (onSaveBatchChapters && importedChapters.length > 0) {
              await onSaveBatchChapters(importedChapters);
            }
            setIsBulkUploading(false);
          }}
        />
      )}

      {/* DELETE CHAPTER CONFIRMATION MODAL */}
      {chapterToDeleteItem && (
        <div className="fixed inset-[#0000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div
            className="w-full max-w-sm p-5 rounded-lg border space-y-4 shadow-xl font-mono"
            style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">Xác nhận xóa chương</h3>
            <p className="text-xs">
              Bạn có chắc chắn muốn xóa chương <strong className="underline">{chapterToDeleteItem.title || `Chương ${chapterToDeleteItem.chapterNumber}`}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChapterToDeleteItem(null)}
                className="px-3 py-1.5 text-xs rounded border hover:opacity-80 cursor-pointer"
                style={{ borderColor: currentBorder, color: currentTextMuted }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteChapter && chapterToDeleteItem) {
                    onDeleteChapter(chapterToDeleteItem.id);
                  }
                  if (editingChapterItem?.id === chapterToDeleteItem.id) {
                    setEditingChapterItem(null);
                  }
                  setChapterToDeleteItem(null);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
