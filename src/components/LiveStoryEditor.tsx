import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { saveUserFontToCloud, deleteUserFontFromCloud, getUserFontsFromCloud } from '../lib/storage';
import { getIdbFonts, saveIdbFonts, deleteIdbFont, migrateLocalStorageFonts, StoredUserFont } from '../lib/idbStorage';
import { Story, UserProfile } from '../types';
import {
  ArrowLeft,
  Check,
  Upload,
  Link,
  BookOpen,
  Bookmark,
  RotateCcw,
  User,
  Palette,
  Type,
  Square,
  Sparkles,
  Sliders,
  X,
  Plus,
  Pipette,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
  { value: 'font-lora', label: 'Lora - Cổ điển' },
  { value: 'font-garamond', label: 'EB Garamond - Cổ điển cổ kính' },
  { value: 'font-merriweather', label: 'Merriweather - Đọc truyện dài' },
  { value: 'font-playfair', label: 'Playfair Display - Nghệ thuật' },
  { value: 'font-notoserif', label: 'Noto Serif - Trang nghiêm' },
  { value: 'font-robotoslab', label: 'Roboto Slab - Khung chắc chắn' },
  { value: 'font-times', label: 'Times New Roman - Truyền thống' },
  { value: 'font-cormorant', label: 'Cormorant Garamond - Quý phái' },

  // Sans-serif
  { value: 'font-bevietnam', label: 'Be Vietnam Pro - Hiện đại Việt' },
  { value: 'font-inter', label: 'Inter - Tối giản công nghệ' },
  { value: 'font-opensans', label: 'Open Sans - Thư thái dễ nhìn' },
  { value: 'font-roboto', label: 'Roboto - Phổ thông chuẩn mực' },
  { value: 'font-montserrat', label: 'Montserrat - Sang trọng đô thị' },
  { value: 'font-nunito', label: 'Nunito - Thân thiện bo góc' },
  { value: 'font-quicksand', label: 'Quicksand - Tròn trịa dễ thương' },
  { value: 'font-mulish', label: 'Mulish - Thanh lịch nhẹ nhàng' },
  { value: 'font-notosans', label: 'Noto Sans - Trung tính hoàn hảo' },
  { value: 'font-sourcesans', label: 'Source Sans 3 - Sắc sảo rõ nét' },
  { value: 'font-worksans', label: 'Work Sans - Vững chãi rành mạch' },
  { value: 'font-sarabun', label: 'Sarabun - Trang nhã thanh lịch' },
  { value: 'font-lexend', label: 'Lexend - Siêu sạch thoáng đãng' },
  { value: 'font-comfortaa', label: 'Comfortaa - Tròn xoe đáng yêu' },
  { value: 'font-baloo', label: 'Baloo 2 - Tròn mập nhí nhố' },

  // Calligraphy & Script
  { value: 'font-charm', label: 'Charm - Bay bổng dịu dàng' },
  { value: 'font-dancing', label: 'Dancing Script - Lãng mạn mềm mại' },
  { value: 'font-pacifico', label: 'Pacifico - Phóng khoáng bãi biển' },
  { value: 'font-lobster', label: 'Lobster - Phá cách Retro' },
  { value: 'font-pattaya', label: 'Pattaya - Uốn lượn đầy đặn' },
  { value: 'font-arima', label: 'Arima - Nghệ thuật cổ trang' },

  // Comic & Handwritten
  { value: 'font-patrick', label: 'Patrick Hand - Nhật ký tự nhiên' },
  { value: 'font-itim', label: 'Itim - Hoạt họa học đường' },
  { value: 'font-sriracha', label: 'Sriracha - Nét bút lông sắc sảo' },
  { value: 'font-cabinsketch', label: 'Cabin Sketch - Nét vẽ tay phác thảo' },

  // Monospace
  { value: 'font-mono', label: 'JetBrains Mono - Lập trình viên' },
  { value: 'font-vt323', label: 'VT323 - Máy điện tử 8-bit' },
  { value: 'font-bungee', label: 'Bungee - Biển hiệu khối đậm' },
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
  onSave: (storyData: Partial<Story>) => void;
  onCancel: () => void;
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
  onSave,
  onCancel,
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

  // Styles & Theme
  const [themeTone, setThemeTone] = useState<string>(initialStory?.themeTone || 'dark-rose');
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

  // Reading Effect
  const [readingEffect, setReadingEffect] = useState<'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'ginkgo'>(
    (initialStory?.readingEffect as any) || 'none'
  );

  const [previewMode, setPreviewMode] = useState<'story' | 'chapter'>('story');

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
  const [chapterReadingEffect, setChapterReadingEffect] = useState<'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'ginkgo'>(
    (initialStory?.chapterReadingEffect as any) || 'none'
  );

  // Floating Design Drawer Tabs
  const [activeDrawerTab, setActiveDrawerTab] = useState<'theme' | 'fonts' | 'borders' | 'effects' | null>(null);
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
  const isViewingChapterTheme = useSeparateChapterTheme && previewMode === 'chapter';
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
  const isViewingChapterEffect = isSeparatedEffect && previewMode === 'chapter';
  const activeReadingEffect = isViewingChapterEffect ? chapterReadingEffect : readingEffect;

  const currentBorderObj = {
    borderStyle: activeBStyle,
    borderWidth: activeBWidth,
    borderRadius: activeBRadius,
    borderCornerAccent: activeBCorner,
    borderGlow: activeBGlow,
    customBorderColor: currentBorder,
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

  const handleSetThemeTone = (val: string) => {
    if (isViewingChapterTheme) setChapterThemeTone(val);
    else setThemeTone(val);
  };
  const handleSetBgColor = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomBgColor(val);
    else setCustomBgColor(val);
  };
  const handleSetCardBgColor = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomCardBgColor(val);
    else setCustomCardBgColor(val);
  };
  const handleSetTextColor = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomTextColor(val);
    else setCustomTextColor(val);
  };
  const handleSetTextMutedColor = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomTextMutedColor(val);
    else setCustomTextMutedColor(val);
  };
  const handleSetBorderColor = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomBorderColor(val);
    else setCustomBorderColor(val);
  };
  const handleSetBtnBgColor = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomBtnBgColor(val);
    else setCustomBtnBgColor(val);
  };
  const handleSetBtnSecondaryBgColor = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomBtnSecondaryBgColor(val);
    else setCustomBtnSecondaryBgColor(val);
  };

  const handleSetBorderStyle = (val: any) => {
    if (isViewingChapterTheme) setChapterBorderStyle(val);
    else setBorderStyle(val);
  };
  const handleSetBorderWidth = (val: any) => {
    if (isViewingChapterTheme) setChapterBorderWidth(val);
    else setBorderWidth(val);
  };
  const handleSetBorderRadius = (val: any) => {
    if (isViewingChapterTheme) setChapterBorderRadius(val);
    else setBorderRadius(val);
  };
  const handleSetBorderCornerAccent = (val: any) => {
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
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên truyện!');
      return;
    }

    onSave({
      title: title.trim(),
      author: author.trim() || 'Tác giả',
      editorName: editorName.trim() || 'Cục Nâu',
      editorPhoto: editorPhoto.trim(),
      coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
      synopsis: synopsis.trim(),
      tags: tags.length > 0 ? tags : undefined,
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
              <span>
                {activeDrawerTab === 'theme' && 'Cài đặt màu sắc & Tông nền'}
                {activeDrawerTab === 'fonts' && 'Cài đặt Font chữ'}
                {activeDrawerTab === 'borders' && 'Cài đặt Viền & Khung trang trí'}
                {activeDrawerTab === 'effects' && 'Cài đặt Hiệu ứng nền'}
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
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0 ${
                    useSeparateChapterTheme ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
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
                  {previewMode === 'story' ? (
                    <span className="text-amber-500">✍️ Thiết lập: Giao diện trang truyện</span>
                  ) : (
                    <span className="text-emerald-500">✍️ Thiết lập: Giao diện đọc chương</span>
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
            <div className="space-y-3 text-xs">
              {useSeparateChapterTheme && (
                <div className="p-2 rounded text-[10px] font-mono border text-center font-bold" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                  {previewMode === 'story' ? (
                    <span className="text-amber-500">✍️ Thiết lập viền: Giao diện trang truyện</span>
                  ) : (
                    <span className="text-emerald-500">✍️ Thiết lập viền: Giao diện đọc chương</span>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Kiểu nét viền (Stroke Style):
                </label>
                <select
                  value={activeBStyle}
                  onChange={(e) => handleSetBorderStyle(e.target.value as any)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {BORDER_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ background: currentCardBg, color: currentText }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Độ dày nét viền (Width):
                </label>
                <select
                  value={activeBWidth}
                  onChange={(e) => handleSetBorderWidth(e.target.value as any)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {BORDER_WIDTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ background: currentCardBg, color: currentText }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Bo góc viền (Radius):
                </label>
                <select
                  value={activeBRadius}
                  onChange={(e) => handleSetBorderRadius(e.target.value as any)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {BORDER_RADIUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ background: currentCardBg, color: currentText }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Họa tiết 4 góc (Corner Accents):
                </label>
                <select
                  value={activeBCorner}
                  onChange={(e) => handleSetBorderCornerAccent(e.target.value as any)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {BORDER_CORNER_ACCENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ background: currentCardBg, color: currentText }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Hiệu ứng viền (Glow / Shadow):
                </label>
                <select
                  value={activeBGlow}
                  onChange={(e) => handleSetBorderGlow(e.target.value as any)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {BORDER_GLOW_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ background: currentCardBg, color: currentText }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0 ${
                    isSeparatedEffect ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                      isSeparatedEffect ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Khi bật tách hiệu ứng: Hiển thị cả 2 bộ chọn kèm tab xem trước */}
              {isSeparatedEffect ? (
                <div className="space-y-3">
                  {/* Nút chuyển đổi nhanh preview & mục tiêu cấu hình */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded bg-black/20 border" style={{ borderColor: currentBorder }}>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('story')}
                      className={`py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                        previewMode === 'story'
                          ? 'bg-amber-600 text-white shadow'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={previewMode !== 'story' ? { color: currentText } : {}}
                    >
                      <span>Trang truyện</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('chapter')}
                      className={`py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                        previewMode === 'chapter'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={previewMode !== 'chapter' ? { color: currentText } : {}}
                    >
                      <span>Đọc chương</span>
                    </button>
                  </div>

                  {/* 1. Hiệu ứng Trang giới thiệu truyện */}
                  <div className={`p-2.5 rounded border space-y-1.5 transition-all ${
                    previewMode === 'story' ? 'ring-1 ring-amber-500/50' : 'opacity-80'
                  }`} style={{ background: currentBg, borderColor: currentBorder }}>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-amber-500">
                        Hiệu ứng Trang giới thiệu truyện:
                      </label>
                      {previewMode !== 'story' && (
                        <button
                          type="button"
                          onClick={() => setPreviewMode('story')}
                          className="text-[10px] text-amber-400 underline hover:opacity-80 font-mono"
                        >
                          Xem trước
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
                      <option value="rain" style={{ background: currentCardBg, color: currentText }}>🌧️ Mưa rơi lãng mạn (Rain)</option>
                      <option value="snow" style={{ background: currentCardBg, color: currentText }}>❄️ Tuyết rơi mùa đông (Snow)</option>
                      <option value="star" style={{ background: currentCardBg, color: currentText }}>✨ Bụi sao lấp lánh (Stars)</option>
                      <option value="leaf" style={{ background: currentCardBg, color: currentText }}>🍁 Lá phong thu rơi (Maple Leaves)</option>
                      <option value="ginkgo" style={{ background: currentCardBg, color: currentText }}>🍂 Lá bạch quả vàng rơi (Ginkgo Leaves)</option>
                      <option value="cherry_blossom" style={{ background: currentCardBg, color: currentText }}>🌸 Cánh hoa đào rơi (Cherry Blossom)</option>
                      <option value="firefly" style={{ background: currentCardBg, color: currentText }}>✨ Đom đóm bay lấp lánh (Fireflies)</option>
                      <option value="soap_bubble" style={{ background: currentCardBg, color: currentText }}>🫧 Bong bóng xà phòng (Soap Bubbles)</option>
                      <option value="glitch" style={{ background: currentCardBg, color: currentText }}>⚡ Nhiễu sóng viễn tưởng (Glitch)</option>
                    </select>
                  </div>

                  {/* 2. Hiệu ứng Trang đọc chương */}
                  <div className={`p-2.5 rounded border space-y-1.5 transition-all ${
                    previewMode === 'chapter' ? 'ring-1 ring-emerald-500/50' : 'opacity-80'
                  }`} style={{ background: currentBg, borderColor: currentBorder }}>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-emerald-500">
                        Hiệu ứng Trang đọc chương:
                      </label>
                      {previewMode !== 'chapter' && (
                        <button
                          type="button"
                          onClick={() => setPreviewMode('chapter')}
                          className="text-[10px] text-emerald-400 underline hover:opacity-80 font-mono"
                        >
                          Xem trước
                        </button>
                      )}
                    </div>
                    <select
                      value={chapterReadingEffect}
                      onChange={(e) => setChapterReadingEffect(e.target.value as any)}
                      className="w-full p-2 rounded border text-xs focus:outline-none"
                      style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                    >
                      <option value="none" style={{ background: currentCardBg, color: currentText }}>Không hiệu ứng (Tắt)</option>
                      <option value="rain" style={{ background: currentCardBg, color: currentText }}>🌧️ Mưa rơi lãng mạn (Rain)</option>
                      <option value="snow" style={{ background: currentCardBg, color: currentText }}>❄️ Tuyết rơi mùa đông (Snow)</option>
                      <option value="star" style={{ background: currentCardBg, color: currentText }}>✨ Bụi sao lấp lánh (Stars)</option>
                      <option value="leaf" style={{ background: currentCardBg, color: currentText }}>🍁 Lá phong thu rơi (Maple Leaves)</option>
                      <option value="ginkgo" style={{ background: currentCardBg, color: currentText }}>🍂 Lá bạch quả vàng rơi (Ginkgo Leaves)</option>
                      <option value="cherry_blossom" style={{ background: currentCardBg, color: currentText }}>🌸 Cánh hoa đào rơi (Cherry Blossom)</option>
                      <option value="firefly" style={{ background: currentCardBg, color: currentText }}>✨ Đom đóm bay lấp lánh (Fireflies)</option>
                      <option value="soap_bubble" style={{ background: currentCardBg, color: currentText }}>🫧 Bong bóng xà phòng (Soap Bubbles)</option>
                      <option value="glitch" style={{ background: currentCardBg, color: currentText }}>⚡ Nhiễu sóng viễn tưởng (Glitch)</option>
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
                    <option value="rain" style={{ background: currentCardBg, color: currentText }}>🌧️ Mưa rơi lãng mạn (Rain)</option>
                    <option value="snow" style={{ background: currentCardBg, color: currentText }}>❄️ Tuyết rơi mùa đông (Snow)</option>
                    <option value="star" style={{ background: currentCardBg, color: currentText }}>✨ Bụi sao lấp lánh (Stars)</option>
                    <option value="leaf" style={{ background: currentCardBg, color: currentText }}>🍁 Lá phong thu rơi (Maple Leaves)</option>
                    <option value="ginkgo" style={{ background: currentCardBg, color: currentText }}>🍂 Lá bạch quả vàng rơi (Ginkgo Leaves)</option>
                    <option value="cherry_blossom" style={{ background: currentCardBg, color: currentText }}>🌸 Cánh hoa đào rơi (Cherry Blossom)</option>
                    <option value="firefly" style={{ background: currentCardBg, color: currentText }}>✨ Đom đóm bay lấp lánh (Fireflies)</option>
                    <option value="soap_bubble" style={{ background: currentCardBg, color: currentText }}>🫧 Bong bóng xà phòng (Soap Bubbles)</option>
                    <option value="glitch" style={{ background: currentCardBg, color: currentText }}>⚡ Nhiễu sóng viễn tưởng (Glitch)</option>
                  </select>
                </div>
              )}

              <p className="text-[10px] leading-relaxed" style={{ color: currentTextMuted }}>
                Hiệu ứng rơi sẽ tự động kích hoạt ngay trên nền trang đọc và trang chi tiết của bộ truyện theo từng cài đặt riêng.
              </p>
            </div>
          )}
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
          <span className="font-medium">💡 Bạn có thể nhấp chuột trực tiếp vào Tên truyện, Tác giả, Ảnh bìa, Giới thiệu hoặc Tag bên dưới để chỉnh sửa ngay tại chỗ.</span>
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

        {/* TOGGLE CHẾ ĐỘ XEM TRƯỚC GIAO DIỆN (TRANG GIỚI THIỆU VS TRANG ĐỌC CHƯƠNG) */}
        <div className="flex items-center gap-1.5 sm:gap-4 border-b pb-1 font-mono text-xs sm:text-sm overflow-x-auto whitespace-nowrap" style={{ borderColor: currentBorder }}>
          <button
            type="button"
            onClick={() => setPreviewMode('story')}
            className={`px-3.5 py-2 font-bold uppercase tracking-wider border-b-2 transition-all duration-200 flex items-center gap-1.5 ${
              previewMode === 'story'
                ? 'border-current opacity-100 font-extrabold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: currentText }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Giao diện trang truyện</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('chapter')}
            className={`px-3.5 py-2 font-bold uppercase tracking-wider border-b-2 transition-all duration-200 flex items-center gap-1.5 ${
              previewMode === 'chapter'
                ? 'border-current opacity-100 font-extrabold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: currentText }}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Giao diện đọc chương</span>
          </button>
        </div>

        {/* LIVE ARTICLE CONTAINER OR CHAPTER PREVIEW */}
        {previewMode === 'chapter' ? (
          <article
            className="p-6 space-y-6 relative overflow-hidden transition-all duration-200 shadow-xl"
            style={{
              background: currentCardBg,
              ...getStoryBorderStyle(currentBorderObj, currentBorder),
            }}
          >
            {/* Vintage/Brackets Corner Decorators */}
            <StoryCornerAccents accent={borderCornerAccent} color={currentBorder} />

            {/* Header: Chapter title, word count, date */}
            <div className="text-center space-y-2 pb-5 border-b border-dashed" style={{ borderColor: currentBorder }}>
              <span className={`text-[11px] font-bold uppercase tracking-widest ${customMutedFont}`} style={{ color: currentTextMuted }}>
                Chương 1 (Đọc thử)
              </span>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-wide leading-snug ${customTitleFont}`} style={{ color: currentText }}>
                Đây là tiêu đề chương truyện mẫu
              </h2>
              <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-mono ${customMutedFont}`} style={{ color: currentTextMuted }}>
                <span>Người đăng: {editorName}</span>
                <span>•</span>
                <span>1,250 chữ</span>
                <span>•</span>
                <span>Vừa xong</span>
              </div>
            </div>

            {/* Mock Chapter Content Paragraphs */}
            <div className={`space-y-4 text-sm leading-relaxed ${customBodyFont}`} style={{ color: currentText }}>
              <p>
                Đây là nội dung hiển thị dòng thứ nhất của chương truyện mẫu. Bạn có thể sử dụng dòng này để kiểm tra xem phông chữ thân bài hiển thị như thế nào, khoảng cách dòng có vừa vặn và dễ đọc hay không.
              </p>
              <p>
                Đây là nội dung hiển thị dòng thứ hai của chương truyện mẫu. Màu sắc chữ, màu nền, các đường viền họa tiết trang trí và mức độ tương phản so với nền chương đọc sẽ được thể hiện trực tiếp tại đây giúp bạn dễ dàng căn chỉnh tông màu.
              </p>
              <p>
                Đây là nội dung hiển thị dòng thứ ba của chương truyện mẫu. Toàn bộ các cài đặt về phông chữ, khoảng cách lề và khung viền của chương truyện thực tế khi độc giả đọc truyện sẽ xuất hiện giống hệt như thế này.
              </p>
            </div>

            {/* Chapter Navigation controls */}
            <div className="pt-6 border-t border-dashed space-y-4" style={{ borderColor: currentBorder }}>
              <div className="flex items-center justify-between gap-2 font-mono text-xs">
                <button
                  type="button"
                  disabled
                  className="px-3.5 py-1.5 rounded border opacity-50 cursor-not-allowed transition flex items-center gap-1"
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
                  type="button"
                  className="px-4 py-1.5 rounded border font-bold transition uppercase tracking-wider"
                  style={{
                    background: currentBtnBg,
                    borderColor: currentBtnBorder,
                    color: currentBtnText,
                  }}
                >
                  Mục lục
                </button>

                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded border hover:opacity-80 transition flex items-center gap-1"
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

              {/* Back to story main link */}
              <div className="text-center font-mono">
                <button
                  type="button"
                  className="text-[11px] underline hover:opacity-80 transition"
                  style={{ color: currentTextMuted }}
                >
                  ← Trở về trang giới thiệu truyện
                </button>
              </div>
            </div>
          </article>
        ) : (
          <article
            className="p-6 space-y-6 relative overflow-hidden transition-all duration-200"
            style={{
              background: currentCardBg,
              ...getStoryBorderStyle(currentBorderObj, currentBorder),
            }}
          >
            {/* Corner Accents */}
            <StoryCornerAccents accent={borderCornerAccent} color={currentBorder} />

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
                      borderStyle,
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
                        borderStyle,
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
                              borderStyle,
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
                      placeholder="Thêm tag (VD: Ngôn tình)..."
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
    </div>
  );
};
