import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { User as FirebaseUser } from 'firebase/auth';
import { Story, Chapter, UserProfile } from '../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  FileText, 
  ArrowLeft, 
  UploadCloud, 
  Layers, 
  UserCheck, 
  Lock, 
  Unlock, 
  Key, 
  Coins,
  X,
  User,
  Upload,
  Eye,
  BookOpen,
  Bookmark,
  Pipette,
  Download,
  Github,
  RefreshCw,
  Settings,
  Check
} from 'lucide-react';
import { BulkChapterModal } from './BulkChapterModal';
import { LiveStoryEditor } from './LiveStoryEditor';
import { claimStoryOwnership } from '../lib/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
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
  // Serif (Cổ điển / Trang trọng)
  { value: 'font-lora', label: 'Lora - Cổ điển' },
  { value: 'font-garamond', label: 'EB Garamond - Cổ điển cổ kính' },
  { value: 'font-merriweather', label: 'Merriweather - Đọc truyện dài' },
  { value: 'font-playfair', label: 'Playfair Display - Nghệ thuật' },
  { value: 'font-notoserif', label: 'Noto Serif - Trang nghiêm' },
  { value: 'font-robotoslab', label: 'Roboto Slab - Khung chắc chắn' },
  { value: 'font-times', label: 'Times New Roman - Truyền thống' },
  { value: 'font-cormorant', label: 'Cormorant Garamond - Quý phái' },

  // Sans-serif (Hiện đại / Sạch sẽ)
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
  { value: 'font-saira', label: 'Saira - Trang nhã thanh lịch' },
  { value: 'font-lexend', label: 'Lexend - Siêu sạch thoáng đãng' },
  { value: 'font-comfortaa', label: 'Comfortaa - Tròn xoe đáng yêu' },
  { value: 'font-baloo', label: 'Baloo 2 - Tròn mập nhí nhố' },

  // Calligraphy & Script (Bay bổng / Lãng mạn / Thư pháp)
  { value: 'font-charm', label: 'Charm - Bay bổng dịu dàng' },
  { value: 'font-dancing', label: 'Dancing Script - Lãng mạn mềm mại' },
  { value: 'font-pacifico', label: 'Pacifico - Phóng khoáng bãi biển' },
  { value: 'font-lobster', label: 'Lobster - Phá cách Retro' },
  { value: 'font-pattaya', label: 'Pattaya - Uốn lượn đầy đặn' },
  { value: 'font-arima', label: 'Arima - Nghệ thuật cổ trang' },

  // Comic & Handwritten (Truyện tranh / Bình dị)
  { value: 'font-patrick', label: 'Patrick Hand - Nhật ký tự nhiên' },
  { value: 'font-itim', label: 'Itim - Hoạt họa học đường' },
  { value: 'font-sriracha', label: 'Sriracha - Nét bút lông sắc sảo' },
  { value: 'font-pangolin', label: 'Pangolin - Nét vẽ vui tươi' },

  // Monospace & Pixel & Display (Công nghệ / Retro game)
  { value: 'font-mono', label: 'JetBrains Mono - Lập trình viên' },
  { value: 'font-inconsolata', label: 'Inconsolata - Máy chữ cổ điển' },
  { value: 'font-bungee', label: 'Bungee - Biển hiệu khối đậm' }
];

const PRESET_THEME_COLORS: Record<string, {
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
    bg: '#080406',
    cardBg: '#11090c',
    text: '#e0d0d5',
    textMuted: '#8a717a',
    border: '#2d1822',
    btnBg: '#2b1620',
    btnBorder: '#5e2f46',
    btnText: '#ffd6e2',
  },
  'sepia': {
    bg: '#f4ecd8',
    cardBg: '#fcf8ed',
    text: '#4a3525',
    textMuted: '#8c7460',
    border: '#d3c29f',
    btnBg: '#e2d5b6',
    btnBorder: '#bca883',
    btnText: '#4a3525',
  },
  'emerald': {
    bg: '#06100c',
    cardBg: '#0b1a14',
    text: '#d1e7dd',
    textMuted: '#628f7a',
    border: '#153327',
    btnBg: '#163f2d',
    btnBorder: '#2a6b4e',
    btnText: '#d1e7dd',
  },
  'slate': {
    bg: '#0f172a',
    cardBg: '#1e293b',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: '#334155',
    btnBg: '#334155',
    btnBorder: '#475569',
    btnText: '#f1f5f9',
  },
  'classic-dark': {
    bg: '#0a0a0a',
    cardBg: '#121212',
    text: '#e5e5e5',
    textMuted: '#737373',
    border: '#242424',
    btnBg: '#262626',
    btnBorder: '#404040',
    btnText: '#e5e5e5',
  },
  'gradient-rose': {
    bg: 'linear-gradient(135deg, #4a1528 0%, #230b15 50%, #0c0408 100%)',
    cardBg: '#1c0a13',
    text: '#fce7f0',
    textMuted: '#f4a6c1',
    border: '#682542',
    btnBg: '#521930',
    btnBorder: '#832e55',
    btnText: '#ffc2d4',
  },
  'gradient-midnight': {
    bg: 'linear-gradient(135deg, #2e1065 0%, #160833 50%, #080314 100%)',
    cardBg: '#170b33',
    text: '#f3e8ff',
    textMuted: '#c084fc',
    border: '#581c87',
    btnBg: '#3b1278',
    btnBorder: '#7e22ce',
    btnText: '#e9d5ff',
  },
  'gradient-ocean': {
    bg: 'linear-gradient(135deg, #0c4a6e 0%, #07273c 50%, #030d17 100%)',
    cardBg: '#081d2c',
    text: '#e0f2fe',
    textMuted: '#38bdf8',
    border: '#0284c7',
    btnBg: '#0369a1',
    btnBorder: '#38bdf8',
    btnText: '#bae6fd',
  },
  'gradient-emerald': {
    bg: 'linear-gradient(135deg, #064e3b 0%, #04291f 50%, #02120d 100%)',
    cardBg: '#082119',
    text: '#ecfdf5',
    textMuted: '#34d399',
    border: '#059669',
    btnBg: '#047857',
    btnBorder: '#10b981',
    btnText: '#a7f3d0',
  },
  'gradient-sunset': {
    bg: 'linear-gradient(135deg, #681212 0%, #3b0914 50%, #120307 100%)',
    cardBg: '#24080e',
    text: '#fff1f2',
    textMuted: '#fb7185',
    border: '#9f1239',
    btnBg: '#881337',
    btnBorder: '#e11d48',
    btnText: '#fecdd3',
  },
  'gradient-cyber': {
    bg: 'linear-gradient(135deg, #581c87 0%, #2e0854 50%, #100220 100%)',
    cardBg: '#210638',
    text: '#fae8ff',
    textMuted: '#e879f9',
    border: '#a21caf',
    btnBg: '#7e22ce',
    btnBorder: '#c084fc',
    btnText: '#f5d0fe',
  },
};

interface StudioManagerProps {
  stories: Story[];
  chapters: Chapter[];
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  isAdmin?: boolean;
  onSaveStory: (story: Story) => void;
  onDeleteStory: (storyId: string) => void;
  onSaveChapter: (chapter: Chapter) => void;
  onSaveBatchChapters?: (chapters: Chapter[]) => Promise<void>;
  onDeleteChapter: (chapterId: string, storyId: string) => void;
  onSelectStoryForDetail: (story: Story) => void;
}

// Helper function to compress cover images to prevent exceeding Firestore's 1MB document size limit
const compressImage = (file: File, maxWidth = 600, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as jpeg with 0.85 quality to keep it ultra sharp while dramatically reducing size (to ~100KB)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve('');
      };
    };
    reader.onerror = () => {
      resolve('');
    };
  });
};

interface ColorPickerSwatchProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  onToggleOpen?: (open: boolean) => void;
}

const ColorPickerSwatch: React.FC<ColorPickerSwatchProps> = ({ color, onChange, label, onToggleOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onToggleOpen) onToggleOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggleOpen]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (onToggleOpen) onToggleOpen(nextState);
  };

  const handleEyedropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          onChange(result.sRGBHex);
        }
      } catch {
        // User canceled eyedropper
      }
    } else {
      nativeInputRef.current?.click();
    }
  };

  const validHex = color && color.startsWith('#') ? color : '#080406';

  return (
    <div className="relative inline-block w-full" ref={popoverRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full h-8 px-2 py-1 rounded-xs border border-[#4d2138] hover:border-[#a8446b] cursor-pointer bg-[#12060b] hover:bg-[#1b0a12] flex items-center gap-2 transition-colors min-w-0"
        title="Bấm để chọn màu"
      >
        <div
          className="w-5 h-5 rounded-2xs border border-[#ffffff33] shrink-0"
          style={{ background: validHex }}
        />
        <span className="text-[11px] text-[#ffc2d4] font-mono-code font-bold truncate flex-1 text-left">
          {label ? `${label}` : validHex}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 p-2.5 bg-[#180a12] border border-[#542438] rounded-sm shadow-2xl space-y-2 left-0 min-w-[210px]">
          <HexColorPicker color={validHex} onChange={onChange} />
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#3b1f2d]">
            <button
              type="button"
              onClick={handleEyedropper}
              className="p-1.5 bg-[#25101b] border border-[#4d2138] hover:border-[#a8446b] hover:bg-[#341525] text-[#ffc2d4] rounded-xs flex items-center gap-1 shrink-0 transition-colors"
              title="Chấm lấy màu trên màn hình (Eyedropper)"
            >
              <Pipette className="w-3.5 h-3.5 text-[#ffc2d4]" />
            </button>
            <span className="text-[10px] text-[#8a717a] font-mono-code font-bold">HEX:</span>
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-[#10050a] border border-[#4d2138] px-2 py-1 text-[11px] text-[#ffc2d4] font-mono-code focus:outline-none rounded-xs"
              placeholder="#000000"
            />
            <input
              ref={nativeInputRef}
              type="color"
              value={validHex}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  allowGradient?: boolean;
}

const ColorField: React.FC<ColorFieldProps> = ({ label, value, onChange, allowGradient = false }) => {
  const [hasOpenPopover, setHasOpenPopover] = useState(false);
  const isGradient = allowGradient && value.includes('gradient');

  let color1 = '#2b111e';
  let color2 = '#0d0509';

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
      const c1 = value.startsWith('#') ? value : '#2b111e';
      const c2 = '#0d0509';
      onChange(`linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`);
    } else {
      onChange(color1.startsWith('#') ? color1 : '#080406');
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
    <div className={`space-y-2.5 bg-[#160a10] p-2.5 border border-[#3b1f2d] rounded-sm flex flex-col justify-between relative min-w-0 ${hasOpenPopover ? 'z-30' : 'z-10'}`}>
      <div className="flex items-start justify-between gap-1.5 pb-1.5 border-b border-[#2d1822] min-w-0">
        <span className="text-[11px] text-[#ffc2d4] font-bold font-mono-code leading-snug min-w-0 flex-1 break-words">
          {label}
        </span>
        {allowGradient && (
          <label className="flex items-center gap-1 cursor-pointer text-[10px] text-[#e0c0cc] hover:text-[#ffffff] font-mono-code select-none shrink-0 bg-[#25101b] px-1.5 py-0.5 border border-[#4d2138] rounded-xs mt-0.5">
            <input
              type="checkbox"
              checked={isGradient}
              onChange={(e) => handleToggleGradient(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#a8446b] rounded-xs cursor-pointer"
            />
            <span>Gradient</span>
          </label>
        )}
      </div>

      {!isGradient ? (
        <div className="pt-0.5 w-full min-w-0">
          <ColorPickerSwatch 
            color={color1} 
            onChange={handleUpdateC1} 
            label="Màu đơn" 
            onToggleOpen={setHasOpenPopover} 
          />
        </div>
      ) : (
        <div className="pt-0.5 w-full min-w-0">
          <div className="grid grid-cols-2 gap-2 w-full min-w-0">
            <ColorPickerSwatch 
              color={color1} 
              onChange={handleUpdateC1} 
              label="M1" 
              onToggleOpen={setHasOpenPopover} 
            />
            <ColorPickerSwatch 
              color={color2} 
              onChange={handleUpdateC2} 
              label="M2" 
              onToggleOpen={setHasOpenPopover} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const StudioManager: React.FC<StudioManagerProps> = ({
  stories,
  chapters,
  currentUser,
  userProfile,
  isAdmin = false,
  onSaveStory,
  onDeleteStory,
  onSaveChapter,
  onSaveBatchChapters,
  onDeleteChapter,
  onSelectStoryForDetail,
}) => {
  // Modal states
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [selectedStoryForChapters, setSelectedStoryForChapters] = useState<Story | null>(null);

  // Filter stories strictly owned by this editor
  // Cho phép hiển thị cả các bộ truyện cũ chưa gán authorUid để editor (askerhater21 / tác giả) có thể quản lý và nhận quyền
  const visibleStories = stories.filter((story) => {
    if (story.authorUid) {
      return story.authorUid === currentUser?.uid;
    }
    if (story.authorEmail && currentUser?.email) {
      return story.authorEmail.toLowerCase() === currentUser.email.toLowerCase();
    }
    // Nếu truyện chưa có authorUid / authorEmail (2 bộ truyện cũ trước đó)
    // Tự động cho phép người dùng hiện tại quản lý và nhận quyền sở hữu
    return true;
  });

  // Story Form State
  const [storyTitle, setStoryTitle] = useState('');
  const [storyAuthor, setStoryAuthor] = useState('');
  const [storyEditorName, setStoryEditorName] = useState('');
  const [storyEditorPhoto, setStoryEditorPhoto] = useState('');
  const [storyCoverUrl, setStoryCoverUrl] = useState('');
  const [storySynopsis, setStorySynopsis] = useState('');
  const [storyTagsInput, setStoryTagsInput] = useState('');
  const [isCompressingCover, setIsCompressingCover] = useState(false);
  const [isCompressingEditorPhoto, setIsCompressingEditorPhoto] = useState(false);
  const [themeTone, setThemeTone] = useState('dark-rose');
  const [defaultFont, setDefaultFont] = useState('font-mono');
  const [customTitleFont, setCustomTitleFont] = useState('font-mono');
  const [customBodyFont, setCustomBodyFont] = useState('font-mono');
  const [customMutedFont, setCustomMutedFont] = useState('font-mono');
  const [customBtnFont, setCustomBtnFont] = useState('font-mono');
  const [customBgColor, setCustomBgColor] = useState('#080406');
  const [customBgType, setCustomBgType] = useState<'solid' | 'gradient'>('solid');
  const [customGradientColor1, setCustomGradientColor1] = useState('#2b111e');
  const [customGradientColor2, setCustomGradientColor2] = useState('#0d0509');
  const [customGradientAngle, setCustomGradientAngle] = useState('135');
  const [gradientApplyTarget, setGradientApplyTarget] = useState<'all' | 'bg' | 'card' | 'btnPrimary' | 'btnSecondary'>('all');
  const [customCardBgColor, setCustomCardBgColor] = useState('#11090c');
  const [customTextColor, setCustomTextColor] = useState('#e0d0d5');
  const [customTextMutedColor, setCustomTextMutedColor] = useState('#8a717a');
  const [customBorderColor, setCustomBorderColor] = useState('#2d1822');
  const [customBtnBgColor, setCustomBtnBgColor] = useState('#2b1620');
  const [customBtnSecondaryBgColor, setCustomBtnSecondaryBgColor] = useState('#1c0f16');
  const [readingEffect, setReadingEffect] = useState<NonNullable<Story['readingEffect']>>('none');
  const [storyBorderStyle, setStoryBorderStyle] = useState<NonNullable<Story['borderStyle']>>('solid');
  const [storyBorderWidth, setStoryBorderWidth] = useState<NonNullable<Story['borderWidth']>>('thin');
  const [storyBorderRadius, setStoryBorderRadius] = useState<NonNullable<Story['borderRadius']>>('none');
  const [storyBorderCornerAccent, setStoryBorderCornerAccent] = useState<NonNullable<Story['borderCornerAccent']>>('none');
  const [storyBorderGlow, setStoryBorderGlow] = useState<NonNullable<Story['borderGlow']>>('none');

  const handleUpdateGradientBg = (c1: string, c2: string, angle: string, target = gradientApplyTarget) => {
    setCustomGradientColor1(c1);
    setCustomGradientColor2(c2);
    setCustomGradientAngle(angle);
    const gradString = `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
    
    if (target === 'all' || target === 'bg') setCustomBgColor(gradString);
    if (target === 'all' || target === 'card') setCustomCardBgColor(gradString);
    if (target === 'all' || target === 'btnPrimary') setCustomBtnBgColor(gradString);
    if (target === 'all' || target === 'btnSecondary') setCustomBtnSecondaryBgColor(gradString);
  };

  // Chapter Form State
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isBulkUploadingChapter, setIsBulkUploadingChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterVolumeTitle, setChapterVolumeTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [isChapterLocked, setIsChapterLocked] = useState(false);
  const [chapterUnlockPrice, setChapterUnlockPrice] = useState(1);

  // Batch Volume assignment in chapter list
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [batchVolumeTitleInput, setBatchVolumeTitleInput] = useState('');
  const [isUpdatingBatchVolume, setIsUpdatingBatchVolume] = useState(false);

  // GitHub Sync State
  const isOwnerAccount = currentUser?.email?.toLowerCase() === 'askerhater21@gmail.com';

  const [githubOwner, setGithubOwner] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('gh_owner') || '' : '');
  const [githubRepo, setGithubRepo] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('gh_repo') || '' : '');
  const [githubBranch, setGithubBranch] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('gh_branch') || 'main' : 'main');
  const [githubPath, setGithubPath] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('gh_path') || 'src/data/sampleStories.ts' : 'src/data/sampleStories.ts');
  const [githubToken, setGithubToken] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('gh_token') || '' : '');
  const [githubAutoSync, setGithubAutoSync] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('gh_auto_sync') === 'true' : false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  // Tải cấu hình từ Firestore (để tất cả Editor đều đồng bộ tự động chạy nền được bằng Token của bạn)
  useEffect(() => {
    const loadGHSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'github_sync');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.githubOwner) setGithubOwner(data.githubOwner);
          if (data.githubRepo) setGithubRepo(data.githubRepo);
          if (data.githubBranch) setGithubBranch(data.githubBranch);
          if (data.githubPath) setGithubPath(data.githubPath);
          if (data.githubToken) setGithubToken(data.githubToken);
          if (data.githubAutoSync !== undefined) setGithubAutoSync(data.githubAutoSync);
        }
      } catch (err) {
        console.warn('[GitHub Sync] Không thể tải cấu hình từ Firestore:', err);
      }
    };
    loadGHSettings();
  }, [currentUser]);

  // Lưu cấu hình lên Firestore
  const saveGHSettingsToFirestore = async (owner: string, repo: string, branch: string, pathStr: string, token: string, autoSync: boolean) => {
    try {
      const docRef = doc(db, 'settings', 'github_sync');
      await setDoc(docRef, {
        githubOwner: owner,
        githubRepo: repo,
        githubBranch: branch,
        githubPath: pathStr,
        githubToken: token,
        githubAutoSync: autoSync,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'unknown'
      });
      console.log('[GitHub Sync] Đã đồng bộ cấu hình lên Firestore!');
    } catch (err) {
      console.error('[GitHub Sync] Lỗi ghi cấu hình lên Firestore:', err);
    }
  };

  // Save GitHub configuration to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gh_owner', githubOwner);
      localStorage.setItem('gh_repo', githubRepo);
      localStorage.setItem('gh_branch', githubBranch);
      localStorage.setItem('gh_path', githubPath);
      localStorage.setItem('gh_token', githubToken);
      localStorage.setItem('gh_auto_sync', githubAutoSync ? 'true' : 'false');
    }

    // Chỉ tài khoản của bạn (isOwnerAccount) mới có quyền cập nhật cấu hình lên Firestore
    if (isOwnerAccount && githubOwner && githubRepo && githubToken) {
      saveGHSettingsToFirestore(githubOwner, githubRepo, githubBranch, githubPath, githubToken, githubAutoSync);
    }
  }, [githubOwner, githubRepo, githubBranch, githubPath, githubToken, githubAutoSync]);

  const handleSyncToGithub = async (isAuto = false) => {
    if (!githubOwner.trim() || !githubRepo.trim() || !githubBranch.trim() || !githubPath.trim() || !githubToken.trim()) {
      if (!isAuto) {
        setSyncStatus('error');
        setSyncMessage('Vui lòng điền đầy đủ các thông tin cấu hình GitHub trước khi đồng bộ.');
      }
      return;
    }

    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncMessage(isAuto ? 'Đang tự động đồng bộ chạy nền lên GitHub...' : 'Đang chuẩn bị dữ liệu truyện và chương...');

    try {
      // 1. Generate file content dynamically
      const comments = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('chucu_comments') || '[]') : [];
      const fileContent = `import { Story, Chapter, Comment } from '../types';

export const INITIAL_STORIES: Story[] = ${JSON.stringify(stories, null, 2)};

export const INITIAL_CHAPTERS: Chapter[] = ${JSON.stringify(chapters, null, 2)};

export const INITIAL_COMMENTS: Comment[] = ${JSON.stringify(comments, null, 2)};
`;

      // 2. Base64 encode the content (UTF-8 safe)
      const utf8Bytes = new TextEncoder().encode(fileContent);
      let binary = '';
      const len = utf8Bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const base64Content = window.btoa(binary);

      const cleanPath = githubPath.trim().replace(/^\//, ''); // strip leading slash if any
      let retries = 3;
      let success = false;
      let lastErrorMessage = '';

      while (retries > 0 && !success) {
        try {
          // 3. Fetch existing file SHA from GitHub (always bypass cache with Date.now() query & cache headers)
          if (!isAuto) setSyncMessage(`Đang lấy thông tin file từ GitHub (Lần thử ${4 - retries}/3)...`);
          const getFileUrl = `https://api.github.com/repos/${githubOwner.trim()}/${githubRepo.trim()}/contents/${cleanPath}?ref=${githubBranch.trim()}&_t=${Date.now()}`;
          
          let currentSha = '';
          try {
            const getRes = await fetch(getFileUrl, {
              headers: {
                'Authorization': `token ${githubToken.trim()}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            });
            
            if (getRes.ok) {
              const fileData = await getRes.json();
              currentSha = fileData.sha;
            } else if (getRes.status !== 404) {
              throw new Error(`Lỗi kết nối GitHub API: HTTP ${getRes.status}`);
            }
          } catch (err: any) {
            // Check for 404
            if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
              currentSha = '';
            } else {
              throw err;
            }
          }

          // 4. Push updated content via PUT request to GitHub
          if (!isAuto) setSyncMessage('Đang commit dữ liệu mới lên repo...');
          const putRes = await fetch(`https://api.github.com/repos/${githubOwner.trim()}/${githubRepo.trim()}/contents/${cleanPath}`, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${githubToken.trim()}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: 'Đồng bộ dữ liệu truyện & chương tự động từ Editor Studio',
              content: base64Content,
              branch: githubBranch.trim(),
              sha: currentSha || undefined
            })
          });

          if (putRes.ok) {
            success = true;
            break;
          }

          const errorData = await putRes.json();
          const serverMsg = errorData.message || '';
          
          // If 409 Conflict (SHA mismatch) or error contains sha mismatch info, let's retry
          if (putRes.status === 409 || serverMsg.toLowerCase().includes('sha') || serverMsg.toLowerCase().includes('conflict')) {
            console.warn(`[GitHub Sync] Phát hiện xung đột SHA (409) từ GitHub. Đang chuẩn bị thử lại sau 1.5s... Còn lại ${retries - 1} lần thử.`);
            retries--;
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1500));
              continue;
            }
          }

          throw new Error(serverMsg || `Lỗi ghi đè file: HTTP ${putRes.status}`);

        } catch (err: any) {
          lastErrorMessage = err.message || 'Lỗi chưa rõ nguyên nhân.';
          console.error(`[GitHub Sync] Thử thất bại (Lần ${4 - retries}):`, lastErrorMessage);
          
          // Only retry if it looks like a cache/SHA conflict mismatch
          if (lastErrorMessage.toLowerCase().includes('sha') || lastErrorMessage.toLowerCase().includes('409') || lastErrorMessage.toLowerCase().includes('conflict')) {
            retries--;
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1500));
              continue;
            }
          } else {
            // Fail immediately for other fatal errors (e.g., Bad Credentials, Repository not found)
            break;
          }
        }
      }

      if (success) {
        setSyncStatus('success');
        setSyncMessage(isAuto ? 'Tự động đồng bộ lên GitHub thành công!' : 'Đồng bộ thành công! GitHub Pages sẽ tự động rebuild sau 1-2 phút.');
      } else {
        throw new Error(lastErrorMessage || 'Xung đột SHA liên tiếp sau 3 lần thử lại. Hãy kiểm tra xem file có bị tác động từ bên ngoài không.');
      }

    } catch (err: any) {
      console.error('GitHub Sync Final Error:', err);
      setSyncStatus('error');
      setSyncMessage(err.message || 'Lỗi chưa rõ nguyên nhân khi đồng bộ.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Real-time Auto Sync Listener with Debounce
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (githubAutoSync && githubOwner && githubRepo && githubToken && githubPath) {
      const delayDebounceFn = setTimeout(() => {
        handleSyncToGithub(true);
      }, 1500); // 1.5s debounce to collect continuous edits

      return () => clearTimeout(delayDebounceFn);
    }
  }, [stories, chapters, githubAutoSync]);

  // Active Preview Colors computed for Live Theme & Font Preview
  const activePreviewColors = themeTone === 'custom' ? {
    bg: customBgColor || '#080406',
    cardBg: customCardBgColor || '#11090c',
    text: customTextColor || '#e0d0d5',
    textMuted: customTextMutedColor || '#8a717a',
    border: customBorderColor || '#2d1822',
    btnBg: customBtnBgColor || '#2b1620',
    btnSecondaryBg: customBtnSecondaryBgColor || '#1c0f16',
    btnBorder: customBorderColor || '#5e2f46',
    btnText: customTextColor || '#ffd6e2',
  } : (PRESET_THEME_COLORS[themeTone] || PRESET_THEME_COLORS['dark-rose']);

  // Save from Live Story Editor
  const handleLiveStorySave = (storyData: Partial<Story>) => {
    const resolvedEditorName = 
      storyData.editorName?.trim() ||
      userProfile?.displayName ||
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      editingStory?.editorName ||
      'Cục Nâu';

    const resolvedEditorPhoto =
      storyData.editorPhoto?.trim() ||
      userProfile?.photoURL ||
      currentUser?.photoURL ||
      editingStory?.editorPhoto ||
      '';

    const newStory: Story = {
      id: editingStory ? editingStory.id : 'story-' + Date.now(),
      title: (storyData.title || '').trim(),
      author: (storyData.author || 'Tác giả').trim(),
      authorUid: currentUser?.uid || editingStory?.authorUid,
      authorEmail: currentUser?.email || editingStory?.authorEmail || '',
      editorName: resolvedEditorName,
      editorPhoto: resolvedEditorPhoto,
      coverUrl: (storyData.coverUrl || '').trim() || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
      synopsis: (storyData.synopsis || '').trim(),
      tags: storyData.tags,
      viewsCount: editingStory ? editingStory.viewsCount : 0,
      createdAt: editingStory ? editingStory.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      themeTone: storyData.themeTone || 'dark-rose',
      defaultFont: storyData.customBodyFont || 'font-mono',
      customTitleFont: storyData.customTitleFont,
      customBodyFont: storyData.customBodyFont,
      customMutedFont: storyData.customMutedFont,
      customBtnFont: storyData.customBtnFont,
      customBgColor: storyData.customBgColor,
      customCardBgColor: storyData.customCardBgColor,
      customTextColor: storyData.customTextColor,
      customTextMutedColor: storyData.customTextMutedColor,
      customBorderColor: storyData.customBorderColor,
      customBtnBgColor: storyData.customBtnBgColor,
      customBtnSecondaryBgColor: storyData.customBtnSecondaryBgColor,
      readingEffect: storyData.readingEffect,
      borderStyle: storyData.borderStyle,
      borderWidth: storyData.borderWidth,
      borderRadius: storyData.borderRadius,
      borderCornerAccent: storyData.borderCornerAccent,
      borderGlow: storyData.borderGlow,

      // Theme và Hiệu ứng chương riêng biệt
      useSeparateChapterTheme: storyData.useSeparateChapterTheme,
      useSeparateChapterEffect: storyData.useSeparateChapterEffect,
      chapterThemeTone: storyData.chapterThemeTone,
      chapterCustomBgColor: storyData.chapterCustomBgColor,
      chapterCustomCardBgColor: storyData.chapterCustomCardBgColor,
      chapterCustomTextColor: storyData.chapterCustomTextColor,
      chapterCustomTextMutedColor: storyData.chapterCustomTextMutedColor,
      chapterCustomBorderColor: storyData.chapterCustomBorderColor,
      chapterCustomBtnBgColor: storyData.chapterCustomBtnBgColor,
      chapterCustomBtnSecondaryBgColor: storyData.chapterCustomBtnSecondaryBgColor,
      chapterBorderStyle: storyData.chapterBorderStyle,
      chapterBorderWidth: storyData.chapterBorderWidth,
      chapterBorderRadius: storyData.chapterBorderRadius,
      chapterBorderCornerAccent: storyData.chapterBorderCornerAccent,
      chapterBorderGlow: storyData.chapterBorderGlow,
      chapterReadingEffect: storyData.chapterReadingEffect,
    };

    onSaveStory(newStory);
    setIsCreatingStory(false);
    setEditingStory(null);
  };

  // Open Create Story
  const handleOpenCreateStory = () => {
    setEditingStory(null);
    setStoryTitle('');
    setStoryAuthor('Tử Thời Hoan');
    setStoryEditorName(userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Cục Nâu');
    setStoryEditorPhoto(userProfile?.photoURL || currentUser?.photoURL || '');
    setStoryCoverUrl('');
    setStorySynopsis('');
    setStoryTagsInput('');
    setThemeTone('dark-rose');
    setDefaultFont('font-mono');
    setCustomTitleFont('font-mono');
    setCustomBodyFont('font-mono');
    setCustomMutedFont('font-mono');
    setCustomBtnFont('font-mono');
    setCustomBgColor('#080406');
    setCustomBgType('solid');
    setCustomGradientColor1('#2b111e');
    setCustomGradientColor2('#0d0509');
    setCustomGradientAngle('135');
    setCustomCardBgColor('#11090c');
    setCustomTextColor('#e0d0d5');
    setCustomTextMutedColor('#8a717a');
    setCustomBorderColor('#2d1822');
    setCustomBtnBgColor('#2b1620');
    setCustomBtnSecondaryBgColor('#1c0f16');
    setGradientApplyTarget('all');
    setReadingEffect('none');
    setStoryBorderStyle('solid');
    setStoryBorderWidth('thin');
    setStoryBorderRadius('none');
    setStoryBorderCornerAccent('none');
    setStoryBorderGlow('none');
    setIsCreatingStory(true);
  };

  // Open Edit Story
  const handleOpenEditStory = (story: Story) => {
    setEditingStory(story);
    setStoryTitle(story.title);
    setStoryAuthor(story.author || 'Tử Thời Hoan');
    setStoryEditorName(
      story.editorName ||
      userProfile?.displayName ||
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      'Cục Nâu'
    );
    setStoryEditorPhoto(
      story.editorPhoto ||
      userProfile?.photoURL ||
      currentUser?.photoURL ||
      ''
    );
    setStoryCoverUrl(story.coverUrl);
    setStorySynopsis(story.synopsis);
    setStoryTagsInput(story.tags ? story.tags.join(', ') : '');
    setThemeTone(story.themeTone || 'dark-rose');
    setDefaultFont(story.defaultFont || 'font-mono');
    setCustomTitleFont(story.customTitleFont || story.defaultFont || 'font-mono');
    setCustomBodyFont(story.customBodyFont || story.defaultFont || 'font-mono');
    setCustomMutedFont(story.customMutedFont || story.defaultFont || 'font-mono');
    setCustomBtnFont(story.customBtnFont || story.defaultFont || 'font-mono');
    
    const bg = story.customBgColor || '#080406';
    if (bg.includes('gradient')) {
      setCustomBgType('gradient');
      const angleMatch = bg.match(/(\d+)deg/);
      const colorMatches = bg.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g);
      if (angleMatch) setCustomGradientAngle(angleMatch[1]);
      if (colorMatches && colorMatches.length >= 2) {
         setCustomGradientColor1(colorMatches[0]);
         setCustomGradientColor2(colorMatches[1]);
      } else {
        setCustomGradientColor1('#2b111e');
        setCustomGradientColor2('#0d0509');
      }
    } else {
      setCustomBgType('solid');
      setCustomGradientColor1('#2b111e');
      setCustomGradientColor2('#0d0509');
      setCustomGradientAngle('135');
    }

    setCustomBgColor(bg);
    setCustomCardBgColor(story.customCardBgColor || '#11090c');
    setCustomTextColor(story.customTextColor || '#e0d0d5');
    setCustomTextMutedColor(story.customTextMutedColor || '#8a717a');
    setCustomBorderColor(story.customBorderColor || '#2d1822');
    setCustomBtnBgColor(story.customBtnBgColor || '#2b1620');
    setCustomBtnSecondaryBgColor(story.customBtnSecondaryBgColor || '#1c0f16');
    setGradientApplyTarget('all');
    setReadingEffect(story.readingEffect || 'none');
    setStoryBorderStyle(story.borderStyle || 'solid');
    setStoryBorderWidth(story.borderWidth || 'thin');
    setStoryBorderRadius(story.borderRadius || 'none');
    setStoryBorderCornerAccent(story.borderCornerAccent || 'none');
    setStoryBorderGlow(story.borderGlow || 'none');
    setIsCreatingStory(true);
  };

  // Save Story
  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim()) return;

    const resolvedEditorName = 
      storyEditorName.trim() ||
      userProfile?.displayName ||
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      editingStory?.editorName ||
      'Cục Nâu';

    const resolvedEditorPhoto =
      storyEditorPhoto.trim() ||
      userProfile?.photoURL ||
      currentUser?.photoURL ||
      editingStory?.editorPhoto ||
      '';

    const parsedTags = storyTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newStory: Story = {
      id: editingStory ? editingStory.id : 'story-' + Date.now(),
      title: storyTitle.trim(),
      author: storyAuthor.trim() || 'Tác giả',
      authorUid: currentUser?.uid || editingStory?.authorUid,
      authorEmail: currentUser?.email || editingStory?.authorEmail || '',
      editorName: resolvedEditorName,
      editorPhoto: resolvedEditorPhoto,
      coverUrl: storyCoverUrl.trim() || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
      synopsis: storySynopsis.trim(),
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      viewsCount: editingStory ? editingStory.viewsCount : 0,
      createdAt: editingStory ? editingStory.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      themeTone: themeTone,
      defaultFont: customBodyFont,
      customTitleFont: customTitleFont,
      customBodyFont: customBodyFont,
      customMutedFont: customMutedFont,
      customBtnFont: customBtnFont,
      customBgColor: themeTone === 'custom' ? customBgColor : undefined,
      customCardBgColor: themeTone === 'custom' ? customCardBgColor : undefined,
      customTextColor: themeTone === 'custom' ? customTextColor : undefined,
      customTextMutedColor: themeTone === 'custom' ? customTextMutedColor : undefined,
      customBorderColor: themeTone === 'custom' ? customBorderColor : undefined,
      customBtnBgColor: themeTone === 'custom' ? customBtnBgColor : undefined,
      customBtnSecondaryBgColor: themeTone === 'custom' ? customBtnSecondaryBgColor : undefined,
      readingEffect: readingEffect,
      borderStyle: storyBorderStyle,
      borderWidth: storyBorderWidth,
      borderRadius: storyBorderRadius,
      borderCornerAccent: storyBorderCornerAccent,
      borderGlow: storyBorderGlow,
    };

    onSaveStory(newStory);
    setIsCreatingStory(false);
  };

  // Open Create Chapter
  const handleOpenCreateChapter = () => {
    setEditingChapter(null);
    setChapterTitle('');
    setChapterVolumeTitle('');
    setChapterContent('');
    setIsChapterLocked(false);
    setChapterUnlockPrice(1);
    setIsCreatingChapter(true);
  };

  // Open Edit Chapter
  const handleOpenEditChapter = (chap: Chapter) => {
    setEditingChapter(chap);
    setChapterTitle(chap.title);
    setChapterVolumeTitle(chap.volumeTitle || '');
    setChapterContent(chap.content);
    setIsChapterLocked(!!chap.isLocked);
    setChapterUnlockPrice(chap.unlockPrice && chap.unlockPrice > 0 ? chap.unlockPrice : 1);
    setIsCreatingChapter(true);
  };

  // Save Chapter
  const handleSubmitChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryForChapters || !chapterTitle.trim()) return;

    const storyChaps = chapters.filter(c => c.storyId === selectedStoryForChapters.id);
    const nextChapterNum = editingChapter ? editingChapter.chapterNumber : storyChaps.length + 1;

    const newChapter: Chapter = {
      id: editingChapter ? editingChapter.id : 'chap-' + Date.now(),
      storyId: selectedStoryForChapters.id,
      chapterNumber: nextChapterNum,
      title: chapterTitle.trim(),
      volumeTitle: chapterVolumeTitle.trim() || undefined,
      content: chapterContent.trim(),
      views: editingChapter ? editingChapter.views : 0,
      createdAt: editingChapter ? editingChapter.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isLocked: isChapterLocked,
      unlockPrice: isChapterLocked ? Math.max(1, chapterUnlockPrice) : undefined,
    };

    onSaveChapter(newChapter);
    setChapterTitle('');
    setChapterVolumeTitle('');
    setChapterContent('');
    setIsChapterLocked(false);
    setChapterUnlockPrice(1);
    setEditingChapter(null);
    setIsCreatingChapter(false);
  };

  const handleToggleSelectChapter = (chapId: string) => {
    setSelectedChapterIds((prev) =>
      prev.includes(chapId) ? prev.filter((id) => id !== chapId) : [...prev, chapId]
    );
  };

  const handleSelectAllChapters = (allChapIds: string[], select: boolean) => {
    if (select) {
      setSelectedChapterIds(allChapIds);
    } else {
      setSelectedChapterIds([]);
    }
  };

  const handleApplyBatchVolume = async (volumeName: string | undefined) => {
    if (!selectedStoryForChapters || selectedChapterIds.length === 0) return;
    setIsUpdatingBatchVolume(true);
    try {
      const storyChaps = chapters.filter((c) => c.storyId === selectedStoryForChapters.id);
      const updatedChaps = storyChaps
        .filter((c) => selectedChapterIds.includes(c.id))
        .map((c) => ({
          ...c,
          volumeTitle: volumeName?.trim() || undefined,
          updatedAt: new Date().toISOString().split('T')[0],
        }));

      if (onSaveBatchChapters) {
        await onSaveBatchChapters(updatedChaps);
      } else {
        for (const ch of updatedChaps) {
          onSaveChapter(ch);
        }
      }
      setSelectedChapterIds([]);
      setBatchVolumeTitleInput('');
    } catch (err) {
      console.error('Error applying batch volume:', err);
    } finally {
      setIsUpdatingBatchVolume(false);
    }
  };

  // Claim ownership for a legacy story
  const handleClaimStory = async (story: Story) => {
    if (!currentUser) return;
    await claimStoryOwnership(
      story.id,
      currentUser.uid,
      currentUser.email || '',
      currentUser.displayName || ''
    );
    const updatedStory: Story = {
      ...story,
      authorUid: currentUser.uid,
      authorEmail: currentUser.email || '',
      editorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Editor',
      editorPhoto: currentUser.photoURL || '',
    };
    onSaveStory(updatedStory);
  };

  const handleDownloadCodeFile = () => {
    try {
      const comments = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('chucu_comments') || '[]') : [];
      
      const fileContent = `import { Story, Chapter, Comment } from '../types';

export const INITIAL_STORIES: Story[] = ${JSON.stringify(stories, null, 2)};

export const INITIAL_CHAPTERS: Chapter[] = ${JSON.stringify(chapters, null, 2)};

export const INITIAL_COMMENTS: Comment[] = ${JSON.stringify(comments, null, 2)};
`;

      const blob = new Blob([fileContent], { type: 'text/typescript;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sampleStories.ts');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Lỗi khi tải file dữ liệu:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-mono-code text-[#e0d0d5]">
      
      {/* Top Banner */}
      <div className="bg-[#11090c] border border-[#2d1822] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#e0d0d5] text-sm font-bold font-mono-code uppercase tracking-[0.15em]">
            Khu vực Quản lý của Editor
          </h1>
          <p className="text-xs text-[#8a717a] mt-1 font-mono-code">
            Editor: <strong className="text-[#e0c0cc]">{currentUser?.displayName || currentUser?.email || 'Editor'}</strong> • Mỗi Editor chỉ xem và quản lý những bộ truyện do chính mình đăng tải.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Real-time Status Indicator - Chỉ hiển thị với tài khoản chính */}
          {isOwnerAccount && githubAutoSync && githubOwner && githubRepo && githubToken && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono-code px-2 py-1.5 bg-[#102330]/60 border border-[#233d4f] text-[#7cd3ff] rounded-xs select-none mr-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : syncStatus === 'error' ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
              <span>
                {isSyncing ? 'ĐANG AUTO-SYNC...' : syncStatus === 'error' ? 'LỖI AUTO-SYNC' : 'AUTO-SYNC HOẠT ĐỘNG'}
              </span>
            </div>
          )}

          {isOwnerAccount && (
            <button
              onClick={() => {
                setSyncStatus('idle');
                setSyncMessage('');
                setIsGithubModalOpen(true);
              }}
              className="px-4 py-2 bg-[#102330] hover:bg-[#1a3547] border border-[#2b4c63] text-[#bfe8ff] text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center gap-2 shrink-0"
              title="Cấu hình và đồng bộ dữ liệu truyện, chương của bạn trực tiếp lên GitHub"
            >
              <Github className="w-4 h-4 text-[#7cd3ff]" />
              <span>Đồng bộ GitHub</span>
            </button>
          )}

          <button
            onClick={handleDownloadCodeFile}
            className="px-4 py-2 bg-[#1b2b20] hover:bg-[#253d2c] border border-[#3e5e48] text-[#d6ffe0] text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center gap-2 shrink-0"
            title="Tải về file sampleStories.ts chứa toàn bộ dữ liệu truyện và chương mới nhất để ghi đè vào thư mục code của bạn trên máy"
          >
            <Download className="w-4 h-4 text-[#a0ffd0]" />
            <span>Tải file code</span>
          </button>
          
          <button
            onClick={handleOpenCreateStory}
            className="px-5 py-2 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#e0c0cc] text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm truyện</span>
          </button>
        </div>
      </div>

      {/* Chapters Sub-manager View if Selected */}
      {selectedStoryForChapters ? (
        <div className="bg-[#11090c] border border-[#2d1822] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#23151b] pb-4">
            <button
              onClick={() => {
                setSelectedStoryForChapters(null);
                setIsCreatingChapter(false);
                setEditingChapter(null);
              }}
              className="flex items-center gap-1.5 text-xs text-[#8a717a] hover:text-[#e0c0cc] transition font-mono-code"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh sách truyện</span>
            </button>
            <h2 className="text-xs sm:text-sm font-bold font-mono-code uppercase tracking-[0.15em] text-[#e0c0cc]">
              Quản lý chương: {selectedStoryForChapters.title}
            </h2>
          </div>

          {!isCreatingChapter ? (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs text-[#8a717a] font-mono-code">
                  Tổng số chương: {chapters.filter(c => c.storyId === selectedStoryForChapters.id).length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBulkUploadingChapter(true)}
                    className="px-3.5 py-2 bg-[#1b1016] hover:bg-[#281622] border border-[#5e2f46] text-[#ffd6e2] text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
                    title="Tải lên file văn bản tổng hoặc dán nội dung để hệ thống tự nhận diện chia các chương"
                  >
                    <UploadCloud className="w-4 h-4 text-[#d0a0b0]" />
                    <span>Tải file tổng (Tự chia chương)</span>
                  </button>
                  <button
                    onClick={handleOpenCreateChapter}
                    className="px-4 py-2 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#e0c0cc] text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Viết chương mới</span>
                  </button>
                </div>
              </div>

              {/* Batch Volume / Section Manager Toolbar */}
              {(() => {
                const storyChaps = chapters
                  .filter((c) => c.storyId === selectedStoryForChapters.id)
                  .sort((a, b) => a.chapterNumber - b.chapterNumber);

                if (storyChaps.length === 0) return null;

                return (
                  <div className="p-3.5 bg-[#160a11] border border-[#3d1f2e] space-y-2.5 rounded-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-[#ffd6e2]">
                          <input
                            type="checkbox"
                            checked={selectedChapterIds.length === storyChaps.length && storyChaps.length > 0}
                            onChange={(e) => handleSelectAllChapters(storyChaps.map(c => c.id), e.target.checked)}
                            className="cursor-pointer accent-[#5e2f46] w-4 h-4"
                          />
                          <span>Chọn tất cả ({storyChaps.length} chương)</span>
                        </label>
                        {selectedChapterIds.length > 0 && (
                          <span className="text-[11px] text-[#ff99bb] font-bold bg-[#26101c] px-2 py-0.5 border border-[#5e2f46] rounded-xs">
                            Đã chọn {selectedChapterIds.length} chương
                          </span>
                        )}
                      </div>
                      {selectedChapterIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedChapterIds([])}
                          className="text-[11px] text-[#8a717a] hover:text-[#ffd6e2] underline"
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative flex-1 min-w-[240px]">
                        <input
                          type="text"
                          value={batchVolumeTitleInput}
                          onChange={(e) => setBatchVolumeTitleInput(e.target.value)}
                          placeholder="Nhập tên phần/quyển cần gán (Ví dụ: Quyển 1: Đêm đông sống lại)..."
                          className="w-full bg-[#10070a] border border-[#2d1822] px-3 py-1.5 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#5e2f46] font-mono-code placeholder:text-[#6a555f]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyBatchVolume(batchVolumeTitleInput)}
                        disabled={!batchVolumeTitleInput.trim() || selectedChapterIds.length === 0 || isUpdatingBatchVolume}
                        className="px-3.5 py-1.5 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#ffd6e2] text-xs font-mono-code font-bold uppercase tracking-wider disabled:opacity-40 transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isUpdatingBatchVolume ? 'Đang lưu...' : `Đặt tên phần cho ${selectedChapterIds.length} chương`}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyBatchVolume(undefined)}
                        disabled={selectedChapterIds.length === 0 || isUpdatingBatchVolume}
                        className="px-3 py-1.5 bg-[#180b12] hover:bg-[#25101b] border border-[#2d1822] hover:border-[#5e2f46] text-[#8a717a] hover:text-[#ffd6e2] text-xs font-mono-code disabled:opacity-40 transition"
                      >
                        Xóa tên phần ({selectedChapterIds.length})
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* List of chapters with Volume Breaks / Ngắt Phần */}
              <div className="space-y-2">
                {(() => {
                  const storyChaps = chapters
                    .filter((c) => c.storyId === selectedStoryForChapters.id)
                    .sort((a, b) => a.chapterNumber - b.chapterNumber);

                  if (storyChaps.length === 0) {
                    return (
                      <div className="bg-[#170d12] border border-[#2d1822] p-4 text-center text-xs text-[#8a717a]">
                        Chưa có chương nào được viết.
                      </div>
                    );
                  }

                  return storyChaps.map((chap, idx) => {
                    const prevChap = idx > 0 ? storyChaps[idx - 1] : null;
                    const isNewVolume = !!(chap.volumeTitle && (!prevChap || prevChap.volumeTitle !== chap.volumeTitle));
                    const isTransitionToNoVolume = !chap.volumeTitle && !!(prevChap && prevChap.volumeTitle);
                    const isSelected = selectedChapterIds.includes(chap.id);

                    return (
                      <React.Fragment key={chap.id}>
                        {/* Volume / Section Break Header */}
                        {isNewVolume && (
                          <div className="pt-2 pb-0.5">
                            <div className="bg-[#1f0f18] border border-[#5e2f46] px-3.5 py-2 flex items-center justify-between text-xs font-bold text-[#ffd6e2] rounded-xs shadow-xs">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-[#ff99bb]" />
                                <span>{chap.volumeTitle}</span>
                              </div>
                              <span className="text-[11px] font-normal text-[#c492a5]">
                                {storyChaps.filter((c) => c.volumeTitle === chap.volumeTitle).length} chương
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Transition divider */}
                        {isTransitionToNoVolume && (
                          <div className="pt-2 pb-0.5">
                            <div className="bg-[#12080d] border border-dashed border-[#3b1f2d] px-3 py-1.5 flex items-center gap-2 text-xs text-[#8a717a] rounded-xs">
                              <BookOpen className="w-3 h-3 text-[#8a717a]" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold">Các chương tiếp theo</span>
                            </div>
                          </div>
                        )}

                        <div 
                          className={`p-3 flex items-center justify-between text-xs font-mono-code border transition-colors ${
                            isSelected 
                              ? 'bg-[#1e0e17] border-[#6b314e]' 
                              : 'bg-[#170d12] border-[#2d1822]'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Checkbox for selecting chapter */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectChapter(chap.id)}
                              className="cursor-pointer accent-[#5e2f46] w-4 h-4 shrink-0"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-[#e0c0cc] font-mono-code">{chap.title}</span>
                                {chap.volumeTitle && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#200d18] border border-[#4d2138] text-[10px] text-[#e0a8be] font-medium rounded-xs">
                                    <BookOpen className="w-2.5 h-2.5 text-[#ff99bb]" />
                                    <span>{chap.volumeTitle}</span>
                                  </span>
                                )}
                                {chap.isLocked && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#2b1620] border border-[#5e2f46] text-[10px] text-[#ffd6e2] font-semibold">
                                    <Lock className="w-3 h-3 text-[#ff99bb]" />
                                    <span>{chap.unlockPrice || 1} Chucu</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-[#8a717a]">Cập nhật: {chap.createdAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              onClick={() => handleOpenEditChapter(chap)}
                              className="p-1.5 text-[#8a717a] hover:text-[#ffd6e2] transition"
                              title="Sửa chương / Đổi ngắt phần / Đổi giá Chucu"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteChapter(chap.id, selectedStoryForChapters.id)}
                              className="p-1.5 text-[#8a717a] hover:text-[#d0a0b0] transition"
                              title="Xóa chương"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            </div>
          ) : (
            /* Create / Edit Chapter Form */
            <form onSubmit={handleSubmitChapter} className="space-y-4 bg-[#170d12] border border-[#2d1822] p-4 font-mono-code">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#23151b] pb-2">
                <h3 className="text-xs font-bold font-mono-code uppercase tracking-[0.15em] text-[#e0c0cc]">
                  {editingChapter ? `Sửa chương: ${editingChapter.title}` : 'Viết chương mới'}
                </h3>
                {!editingChapter && (
                  <button
                    type="button"
                    onClick={() => setIsBulkUploadingChapter(true)}
                    className="text-[11px] text-[#ffd6e2] hover:text-white bg-[#221019] hover:bg-[#321724] px-2.5 py-1 border border-[#5e2f46] transition flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#d0a0b0]" />
                    <span>Hoặc Tải file tổng tự chia chương</span>
                  </button>
                )}
              </div>

              {/* Volume Title / Section Break field */}
              <div className="space-y-1.5 bg-[#140a0f] border border-[#2d1822] p-3 rounded-xs">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="text-xs font-bold text-[#ffd6e2] block font-mono-code flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#ff99bb]" />
                    <span>Phần / Quyển (Ngắt phần - Tùy chọn):</span>
                  </label>
                  <span className="text-[10px] text-[#8a717a] italic">Ví dụ: Quyển 1: Đêm đông sống lại</span>
                </div>
                <input
                  type="text"
                  value={chapterVolumeTitle}
                  onChange={(e) => setChapterVolumeTitle(e.target.value)}
                  placeholder="Nhập tên phần/quyển để gom nhóm các chương (Ví dụ: Quyển 1: Đêm đông sống lại)..."
                  className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#5e2f46] font-mono-code"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a] block font-mono-code">Tiêu đề chương:</label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="Ví dụ: Chương 1: Khởi đầu..."
                  className="w-full bg-[#12090c] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                  required
                />
              </div>

              {/* Lock Chapter Setting with Chucu */}
              <div className="p-3 bg-[#140a0f] border border-[#2d1822] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChapterLocked}
                    onChange={(e) => setIsChapterLocked(e.target.checked)}
                    className="cursor-pointer accent-[#5e2f46] w-4 h-4"
                  />
                  <span className="font-bold text-xs text-[#ffd6e2] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#ff99bb]" />
                    <span>Khóa chương này (Yêu cầu Chucu để mở khóa)</span>
                  </span>
                </label>

                {isChapterLocked && (
                  <div className="flex flex-wrap items-center gap-2 pl-6 pt-1 text-xs">
                    <span className="text-[#e0c0cc]">Số Chucu để mở khóa:</span>
                    <input
                      type="number"
                      min={1}
                      value={chapterUnlockPrice}
                      onChange={(e) => setChapterUnlockPrice(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 bg-[#10070a] border border-[#5e2f46] p-1.5 text-center text-xs text-[#ffd6e2] font-bold focus:outline-none"
                      required
                    />
                    <span className="text-[#ffd6e2] font-bold">Chucu</span>
                    <span className="text-[10px] text-[#8a717a] italic">(Tối thiểu 1 Chucu).</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a] block font-mono-code">Nội dung chữ:</label>
                <textarea
                  value={chapterContent}
                  onChange={(e) => setChapterContent(e.target.value)}
                  placeholder="Nhập nội dung chương truyện ở đây..."
                  rows={12}
                  className="w-full bg-[#12090c] border border-[#2d1822] p-3 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] leading-relaxed resize-y font-mono-code"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingChapter(false);
                    setEditingChapter(null);
                  }}
                  className="px-4 py-1.5 bg-[#12090c] border border-[#2d1822] text-xs text-[#8a717a] font-mono-code"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#2b1620] border border-[#5e2f46] text-xs text-[#e0c0cc] font-mono-code font-bold uppercase tracking-wider"
                >
                  {editingChapter ? 'Lưu cập nhật' : 'Đăng chương'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Stories List */
        <div className="bg-[#11090c] border border-[#2d1822] p-6 space-y-4 font-mono-code">
          <div className="flex items-center justify-between border-b border-[#23151b] pb-2">
            <h2 className="text-xs sm:text-sm font-bold font-mono-code uppercase tracking-[0.15em] text-[#e0c0cc]">
              Danh sách truyện của bạn ({visibleStories.length})
            </h2>
            <span className="text-[11px] text-[#8a717a]">
              {visibleStories.length === 1 ? '1 bộ truyện' : `${visibleStories.length} bộ truyện`}
            </span>
          </div>

          {visibleStories.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8a717a] font-mono-code space-y-2">
              <p>Bạn chưa đăng tải bộ truyện nào vào Studio này.</p>
              <p className="text-[11px] text-[#5e2f46]">Bấm nút "+ Thêm truyện" ở góc trên để bắt đầu tạo truyện của riêng bạn!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleStories.map((story) => {
                const storyChaps = chapters.filter(c => c.storyId === story.id);
                const isOwnedByCurrent = story.authorUid === currentUser?.uid || (story.authorEmail && story.authorEmail === currentUser?.email);

                return (
                  <div
                    key={story.id}
                    className="bg-[#170d12] border border-[#2d1822] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {story.coverUrl && (
                        <img
                          src={story.coverUrl}
                          alt={story.title}
                          className="w-12 h-16 object-cover border border-[#2d1822] shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => onSelectStoryForDetail(story)}
                            className="font-bold text-sm font-mono-code text-[#e0c0cc] hover:text-[#d0a0b0] cursor-pointer transition"
                          >
                            {story.title}
                          </h3>
                          {story.authorEmail && (
                            <span className="text-[10px] text-[#8a717a] border border-[#2d1822] px-1.5 py-0.2">
                              {story.authorEmail}
                            </span>
                          )}
                          {!story.authorUid && (
                            <span className="text-[10px] text-[#ffb86c] bg-[#2a1a0a] border border-[#664411] px-1.5 py-0.2 flex items-center gap-1">
                              <span>Truyện ban đầu</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8a717a] mt-0.5 font-mono-code">
                          Tác giả/Editor: <span className="text-[#e0c0cc]">{story.author}</span> • {storyChaps.length} chương • Ngày đăng: <span>{story.createdAt}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end font-mono-code flex-wrap">
                      {!isOwnedByCurrent && (
                        <button
                          onClick={() => handleClaimStory(story)}
                          className="px-2.5 py-1.5 bg-[#2a1a0a] hover:bg-[#3d260f] border border-[#7a4e18] text-[#ffd699] flex items-center gap-1 transition"
                          title="Gán quyền quản lý bộ truyện này vĩnh viễn về tài khoản của bạn"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Nhận quyền quản lý</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedStoryForChapters(story)}
                        className="px-3 py-1.5 bg-[#1f1017] hover:bg-[#2d1822] border border-[#3d202e] text-[#e0c0cc] flex items-center gap-1 transition"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Chương ({storyChaps.length})</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditStory(story)}
                        className="px-3 py-1.5 bg-[#1f1017] hover:bg-[#2d1822] border border-[#3d202e] text-[#e0c0cc] flex items-center gap-1 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={() => onDeleteStory(story.id)}
                        className="p-1.5 bg-[#1f1017] hover:bg-[#2d1822] border border-[#3d202e] text-[#d0a0b0] transition"
                        title="Xóa truyện"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Live WYSIWYG Story Editor */}
      {isCreatingStory && (
        <LiveStoryEditor
          initialStory={editingStory}
          currentUser={currentUser}
          userProfile={userProfile}
          onSave={handleLiveStorySave}
          onCancel={() => {
            setIsCreatingStory(false);
            setEditingStory(null);
          }}
        />
      )}

      {/* Hidden Old Modal Form */}
      {false && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmitStory}
            className="bg-[#11090c] border border-[#3d202e] w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl relative my-auto font-mono-code rounded-none text-left"
          >
            {/* Sticky Header with Close Button */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#2d1822] bg-[#150a0f] shrink-0">
              <h3 className="font-bold text-xs sm:text-sm font-mono-code uppercase tracking-[0.15em] text-[#ffd6e2]">
                {editingStory ? 'Sửa thông tin truyện' : 'Thêm truyện mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingStory(false)}
                className="text-[#8a717a] hover:text-[#ffd6e2] p-1 transition"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs text-[#8a717a] block font-mono-code">Tiêu đề truyện:</label>
                <input
                  type="text"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Nhập tiêu đề..."
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a] block font-mono-code">Tác giả (Tác giả nguyên tác):</label>
                <input
                  type="text"
                  value={storyAuthor}
                  onChange={(e) => setStoryAuthor(e.target.value)}
                  placeholder="Ví dụ: Tử Thời Hoan"
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                />
              </div>

              {/* Editor Info (Tên hiển thị & Avatar của Editor) */}
              <div className="p-3 bg-[#150a0f] border border-[#3d202e] space-y-3">
                <div className="flex items-center justify-between border-b border-[#2d1822] pb-1.5">
                  <span className="text-xs font-bold text-[#ffd6e2] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#d0a0b0]" />
                    <span>Thông tin Editor / Người dịch</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStoryEditorName(userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Cục Nâu');
                      setStoryEditorPhoto(userProfile?.photoURL || currentUser?.photoURL || '');
                    }}
                    className="text-[10px] text-[#8a717a] hover:text-[#ffd6e2] underline"
                    title="Lấy theo thông tin tài khoản hiện tại"
                  >
                    Lấy theo tài khoản ({userProfile?.displayName || currentUser?.displayName || 'Cục Nâu'})
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#8a717a] block font-mono-code">Tên Editor hiển thị:</label>
                  <input
                    type="text"
                    value={storyEditorName}
                    onChange={(e) => setStoryEditorName(e.target.value)}
                    placeholder="Ví dụ: Cục Nâu"
                    className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#8a717a] block font-mono-code">Ảnh đại diện Editor (Avatar):</label>
                  <div className="flex items-center gap-3 bg-[#10070a] border border-[#2d1822] p-2.5">
                    <div className="w-10 h-10 rounded-full border border-[#3d202e] overflow-hidden shrink-0 bg-black flex items-center justify-center">
                      {storyEditorPhoto ? (
                        <img
                          src={storyEditorPhoto}
                          alt="Avatar Editor"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-[#8a717a]" />
                      )}
                    </div>
                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      <label className="cursor-pointer px-2.5 py-1 bg-[#221019] hover:bg-[#321724] border border-[#5e2f46] text-[#ffd6e2] text-[11px] font-bold flex items-center gap-1 transition">
                        <Upload className="w-3 h-3" />
                        <span>{isCompressingEditorPhoto ? 'Đang nén...' : 'Tải avatar mới'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsCompressingEditorPhoto(true);
                              try {
                                const compressed = await compressImage(file, 250, 250);
                                if (compressed) {
                                  setStoryEditorPhoto(compressed);
                                }
                              } catch (err) {
                                console.error('Lỗi nén ảnh avatar:', err);
                              } finally {
                                setIsCompressingEditorPhoto(false);
                              }
                            }
                          }}
                        />
                      </label>
                      {storyEditorPhoto && (
                        <button
                          type="button"
                          onClick={() => setStoryEditorPhoto('')}
                          className="px-2 py-1 bg-[#200b12] hover:bg-[#30121b] border border-[#4d1f2a] text-[#fca5a5] text-[11px] transition"
                        >
                          Xóa avatar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a] block font-mono-code">Ảnh bìa truyện (Tải lên từ thiết bị):</label>
                <div className="flex items-center gap-4 bg-[#170d12] border border-[#2d1822] p-3">
                  {storyCoverUrl ? (
                    <div className="relative shrink-0 border border-[#3d202e] w-16 h-20 bg-black">
                      <img
                        src={storyCoverUrl}
                        alt="Xem trước ảnh bìa"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setStoryCoverUrl('')}
                        className="absolute -top-1.5 -right-1.5 bg-[#471b20] hover:bg-[#5a2329] border border-[#7a2e36] text-[#fecaca] text-[8px] font-bold uppercase p-0.5 rounded-full"
                        title="Xóa ảnh"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="shrink-0 border border-dashed border-[#2d1822] w-16 h-20 flex items-center justify-center text-[10px] text-[#6e5860] bg-black">
                      Trống
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsCompressingCover(true);
                          try {
                            const compressed = await compressImage(file);
                            if (compressed) {
                              setStoryCoverUrl(compressed);
                            }
                          } catch (err) {
                            console.error('Lỗi nén ảnh bìa:', err);
                          } finally {
                            setIsCompressingCover(false);
                          }
                        }
                      }}
                      className="block w-full text-xs text-[#8a717a]
                        file:mr-3 file:py-1 file:px-2
                        file:border file:border-[#5e2f46]
                        file:text-xs file:font-semibold
                        file:bg-[#2b1620] file:text-[#e0c0cc]
                        hover:file:bg-[#3d1e2c] file:cursor-pointer"
                    />
                    <p className="text-[10px] text-[#6e5860]">
                      {isCompressingCover ? (
                        <span className="text-[#fdba74] font-bold animate-pulse">Đang nén ảnh bìa gọn nhẹ...</span>
                      ) : (
                        'Hỗ trợ định dạng JPG, PNG, GIF. Kích thước đề xuất: 300x400px.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a] block font-mono-code">Giới thiệu:</label>
                <textarea
                  value={storySynopsis}
                  onChange={(e) => setStorySynopsis(e.target.value)}
                  placeholder="Giới thiệu về truyện..."
                  rows={4}
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                />
              </div>

              {/* Story Tags Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#8a717a] block font-mono-code">Tag truyện (cách nhau bởi dấu phẩy):</label>
                  <span className="text-[10px] text-[#6e5860] font-mono-code">Ví dụ: Đam mỹ, Xuyên sách, Ngọt sủng</span>
                </div>
                <input
                  type="text"
                  value={storyTagsInput}
                  onChange={(e) => setStoryTagsInput(e.target.value)}
                  placeholder="Ví dụ: Đam mỹ, Hiện đại, Xuyên sách, Ngọt sủng, Hài hước..."
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                />
                {storyTagsInput.trim() && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {storyTagsInput
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#221019] border border-[#4a2235] text-[#ffd6e2] text-[10px] rounded-xs font-mono-code flex items-center gap-1"
                        >
                          <span>#{tag}</span>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Tông màu truyện:</label>
                    <select
                      value={themeTone}
                      onChange={(e) => setThemeTone(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      <optgroup label="── Đơn sắc (Classic) ──">
                        <option value="dark-rose">Hồng Tối (Mặc định)</option>
                        <option value="sepia">Cổ điển (Sepia)</option>
                        <option value="emerald">Lục Bảo (Emerald)</option>
                        <option value="slate">Xám Slate (Tối giản)</option>
                        <option value="classic-dark">Tối Thuần (Classic Dark)</option>
                      </optgroup>
                      <optgroup label="── Gradient (Chuyển sắc) ──">
                        <option value="gradient-rose">Gradient Hồng Rượu (Rose Velvet)</option>
                        <option value="gradient-midnight">Gradient Đêm Thần Thoại (Midnight)</option>
                        <option value="gradient-ocean">Gradient Biển Sâu (Deep Ocean)</option>
                        <option value="gradient-emerald">Gradient Rừng Ngọc (Emerald Glow)</option>
                        <option value="gradient-sunset">Gradient Hoàng Hôn (Sunset Crimson)</option>
                        <option value="gradient-cyber">Gradient Cyber Neon (Cyber Violet)</option>
                      </optgroup>
                      <optgroup label="── Tùy biến ──">
                        <option value="custom">Tùy chỉnh màu sắc riêng</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Hiệu ứng:</label>
                    <select
                      value={readingEffect}
                      onChange={(e) => setReadingEffect(e.target.value as any)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      <option value="none">Không có hiệu ứng</option>
                      <option value="rain">Mưa rơi bóng nước</option>
                      <option value="snow">Tuyết rơi êm dịu</option>
                      <option value="glitch">Glitch nhiễu sóng nhẹ</option>
                      <option value="star">Bụi sao băng lấp lánh</option>
                      <option value="leaf">Lá phong thu rơi</option>
                      <option value="ginkgo">Lá bạch quả vàng rơi</option>
                      <option value="cherry_blossom">Cánh hoa đào rơi</option>
                      <option value="firefly">Đom đóm bay lấp lánh</option>
                      <option value="soap_bubble">Bong bóng xà phòng bay</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Font chữ tiêu đề:</label>
                    <select
                      value={customTitleFont}
                      onChange={(e) => setCustomTitleFont(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Font chữ nội dung:</label>
                    <select
                      value={customBodyFont}
                      onChange={(e) => setCustomBodyFont(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Font chữ phụ / chú thích:</label>
                    <select
                      value={customMutedFont}
                      onChange={(e) => setCustomMutedFont(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Font nút bấm / nhãn:</label>
                    <select
                      value={customBtnFont}
                      onChange={(e) => setCustomBtnFont(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Story Border & Frame Customization Section */}
              <div className="p-3 bg-[#150a0f] border border-[#3d202e] space-y-3">
                <div className="flex items-center justify-between border-b border-[#2d1822] pb-1.5">
                  <span className="text-xs font-bold text-[#ffd6e2] uppercase tracking-wider flex items-center gap-1.5 font-mono-code">
                    <span>Cài đặt đường viền & Khung trang trí (Border & Frame Styles)</span>
                  </span>
                  <span className="text-[10px] text-[#8a717a] font-mono-code">Tùy chỉnh chi tiết</span>
                </div>

                {/* Detailed Border Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* 1. Border Style */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Kiểu nét viền (Stroke Style):</label>
                    <select
                      value={storyBorderStyle}
                      onChange={(e) => setStoryBorderStyle(e.target.value as any)}
                      className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {BORDER_STYLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Border Width */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Độ dày viền (Width):</label>
                    <select
                      value={storyBorderWidth}
                      onChange={(e) => setStoryBorderWidth(e.target.value as any)}
                      className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {BORDER_WIDTH_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Border Radius & Shape */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Bo góc viền (Radius):</label>
                    <select
                      value={storyBorderRadius}
                      onChange={(e) => setStoryBorderRadius(e.target.value as any)}
                      className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {BORDER_RADIUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Corner Accents */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Họa tiết 4 góc (Corner Accents):</label>
                    <select
                      value={storyBorderCornerAccent}
                      onChange={(e) => setStoryBorderCornerAccent(e.target.value as any)}
                      className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {BORDER_CORNER_ACCENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Border Glow / Shadow */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Hiệu ứng viền (Glow / Shadow):</label>
                    <select
                      value={storyBorderGlow}
                      onChange={(e) => setStoryBorderGlow(e.target.value as any)}
                      className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {BORDER_GLOW_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {themeTone === 'custom' && (
                <div className="p-3 bg-[#13070b] border border-[#301622] space-y-3 rounded-sm">
                  <div className="border-b border-[#26131d] pb-2">
                    <p className="text-[11px] text-[#fdba74] font-bold font-mono-code">Thiết lập mã màu tùy biến cho giao diện truyện:</p>
                  </div>

                  {/* Unified Custom Colors Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* Background */}
                    <ColorField
                      label="Màu nền trang (Body)"
                      value={customBgColor}
                      onChange={setCustomBgColor}
                      allowGradient
                    />

                    {/* Card */}
                    <ColorField
                      label="Màu khung / thẻ (Card)"
                      value={customCardBgColor}
                      onChange={setCustomCardBgColor}
                    />

                    {/* Primary Button */}
                    <ColorField
                      label="Màu nút chính (Primary)"
                      value={customBtnBgColor}
                      onChange={setCustomBtnBgColor}
                      allowGradient
                    />

                    {/* Secondary Button & Container */}
                    <ColorField
                      label="Màu nút phụ & Ô chứa"
                      value={customBtnSecondaryBgColor}
                      onChange={setCustomBtnSecondaryBgColor}
                      allowGradient
                    />

                    {/* Text Primary */}
                    <ColorField
                      label="Màu chữ chính (Text)"
                      value={customTextColor}
                      onChange={setCustomTextColor}
                    />

                    {/* Text Muted */}
                    <ColorField
                      label="Màu chữ phụ (Muted)"
                      value={customTextMutedColor}
                      onChange={setCustomTextMutedColor}
                    />

                    {/* Border */}
                    <ColorField
                      label="Màu viền (Border)"
                      value={customBorderColor}
                      onChange={setCustomBorderColor}
                    />
                  </div>
                </div>
              )}

              {/* Preview Giao Diện Trực Quan (Live Preview) */}
              <div className="space-y-2 pt-2 border-t border-[#2d1822]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#ffd6e2] font-bold font-mono-code flex items-center gap-1.5 uppercase tracking-wide">
                    <Eye className="w-3.5 h-3.5 text-[#ff99bb]" />
                    <span>Xem trước giao diện truyện (Live Preview)</span>
                  </span>
                  <span className="text-[10px] text-[#8a717a] font-mono-code">
                    {themeTone === 'custom' ? 'Tùy chỉnh riêng' : themeTone} • T: {customTitleFont.replace('font-', '')} • B: {customBodyFont.replace('font-', '')} • M: {customMutedFont.replace('font-', '')} • BT: {customBtnFont.replace('font-', '')}
                  </span>
                </div>

                <div 
                  className={`p-3.5 sm:p-5 border rounded-sm transition-colors duration-150 space-y-4 shadow-inner ${customBodyFont}`}
                  style={{
                    background: activePreviewColors.bg,
                    borderColor: activePreviewColors.border,
                    color: activePreviewColors.text,
                  }}
                >
                  {/* Story Main Detail Card */}
                  <div 
                    className="p-3.5 transition-all duration-150 space-y-4 relative overflow-hidden"
                    style={{
                      background: activePreviewColors.cardBg,
                      ...getStoryBorderStyle(
                        {
                          borderStyle: storyBorderStyle,
                          borderWidth: storyBorderWidth,
                          borderRadius: storyBorderRadius,
                          borderGlow: storyBorderGlow,
                        },
                        activePreviewColors.border
                      ),
                    }}
                  >
                    <StoryCornerAccents
                      accent={storyBorderCornerAccent}
                      color={activePreviewColors.border}
                    />

                    <div className="flex flex-col sm:flex-row gap-3.5 items-start">
                      {/* Left: Cover & Editor & Action Buttons */}
                      <div className="w-full sm:w-36 shrink-0 space-y-2.5">
                        <div 
                          className="w-full h-44 flex items-center justify-center overflow-hidden relative"
                          style={{
                            background: activePreviewColors.bg,
                            ...getStoryBorderStyle(
                              {
                                borderStyle: storyBorderStyle,
                                borderWidth: 'thin',
                                borderRadius: storyBorderRadius,
                                borderGlow: 'none',
                              },
                              activePreviewColors.border
                            ),
                          }}
                        >
                          {storyCoverUrl ? (
                            <img
                              src={storyCoverUrl}
                              alt="Ảnh bìa"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className={`text-[10px] p-2 text-center opacity-70 ${customMutedFont}`} style={{ color: activePreviewColors.textMuted }}>
                              Ảnh bìa truyện
                            </span>
                          )}
                        </div>

                        {/* Editor badge */}
                        <div 
                          className="p-2 flex items-center gap-2"
                          style={{
                            background: activePreviewColors.btnSecondaryBg || activePreviewColors.bg,
                            ...getStoryBorderStyle(
                              {
                                borderStyle: storyBorderStyle,
                                borderWidth: 'thin',
                                borderRadius: storyBorderRadius,
                                borderGlow: 'none',
                              },
                              activePreviewColors.border
                            ),
                          }}
                        >
                          <div 
                            className="w-6 h-6 rounded-full border overflow-hidden shrink-0 flex items-center justify-center"
                            style={{
                              background: activePreviewColors.cardBg,
                              borderColor: activePreviewColors.border,
                            }}
                          >
                            {storyEditorPhoto ? (
                              <img src={storyEditorPhoto} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3 h-3" style={{ color: activePreviewColors.textMuted }} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`text-[9px] uppercase font-bold block leading-none opacity-75 ${customMutedFont}`} style={{ color: activePreviewColors.textMuted }}>
                              Editor:
                            </span>
                            <span className={`text-[11px] font-bold truncate block leading-tight ${customBtnFont}`} style={{ color: activePreviewColors.text }}>
                              {storyEditorName.trim() || 'Cục Nâu'}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons preview */}
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            className={`w-full py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${customBtnFont}`}
                            style={{
                              background: activePreviewColors.btnBg,
                              color: activePreviewColors.btnText,
                              ...getStoryButtonBorderStyle(
                                {
                                  borderStyle: storyBorderStyle,
                                  borderRadius: storyBorderRadius,
                                },
                                activePreviewColors.btnBorder
                              ),
                            }}
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Đọc từ đầu</span>
                          </button>
                          <button
                            type="button"
                            className={`w-full py-1.5 px-2 text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 ${customBtnFont}`}
                            style={{
                              background: activePreviewColors.btnSecondaryBg || activePreviewColors.bg,
                              color: activePreviewColors.text,
                              ...getStoryButtonBorderStyle(
                                {
                                  borderStyle: storyBorderStyle,
                                  borderRadius: storyBorderRadius,
                                },
                                activePreviewColors.border
                              ),
                            }}
                          >
                            <Bookmark className="w-3 h-3" />
                            <span>Lưu truyện</span>
                          </button>
                        </div>

                        {/* Tags Preview under Save Story button */}
                        {storyTagsInput.trim() && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {storyTagsInput
                              .split(',')
                              .map((t) => t.trim())
                              .filter((t) => t.length > 0)
                              .map((tag, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[9px] px-1.5 py-0.5 leading-tight ${customBtnFont}`}
                                  style={{
                                    background: activePreviewColors.btnSecondaryBg || activePreviewColors.bg,
                                    color: activePreviewColors.textMuted,
                                    ...getStoryBorderStyle(
                                      {
                                        borderStyle: storyBorderStyle,
                                        borderWidth: 'thin',
                                        borderRadius: storyBorderRadius,
                                        borderGlow: 'none',
                                      },
                                      activePreviewColors.border
                                    ),
                                  }}
                                >
                                  #{tag}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Title, Meta, Synopsis */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div>
                          <h3 
                            className={`text-base font-bold uppercase tracking-wide leading-snug ${customTitleFont}`}
                            style={{ color: activePreviewColors.text }}
                          >
                            {storyTitle.trim() || 'Tên bộ truyện của bạn'}
                          </h3>
                          <div 
                            className={`text-[11px] flex flex-wrap items-center gap-x-2 border-b pb-2 mt-1 ${customMutedFont}`}
                            style={{ borderColor: activePreviewColors.border, color: activePreviewColors.textMuted }}
                          >
                            <span>Tác giả: <strong style={{ color: activePreviewColors.text }}>{storyAuthor.trim() || 'Tử Thời Hoan'}</strong></span>
                            <span>•</span>
                            <span>Ngày đăng: 15/08/2026</span>
                            <span>•</span>
                            <span>Lượt xem: 1,250</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${customBodyFont}`} style={{ color: activePreviewColors.textMuted }}>
                            Giới thiệu:
                          </span>
                          <p 
                            className={`text-xs leading-relaxed line-clamp-4 opacity-90 text-justify ${customBodyFont}`}
                            style={{ color: activePreviewColors.text }}
                          >
                            {storySynopsis.trim() || 'Đây là phần giới thiệu tác phẩm hiển thị trên trang thông tin truyện. Bạn có thể kiểm tra phông chữ và độ tương phản giữa màu chữ chính với màu nền thẻ.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chapters List Section Preview */}
                    <div className="pt-3 border-t space-y-2" style={{ borderColor: activePreviewColors.border }}>
                      <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${customTitleFont}`} style={{ color: activePreviewColors.text }}>
                        <span>Danh sách chương (2)</span>
                      </div>

                      <div className="space-y-1.5">
                        <div 
                          className="p-2 border rounded-xs flex items-center justify-between text-xs"
                          style={{
                            background: activePreviewColors.btnSecondaryBg || activePreviewColors.bg,
                            borderColor: activePreviewColors.border,
                          }}
                        >
                          <span className={`font-medium ${customTitleFont}`} style={{ color: activePreviewColors.text }}>
                            Chương 1: Mở đầu câu chuyện
                          </span>
                        </div>

                        <div 
                          className="p-2 border rounded-xs flex items-center justify-between text-xs"
                          style={{
                            background: activePreviewColors.btnSecondaryBg || activePreviewColors.bg,
                            borderColor: activePreviewColors.border,
                          }}
                        >
                          <span className={`font-medium ${customTitleFont}`} style={{ color: activePreviewColors.text }}>
                            Chương 2: Đêm trăng trên đỉnh núi
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer with Action Buttons */}
            <div className="p-4 border-t border-[#2d1822] bg-[#150a0f] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreatingStory(false)}
                className="px-4 py-2 bg-[#12090c] hover:bg-[#1f1017] border border-[#2d1822] text-xs text-[#8a717a] hover:text-[#e0c0cc] font-mono-code transition"
                disabled={isCompressingCover}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isCompressingCover}
                className="px-6 py-2 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-xs text-[#ffd6e2] font-mono-code font-bold uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isCompressingCover ? 'Đang xử lý...' : (editingStory ? 'Lưu cập nhật' : 'Tạo truyện')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Upload Chapter Modal */}
      {isBulkUploadingChapter && selectedStoryForChapters && (
        <BulkChapterModal
          story={selectedStoryForChapters}
          existingChapters={chapters}
          onClose={() => setIsBulkUploadingChapter(false)}
          onSaveBatch={async (chaps) => {
            if (onSaveBatchChapters) {
              await onSaveBatchChapters(chaps);
            } else {
              for (const ch of chaps) {
                onSaveChapter(ch);
              }
            }
          }}
        />
      )}

      {/* GitHub Sync Modal - Chỉ hiển thị và cho phép với tài khoản chính */}
      {isOwnerAccount && isGithubModalOpen && (
        <div className="fixed inset-0 bg-[#060305]/95 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#12090d] border-2 border-[#5e2f46] w-full max-w-lg rounded-sm shadow-2xl flex flex-col max-h-[90vh] my-8 animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-[#2d1822] bg-[#1a0c14] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-[#7cd3ff]" />
                <h3 className="text-sm font-bold font-mono-code uppercase tracking-wider text-[#ffd6e2]">
                  Đồng bộ dữ liệu lên GitHub
                </h3>
              </div>
              <button
                onClick={() => setIsGithubModalOpen(false)}
                className="text-[#8a717a] hover:text-[#ffd6e2] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-xs text-[#a48e97] leading-relaxed">
                Tính năng này cho phép bạn ghi đè trực tiếp dữ liệu truyện, chương và bình luận hiện tại lên file dữ liệu tĩnh trong kho lưu trữ GitHub của bạn. Khi commit thành công, GitHub Pages sẽ tự động kích hoạt tiến trình dựng lại (rebuild) trang web của bạn chỉ trong ít phút!
              </p>

              <div className="space-y-3">
                {/* Owner */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#e0c0cc] mb-1 font-mono-code">
                    Tên tài khoản GitHub (Owner) <span className="text-[#ff5555]">*</span>
                  </label>
                  <input
                    type="text"
                    value={githubOwner}
                    onChange={(e) => setGithubOwner(e.target.value)}
                    placeholder="ví dụ: nva-author"
                    className="w-full bg-[#0a0508] border border-[#442334] focus:border-[#7cd3ff] focus:outline-none px-3 py-2 text-xs text-[#ffd6e2] font-mono-code rounded-xs"
                  />
                </div>

                {/* Repo */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#e0c0cc] mb-1 font-mono-code">
                    Tên kho lưu trữ (Repository) <span className="text-[#ff5555]">*</span>
                  </label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="ví dụ: doc-truyen-co-tich"
                    className="w-full bg-[#0a0508] border border-[#442334] focus:border-[#7cd3ff] focus:outline-none px-3 py-2 text-xs text-[#ffd6e2] font-mono-code rounded-xs"
                  />
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#e0c0cc] mb-1 font-mono-code">
                    Nhánh (Branch) <span className="text-[#ff5555]">*</span>
                  </label>
                  <input
                    type="text"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    placeholder="thường là main hoặc master"
                    className="w-full bg-[#0a0508] border border-[#442334] focus:border-[#7cd3ff] focus:outline-none px-3 py-2 text-xs text-[#ffd6e2] font-mono-code rounded-xs"
                  />
                </div>

                {/* File Path */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#e0c0cc] mb-1 font-mono-code">
                    Đường dẫn file dữ liệu trong repo <span className="text-[#ff5555]">*</span>
                  </label>
                  <input
                    type="text"
                    value={githubPath}
                    onChange={(e) => setGithubPath(e.target.value)}
                    placeholder="ví dụ: src/data/sampleStories.ts"
                    className="w-full bg-[#0a0508] border border-[#442334] focus:border-[#7cd3ff] focus:outline-none px-3 py-2 text-xs text-[#ffd6e2] font-mono-code rounded-xs"
                  />
                </div>

                {/* Token */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#e0c0cc] mb-1 font-mono-code flex items-center justify-between">
                    <span>GitHub Personal Access Token (PAT) <span className="text-[#ff5555]">*</span></span>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=TruyenCuStudioSync"
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="text-[10px] text-[#7cd3ff] hover:underline"
                    >
                      Tạo Token mới →
                    </a>
                  </label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#0a0508] border border-[#442334] focus:border-[#7cd3ff] focus:outline-none px-3 py-2 text-xs text-[#ffd6e2] font-mono-code rounded-xs"
                  />
                  <p className="text-[10px] text-[#8a717a] mt-1 font-mono-code leading-normal">
                    * Yêu cầu quyền <strong className="text-[#ffd6e2]">repo</strong> để có thể commit trực tiếp. Token của bạn chỉ được lưu cục bộ trong trình duyệt hiện tại.
                  </p>
                </div>

                {/* Auto Sync Toggle */}
                <div className="pt-2 border-t border-[#2d1822]">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#e0c0cc] hover:text-[#ffffff] font-mono-code select-none bg-[#102330]/20 p-3 border border-[#2b4c63]/40 rounded-xs">
                    <input
                      type="checkbox"
                      checked={githubAutoSync}
                      onChange={(e) => setGithubAutoSync(e.target.checked)}
                      className="w-4 h-4 accent-[#7cd3ff] rounded-xs cursor-pointer mt-0.5"
                    />
                    <div>
                      <span className="block font-bold text-[#7cd3ff] uppercase tracking-wider text-[11px] mb-0.5">Kích hoạt Tự động Đồng bộ</span>
                      <span className="block text-[10px] text-[#8a717a] leading-normal">
                        Tự động đẩy dữ liệu mới nhất lên GitHub (chạy nền) mỗi khi bạn lưu/chỉnh sửa hoặc xóa truyện và chương.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status Message */}
              {syncStatus !== 'idle' && (
                <div className={`p-3 border text-xs font-mono-code rounded-xs leading-relaxed ${
                  syncStatus === 'success' 
                    ? 'bg-[#15301b] border-[#347d44] text-[#a6f3b9]' 
                    : 'bg-[#3b1219] border-[#a0303e] text-[#fca6ae]'
                }`}>
                  <strong className="block mb-0.5">{syncStatus === 'success' ? '✔ THÀNH CÔNG:' : '❌ THẤT BẠI:'}</strong>
                  {syncMessage}
                </div>
              )}

              {isSyncing && (
                <div className="p-3 bg-[#102330] border border-[#2b4c63] text-xs text-[#bfe8ff] font-mono-code rounded-xs flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-[#7cd3ff] animate-spin shrink-0" />
                  <span>{syncMessage}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2d1822] bg-[#1a0c14] flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsGithubModalOpen(false)}
                className="px-4 py-2 bg-[#12090c] hover:bg-[#1f1017] border border-[#2d1822] text-xs text-[#8a717a] hover:text-[#e0c0cc] font-mono-code transition cursor-pointer"
                disabled={isSyncing}
              >
                Đóng
              </button>
              <button
                onClick={handleSyncToGithub}
                disabled={isSyncing}
                className="px-5 py-2 bg-[#102330] hover:bg-[#1a3547] border border-[#2b4c63] text-xs text-[#bfe8ff] font-mono-code font-bold uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang đồng bộ...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-3.5 h-3.5" />
                    <span>Bắt đầu đồng bộ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
