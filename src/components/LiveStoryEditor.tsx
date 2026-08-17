import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { saveUserFontToCloud, deleteUserFontFromCloud, getUserFontsFromCloud } from '../lib/storage';
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
    <div className="space-y-1.5 p-2 rounded border" style={{ backgroundColor: currentCardBg, borderColor: currentBorder }}>
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
            style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
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
              style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
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
              style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
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
  const [readingEffect, setReadingEffect] = useState<'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf'>(
    initialStory?.readingEffect || 'none'
  );

  // Floating Design Drawer Tabs
  const [activeDrawerTab, setActiveDrawerTab] = useState<'theme' | 'fonts' | 'borders' | 'effects' | null>(null);
  const [isCompressingCover, setIsCompressingCover] = useState(false);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);
  const [showCoverUrlModal, setShowCoverUrlModal] = useState(false);
  const [tempCoverUrl, setTempCoverUrl] = useState('');

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Custom User-Uploaded Fonts (stored in localStorage, synced with Firestore if logged in)
  const [userUploadedFonts, setUserUploadedFonts] = useState<{ value: string; label: string; styleId: string; fontData: string }[]>(() => {
    try {
      const saved = localStorage.getItem('user_uploaded_fonts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  // Sync fonts from Firestore to LocalStorage and State when user logs in
  useEffect(() => {
    const syncFontsFromCloud = async () => {
      if (!currentUser?.uid) return;
      try {
        const cloudFonts = await getUserFontsFromCloud(currentUser.uid);
        if (cloudFonts.length > 0) {
          const localSaved = localStorage.getItem('user_uploaded_fonts');
          let localFonts: { value: string; label: string; styleId: string; fontData: string }[] = [];
          try {
            localFonts = localSaved ? JSON.parse(localSaved) : [];
          } catch {}

          const merged = [...localFonts];
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
          localStorage.setItem('user_uploaded_fonts', JSON.stringify(merged));
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

  const handleUploadFontFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit size to 1.5MB for secure localStorage storage
    if (file.size > 1.5 * 1024 * 1024) {
      alert("Kích thước font quá lớn! Hãy chọn file font (.ttf, .otf, .woff, .woff2) có dung lượng dưới 1.5MB để tối ưu lưu trữ.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) return;

      const fontName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
      const fontValue = `font-user-${Date.now()}`;
      const styleId = `style-${fontValue}`;

      const newFont = {
        value: fontValue,
        label: `${fontName} (Tùy biến)`,
        styleId,
        fontData: base64Data
      };

      const updated = [...userUploadedFonts, newFont];
      setUserUploadedFonts(updated);
      localStorage.setItem('user_uploaded_fonts', JSON.stringify(updated));
      injectFontFace(newFont);

      // Lưu lên Firestore nếu người dùng đã đăng nhập
      if (currentUser?.uid) {
        try {
          await saveUserFontToCloud(currentUser.uid, newFont.label, newFont.value, newFont.fontData);
        } catch (err) {
          console.warn('[Sync Fonts] Không thể sao lưu font lên Firestore:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteUploadedFont = async (fontValue: string) => {
    const updated = userUploadedFonts.filter(f => f.value !== fontValue);
    setUserUploadedFonts(updated);
    localStorage.setItem('user_uploaded_fonts', JSON.stringify(updated));

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

  // Compute live visual tokens
  const isCustomTheme = themeTone === 'custom';
  const activePreset = PRESET_THEME_COLORS[themeTone] || PRESET_THEME_COLORS['dark-rose'];

  const currentBg = isCustomTheme ? customBgColor : activePreset.bg;
  const currentCardBg = isCustomTheme ? customCardBgColor : activePreset.cardBg;
  const currentText = isCustomTheme ? customTextColor : activePreset.text;
  const currentTextMuted = isCustomTheme ? customTextMutedColor : activePreset.textMuted;
  const currentBorder = isCustomTheme ? customBorderColor : activePreset.border;
  const currentBtnBg = isCustomTheme ? customBtnBgColor : activePreset.btnBg;
  const currentBtnSecondaryBg = isCustomTheme ? customBtnSecondaryBgColor : (activePreset.btnSecondaryBg || activePreset.btnBg);
  const currentBtnBorder = isCustomTheme ? customBorderColor : activePreset.btnBorder;
  const currentBtnText = isCustomTheme ? customTextColor : activePreset.btnText;

  // Check if background is dark for effect visibility
  const isDarkTheme = !currentBg.toLowerCase().includes('#fff') && !currentBg.toLowerCase().includes('255, 255, 255');

  const currentBorderObj = {
    borderStyle,
    borderWidth,
    borderRadius,
    borderCornerAccent,
    borderGlow,
    customBorderColor: currentBorder,
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
      customBgColor: isCustomTheme ? customBgColor : undefined,
      customCardBgColor: isCustomTheme ? customCardBgColor : undefined,
      customTextColor: isCustomTheme ? customTextColor : undefined,
      customTextMutedColor: isCustomTheme ? customTextMutedColor : undefined,
      customBorderColor: isCustomTheme ? customBorderColor : undefined,
      customBtnBgColor: isCustomTheme ? customBtnBgColor : undefined,
      customBtnSecondaryBgColor: isCustomTheme ? customBtnSecondaryBgColor : undefined,
      borderStyle,
      borderWidth,
      borderRadius,
      borderCornerAccent,
      borderGlow,
      readingEffect,
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
      {readingEffect !== 'none' && <ReadingEffects effect={readingEffect} isDarkTheme={isDarkTheme} />}

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
          backgroundColor: currentCardBg,
          borderColor: currentBorder,
          color: currentText,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded border hover:opacity-80 transition"
            style={{
              backgroundColor: currentBtnSecondaryBg,
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
              backgroundColor: currentBtnBg,
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
              backgroundColor: currentBtnSecondaryBg,
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
              backgroundColor: currentBtnSecondaryBg,
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
              backgroundColor: currentBtnSecondaryBg,
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
              backgroundColor: currentBtnSecondaryBg,
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
              backgroundColor: currentBtnBg,
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
            backgroundColor: currentCardBg,
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
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Chọn bộ màu có sẵn:
                </label>
                <select
                  value={themeTone}
                  onChange={(e) => setThemeTone(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none font-semibold"
                  style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  <optgroup label="Đơn sắc & Trầm ấm" style={{ backgroundColor: currentCardBg, color: currentText }}>
                    <option value="dark-rose" style={{ backgroundColor: currentCardBg, color: currentText }}>Dark Rose (Hồng Đen)</option>
                    <option value="classic-black" style={{ backgroundColor: currentCardBg, color: currentText }}>Classic Black (Đen Tuyến)</option>
                    <option value="dark-violet" style={{ backgroundColor: currentCardBg, color: currentText }}>Dark Violet (Tím Đêm)</option>
                    <option value="navy-blue" style={{ backgroundColor: currentCardBg, color: currentText }}>Navy Blue (Xanh Đêm)</option>
                    <option value="forest-dark" style={{ backgroundColor: currentCardBg, color: currentText }}>Forest Dark (Rừng Đêm)</option>
                    <option value="warm-coffee" style={{ backgroundColor: currentCardBg, color: currentText }}>Warm Coffee (Cà Phê Ấm)</option>
                    <option value="sepia" style={{ backgroundColor: currentCardBg, color: currentText }}>Sepia (Giấy Cổ Điển)</option>
                    <option value="emerald" style={{ backgroundColor: currentCardBg, color: currentText }}>Emerald (Xanh Ngọc Lục)</option>
                    <option value="slate" style={{ backgroundColor: currentCardBg, color: currentText }}>Slate (Xanh Đá Xám)</option>
                    <option value="cyberpunk" style={{ backgroundColor: currentCardBg, color: currentText }}>Cyberpunk (Neon Tím)</option>
                  </optgroup>
                  <optgroup label="Gradient (Chuyển sắc)" style={{ backgroundColor: currentCardBg, color: currentText }}>
                    <option value="gradient-rose" style={{ backgroundColor: currentCardBg, color: currentText }}>Gradient Rose (Hồng Đen)</option>
                    <option value="gradient-midnight" style={{ backgroundColor: currentCardBg, color: currentText }}>Gradient Midnight (Đêm Tím)</option>
                    <option value="gradient-ocean" style={{ backgroundColor: currentCardBg, color: currentText }}>Gradient Ocean (Đại Dương)</option>
                    <option value="gradient-emerald" style={{ backgroundColor: currentCardBg, color: currentText }}>Gradient Emerald (Ngọc Lục Bảo)</option>
                    <option value="gradient-sunset" style={{ backgroundColor: currentCardBg, color: currentText }}>Gradient Sunset (Hoàng Hôn)</option>
                    <option value="gradient-cyber" style={{ backgroundColor: currentCardBg, color: currentText }}>Gradient Cyber (Viễn Tưởng)</option>
                    <option value="gradient-gold" style={{ backgroundColor: currentCardBg, color: currentText }}>Gradient Gold (Hoàng Gia Vàng)</option>
                    <option value="gradient-cherry" style={{ backgroundColor: currentCardBg, color: currentText }}>Gradient Cherry (Hoa Đào)</option>
                  </optgroup>
                  <optgroup label="Tùy biến tự do" style={{ backgroundColor: currentCardBg, color: currentText }}>
                    <option value="custom" style={{ backgroundColor: currentCardBg, color: currentText }}>Tùy biến bảng màu chi tiết (Custom)</option>
                  </optgroup>
                </select>
              </div>

              {/* Chi tiết từng mã màu khi chọn Custom */}
              {isCustomTheme && (
                <div className="p-3 rounded border space-y-2.5" style={{ backgroundColor: currentBg, borderColor: currentBorder }}>
                  <div className="text-[11px] font-bold pb-1 border-b flex items-center justify-between" style={{ borderColor: currentBorder, color: currentText }}>
                    <span>Bảng mã màu tùy biến:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <LocalColorField
                      label="Màu nền chính"
                      value={customBgColor}
                      onChange={setCustomBgColor}
                      allowGradient
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu thẻ nội dung"
                      value={customCardBgColor}
                      onChange={setCustomCardBgColor}
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu nút chính"
                      value={customBtnBgColor}
                      onChange={setCustomBtnBgColor}
                      allowGradient
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu nút phụ & Ô chứa"
                      value={customBtnSecondaryBgColor}
                      onChange={setCustomBtnSecondaryBgColor}
                      allowGradient
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu chữ chính"
                      value={customTextColor}
                      onChange={setCustomTextColor}
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu chữ phụ / mờ"
                      value={customTextMutedColor}
                      onChange={setCustomTextMutedColor}
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu đường viền"
                      value={customBorderColor}
                      onChange={setCustomBorderColor}
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
              <div className="p-3 rounded-lg border space-y-2.5" style={{ backgroundColor: currentCardBg, borderColor: currentBorder }}>
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
                    onChange={handleUploadFontFile}
                    className="hidden"
                    id="user-custom-font-upload"
                  />
                  <label
                    htmlFor="user-custom-font-upload"
                    className="w-full py-1.5 px-3 bg-opacity-10 rounded border text-center font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-opacity-20 transition flex items-center justify-center gap-1.5 shadow-sm"
                    style={{
                      backgroundColor: currentBtnBg,
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
                  style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ backgroundColor: currentCardBg, color: currentText }}>
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
                  style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ backgroundColor: currentCardBg, color: currentText }}>
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
                  style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ backgroundColor: currentCardBg, color: currentText }}>
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
                  style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ backgroundColor: currentCardBg, color: currentText }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: BORDERS & FRAMES */}
          {activeDrawerTab === 'borders' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Kiểu nét viền (Stroke Style):
                </label>
                <select
                  value={borderStyle}
                  onChange={(e) => setBorderStyle(e.target.value as any)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {BORDER_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ backgroundColor: currentCardBg, color: currentText }}>
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
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(e.target.value as any)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {BORDER_WIDTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ backgroundColor: currentCardBg, color: currentText }}>
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
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value as any)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {BORDER_RADIUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ backgroundColor: currentCardBg, color: currentText }}>
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
                  value={borderCornerAccent}
                  onChange={(e) => setBorderCornerAccent(e.target.value as any)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {BORDER_CORNER_ACCENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ backgroundColor: currentCardBg, color: currentText }}>
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
                  value={borderGlow}
                  onChange={(e) => setBorderGlow(e.target.value as any)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {BORDER_GLOW_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ backgroundColor: currentCardBg, color: currentText }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: READING EFFECTS */}
          {activeDrawerTab === 'effects' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Hiệu ứng rơi / hạt nền:
                </label>
                <select
                  value={readingEffect}
                  onChange={(e) => setReadingEffect(e.target.value as any)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  <option value="none" style={{ backgroundColor: currentCardBg, color: currentText }}>Không hiệu ứng</option>
                  <option value="rain" style={{ backgroundColor: currentCardBg, color: currentText }}>Mưa rơi lãng mạn (Rain)</option>
                  <option value="snow" style={{ backgroundColor: currentCardBg, color: currentText }}>Tuyết rơi mùa đông (Snow)</option>
                  <option value="star" style={{ backgroundColor: currentCardBg, color: currentText }}>Bụi sao lấp lánh (Stars)</option>
                  <option value="leaf" style={{ backgroundColor: currentCardBg, color: currentText }}>Lá phong thu rơi (Maple Leaves)</option>
                  <option value="ginkgo" style={{ backgroundColor: currentCardBg, color: currentText }}>Lá bạch quả vàng rơi (Ginkgo Leaves)</option>
                  <option value="cherry_blossom" style={{ backgroundColor: currentCardBg, color: currentText }}>Cánh hoa đào rơi (Cherry Blossom)</option>
                  <option value="firefly" style={{ backgroundColor: currentCardBg, color: currentText }}>Đom đóm bay lấp lánh (Fireflies)</option>
                  <option value="soap_bubble" style={{ backgroundColor: currentCardBg, color: currentText }}>Bong bóng xà phòng (Soap Bubbles)</option>
                  <option value="glitch" style={{ backgroundColor: currentCardBg, color: currentText }}>Nhiễu sóng viễn tưởng (Glitch)</option>
                </select>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: currentTextMuted }}>
                Hiệu ứng rơi sẽ tự động kích hoạt ngay trên nền trang đọc và trang chi tiết của bộ truyện này.
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
              backgroundColor: currentCardBg,
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
                style={{ backgroundColor: currentBg, borderColor: currentBorder, color: currentText }}
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
                  backgroundColor: currentBtnBg,
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
            backgroundColor: currentCardBg,
            borderColor: currentBorder,
            color: currentText,
          }}
        >
          <span className="font-medium">💡 Bạn có thể nhấp chuột trực tiếp vào Tên truyện, Tác giả, Ảnh bìa, Giới thiệu hoặc Tag bên dưới để chỉnh sửa ngay tại chỗ.</span>
          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab ? null : 'theme')}
            className="shrink-0 px-3 py-1.5 text-[11px] font-bold rounded border hover:opacity-90 transition shadow-xs"
            style={{
              backgroundColor: currentBtnBg,
              borderColor: currentBtnBorder,
              color: currentBtnText,
            }}
          >
            Mở bảng thiết kế
          </button>
        </div>

        {/* LIVE ARTICLE CONTAINER */}
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
                  backgroundColor: currentBtnSecondaryBg,
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
                          backgroundColor: currentBtnBg,
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
                          backgroundColor: currentBtnSecondaryBg,
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
                    backgroundColor: currentBtnSecondaryBg,
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
                    style={{ borderColor: currentBorder, backgroundColor: currentCardBg }}
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
                      backgroundColor: currentBtnBg,
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
                      backgroundColor: currentBtnSecondaryBg,
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
                          backgroundColor: currentBtnSecondaryBg,
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
                        backgroundColor: currentBtnSecondaryBg,
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
                  className={`w-full p-2.5 bg-transparent rounded border border-dashed hover:border-solid focus:border-solid transition-all text-lg sm:text-2xl font-bold uppercase tracking-[0.05em] focus:outline-none focus:ring-1 ${customTitleFont}`}
                  style={{
                    borderColor: currentBorder,
                    color: currentText,
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
                <span className={`text-xs font-bold uppercase tracking-wider block ${customTitleFont}`} style={{ color: currentTextMuted }}>
                  Giới thiệu truyện (Nhấp để sửa):
                </span>
                <textarea
                  rows={7}
                  placeholder="Nhập phần tóm tắt, trích đoạn hoặc giới thiệu nội dung cuốn hút của bộ truyện..."
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className={`w-full p-3 bg-transparent rounded border border-dashed hover:border-solid focus:border-solid transition-all text-sm leading-relaxed focus:outline-none focus:ring-1 resize-y ${customBodyFont}`}
                  style={{
                    borderColor: currentBorder,
                    color: currentText,
                  }}
                />
              </div>
            </div>
          </div>
        </article>

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
              backgroundColor: currentBtnBg,
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
