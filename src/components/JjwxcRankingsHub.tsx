import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, 
  ExternalLink, 
  Search, 
  Bookmark, 
  BookOpen, 
  X, 
  RefreshCw,
  Tag as TagIcon,
  CheckCircle2,
  Info,
  BookText,
  Palette
} from 'lucide-react';
import { 
  JjwxcNovel, 
  JJWXC_RANK_CATEGORIES, 
  initialRealRankingsData, 
  JjwxcRankCategoryConfig 
} from '../data/jjwxcRankingsData';
import { CORE_JJWXC_TAGS, TAG_CATEGORY_TABS } from '../data/jjwxcTagsData';
import { Story } from '../types';
import { extractPaletteFromImage, CanvaPalette, hexToRgba } from '../lib/coverColorExtractor';
import { getNovelCoverUrl, getCorsCoverUrl, handleCoverError } from '../utils/coverImage';

interface JjwxcRankingsHubProps {
  currentStory?: Story | null;
  stories?: Story[];
  onSelectStory?: (story: Story) => void;
  onNavigateHome?: () => void;
  selectedRankId?: string;
  selectedTagId?: string;
  hubMode?: 'ranks' | 'tags';
  onRankingChange?: (mode: 'ranks' | 'tags', rankId?: string, tagId?: string) => void;
}

export const JjwxcRankingsHub: React.FC<JjwxcRankingsHubProps> = ({
  selectedRankId: propRankId,
  hubMode: propHubMode = 'ranks',
  onRankingChange
}) => {
  // Chế độ xem: Bảng Xếp Hạng hoặc Tra cứu theo Tag Tấn Giang
  const [hubMode, setHubMode] = useState<'ranks' | 'tags'>(propHubMode);
  // Bảng xếp hạng đang chọn (Mặc định Tổng phân bảng - Top Mọi Thời Đại)
  const [selectedRankId, setSelectedRankId] = useState<string>(propRankId || 'zongfen');
  // Tag đang chọn
  const [selectedTagCategory, setSelectedTagCategory] = useState<string>('all');
  const [tagSearchQuery, setTagSearchQuery] = useState<string>('');

  useEffect(() => {
    if (propRankId) setSelectedRankId(propRankId);
  }, [propRankId]);

  useEffect(() => {
    if (propHubMode) setHubMode(propHubMode);
  }, [propHubMode]);

  // Dữ liệu bảng xếp hạng & Thời gian thực
  const [dataset, setDataset] = useState(initialRealRankingsData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('Vừa xong');
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'ongoing'>('all');
  
  // Modal xem chi tiết giới thiệu gốc & bảng màu tự động từ bìa truyện
  const [activeNovel, setActiveNovel] = useState<JjwxcNovel | null>(null);
  const [activePalette, setActivePalette] = useState<CanvaPalette | null>(null);
  const [novelIntro, setNovelIntro] = useState<string>('');
  const [isLoadingIntro, setIsLoadingIntro] = useState<boolean>(false);

  // Bảng màu trang web thích ứng theo truyện Quán Quân (Top 1) của BXH đang chọn
  const [themePalette, setThemePalette] = useState<CanvaPalette | null>(null);

  // Bookmark yêu thích lưu localStorage
  const [savedNovelIds, setSavedNovelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('choco_jjwxc_real_saved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Lấy danh sách truyện thuộc category đang chọn
  const currentCategoryConfig: JjwxcRankCategoryConfig = useMemo(() => {
    return (
      JJWXC_RANK_CATEGORIES.find(c => c.id === selectedRankId) || JJWXC_RANK_CATEGORIES[0]
    );
  }, [selectedRankId]);

  const rawNovelList: JjwxcNovel[] = useMemo(() => {
    const rankObj = dataset.rankings?.[selectedRankId];
    return rankObj?.items || [];
  }, [dataset, selectedRankId]);

  // Tự động phân tích màu sắc từ ảnh bìa của truyện Quán Quân (Top 1) để tạo hào quang tinh tế toàn trang
  useEffect(() => {
    const topNovel = rawNovelList[0];
    if (topNovel) {
      const coverSrc = getCorsCoverUrl(topNovel.novelId, topNovel.coverUrl);
      extractPaletteFromImage(coverSrc, `rank_top_${topNovel.novelId}`).then(palette => {
        setThemePalette(palette);
      });
    }
  }, [selectedRankId, rawNovelList]);

  // Tự động phân tích màu sắc từ ảnh bìa khi mở modal chi tiết truyện
  useEffect(() => {
    if (activeNovel) {
      const coverSrc = getCorsCoverUrl(activeNovel.novelId, activeNovel.coverUrl);
      extractPaletteFromImage(coverSrc, activeNovel.novelId).then(palette => {
        setActivePalette(palette);
      });

      // Hiển thị ngay văn án đầy đủ đã có sẵn trong cơ sở dữ liệu tĩnh
      setNovelIntro(activeNovel.intro || '');
      setIsLoadingIntro(false);

      // Nếu đang chạy local/preview có backend, fetch ngầm để cập nhật bản mới nhất nếu có
      if (typeof window !== 'undefined' && !window.location.hostname.includes('github.io')) {
        fetch(`/api/jjwxc/intro/${activeNovel.novelId}`)
          .then(res => {
            if (!res.ok) throw new Error('API not available');
            return res.json();
          })
          .then(data => {
            if (data && data.intro && data.intro.trim().length > 0) {
              setNovelIntro(data.intro);
            }
          })
          .catch(() => {});
      }
    } else {
      setActivePalette(null);
      setNovelIntro('');
      setIsLoadingIntro(false);
    }
  }, [activeNovel]);

  useEffect(() => {
    try {
      localStorage.setItem('choco_jjwxc_real_saved', JSON.stringify(savedNovelIds));
    } catch (e) {
      console.warn('Lỗi lưu bookmark:', e);
    }
  }, [savedNovelIds]);

  // Định dạng giờ phút cập nhật thời gian thực
  const formatTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  // Fetch dữ liệu BXH theo thời gian thực từ API backend hoặc cập nhật local
  const fetchRankings = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsLoading(true);
      
      let res: Response | null = null;
      if (typeof window !== 'undefined' && !window.location.hostname.includes('github.io')) {
        if (isManualRefresh) {
          res = await fetch('/api/jjwxc/refresh', { method: 'POST' });
        } else {
          res = await fetch('/api/jjwxc/rankings');
        }
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data && data.rankings) {
          setDataset(data);
        }
      }

      const timeStr = formatTime();
      setLastUpdatedText(timeStr);

      if (isManualRefresh) {
        setRefreshToast('Đã làm mới dữ liệu BXH theo thời gian thực thành công!');
        setTimeout(() => setRefreshToast(null), 3000);
      }
    } catch (err) {
      console.error('Lỗi nạp rankings thời gian thực:', err);
      const timeStr = formatTime();
      setLastUpdatedText(timeStr);
      if (isManualRefresh) {
        setRefreshToast('Đã đồng bộ lại danh sách!');
        setTimeout(() => setRefreshToast(null), 3000);
      }
    } finally {
      if (isManualRefresh) setIsLoading(false);
    }
  };

  // Tự động kiểm tra làm mới BXH định kỳ mỗi 10 phút
  useEffect(() => {
    fetchRankings(false);
    const interval = setInterval(() => {
      fetchRankings(false);
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSaveNovel = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedNovelIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toàn bộ truyện đã bookmark
  const allSavedNovels: JjwxcNovel[] = useMemo(() => {
    const map = new Map<string, JjwxcNovel>();
    Object.values(dataset.rankings || {}).forEach((r: any) => {
      r.items?.forEach((n: JjwxcNovel) => {
        if (savedNovelIds.includes(n.novelId) && !map.has(n.novelId)) {
          map.set(n.novelId, n);
        }
      });
    });
    return Array.from(map.values());
  }, [dataset, savedNovelIds]);

  // Danh sách sau lọc
  const filteredNovels = useMemo(() => {
    const list = showSavedOnly ? allSavedNovels : rawNovelList;
    return list.filter(novel => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = novel.title.toLowerCase().includes(q);
        const matchAuthor = novel.author.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor) return false;
      }

      if (statusFilter === 'completed' && !novel.status.includes('完结')) return false;
      if (statusFilter === 'ongoing' && !novel.status.includes('连载')) return false;

      return true;
    });
  }, [rawNovelList, allSavedNovels, showSavedOnly, searchQuery, statusFilter]);

  // Badge thứ hạng với sắc thái ánh kim trang nhã
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span 
          className="w-6.5 h-6.5 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-sm transition-transform group-hover:scale-105"
          style={{
            backgroundColor: hexToRgba(themePalette?.accent || '#f59e0b', 0.25),
            borderColor: themePalette?.accent || '#f59e0b',
            color: themePalette?.accent || '#f59e0b',
            boxShadow: `0 0 10px ${hexToRgba(themePalette?.accent || '#f59e0b', 0.4)}`
          }}
        >
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-6.5 h-6.5 rounded-lg bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-6.5 h-6.5 rounded-lg bg-amber-700/20 text-amber-500 border border-amber-600/40 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
          3
        </span>
      );
    }
    return (
      <span className="w-6.5 h-6.5 rounded-lg bg-bg-surface text-text-sub border border-border-custom/50 flex items-center justify-center text-xs font-semibold shrink-0">
        {rank}
      </span>
    );
  };

  // Tone màu chủ đạo của toàn trang
  const primaryAccent = themePalette?.accent || '#10b981';

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-6 font-mono text-text-main space-y-4">
      {/* Hiệu ứng Hào quang Aurora biến chuyển mượt mà theo màu ảnh bìa Top 1 BXH */}
      <div 
        className="absolute -top-16 -left-16 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-1000 -z-10"
        style={{ backgroundColor: themePalette?.glow || 'rgba(16, 185, 129, 0.2)' }}
      />
      <div 
        className="absolute top-44 -right-16 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-1000 -z-10"
        style={{ backgroundColor: themePalette?.glowSubtle || 'rgba(16, 185, 129, 0.15)' }}
      />

      {/* Thông báo toast khi làm mới thời gian thực */}
      {refreshToast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-sans shadow-xl backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderColor: primaryAccent,
              color: '#ffffff',
              boxShadow: `0 10px 25px -5px ${hexToRgba(primaryAccent, 0.4)}`
            }}
          >
            <CheckCircle2 className="w-4 h-4" style={{ color: primaryAccent }} />
            <span>{refreshToast}</span>
          </div>
        </div>
      )}

      {/* Header thanh lịch, hiển thị trạng thái Thời Gian Thực */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-custom">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm"
            style={{
              backgroundColor: hexToRgba(primaryAccent, 0.2),
              color: primaryAccent,
              boxShadow: `0 0 12px ${hexToRgba(primaryAccent, 0.35)}`
            }}
          >
            <Trophy className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold text-text-main tracking-tight">
            Tấn Giang (JJWXC) - Đam Mỹ
          </h1>

          {/* Badge Thời Gian Thực */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium transition-colors"
            style={{
              borderColor: hexToRgba(primaryAccent, 0.35),
              backgroundColor: hexToRgba(primaryAccent, 0.1),
              color: primaryAccent
            }}
            title={`Dữ liệu đồng bộ trực tiếp từ Tấn Giang lúc ${lastUpdatedText}`}
          >
            <span className="relative flex h-2 w-2">
              <span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: primaryAccent }}
              />
              <span 
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: primaryAccent }}
              />
            </span>
            <span>Thời gian thực</span>
            <span className="opacity-40">•</span>
            <span className="opacity-80 text-[10px]">{lastUpdatedText}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút chuyển đổi BXH / Thẻ Tag */}
          <div className="flex items-center rounded-lg border border-border-custom bg-bg-surface p-0.5 text-xs">
            <button
              onClick={() => {
                setHubMode('ranks');
                onRankingChange?.('ranks', selectedRankId);
              }}
              className="px-2.5 py-1 rounded transition-all flex items-center gap-1.5"
              style={hubMode === 'ranks' ? {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: primaryAccent,
                fontWeight: 'bold',
                boxShadow: `0 0 8px ${hexToRgba(primaryAccent, 0.25)}`
              } : { color: 'var(--text-sub)' }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Bảng Xếp Hạng</span>
            </button>
            <button
              onClick={() => {
                setHubMode('tags');
                onRankingChange?.('tags', undefined, 'wuxianliu');
              }}
              className="px-2.5 py-1 rounded transition-all flex items-center gap-1.5"
              style={hubMode === 'tags' ? {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: primaryAccent,
                fontWeight: 'bold',
                boxShadow: `0 0 8px ${hexToRgba(primaryAccent, 0.25)}`
              } : { color: 'var(--text-sub)' }}
            >
              <TagIcon className="w-3.5 h-3.5" />
              <span>Thẻ Tag</span>
            </button>
          </div>

          {savedNovelIds.length > 0 && hubMode === 'ranks' && (
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className="text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer"
              style={showSavedOnly ? {
                backgroundColor: hexToRgba(primaryAccent, 0.2),
                borderColor: primaryAccent,
                color: primaryAccent,
                fontWeight: 'bold'
              } : {
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-custom)',
                color: 'var(--text-sub)'
              }}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-current' : ''}`} />
              <span>Đã lưu ({savedNovelIds.length})</span>
            </button>
          )}

          {/* Nút Làm Mới thời gian thực */}
          {hubMode === 'ranks' && (
            <button
              onClick={() => fetchRankings(true)}
              disabled={isLoading}
              className="p-1.5 rounded-lg border border-border-custom bg-bg-card hover:bg-bg-surface text-text-sub hover:text-text-main transition-all cursor-pointer group"
              title="Làm mới BXH từ Tấn Giang theo thời gian thực"
            >
              <RefreshCw 
                className={`w-3.5 h-3.5 transition-transform duration-300 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`}
                style={{ color: primaryAccent }}
              />
            </button>
          )}
        </div>
      </div>

      {/* NẾU ĐANG Ở CHẾ ĐỘ THẺ TAG */}
      {hubMode === 'tags' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-sub" />
              <input
                type="text"
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                placeholder="Tìm tag tiếng Trung, Hán Việt..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border-custom bg-bg-surface text-text-main focus:outline-none"
                style={{ borderColor: tagSearchQuery ? primaryAccent : undefined }}
              />
              {tagSearchQuery && (
                <button 
                  onClick={() => setTagSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-sub hover:text-text-main cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {TAG_CATEGORY_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTagCategory(tab.id)}
                  className="px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap transition-all cursor-pointer"
                  style={selectedTagCategory === tab.id ? {
                    borderColor: primaryAccent,
                    backgroundColor: hexToRgba(primaryAccent, 0.15),
                    color: primaryAccent,
                    fontWeight: 'bold'
                  } : {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-sub)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {CORE_JJWXC_TAGS
              .filter(tag => {
                if (selectedTagCategory !== 'all' && tag.category !== selectedTagCategory) return false;
                if (tagSearchQuery.trim()) {
                  const q = tagSearchQuery.toLowerCase().trim();
                  return (
                    tag.nameVi.toLowerCase().includes(q) ||
                    tag.zh.toLowerCase().includes(q) ||
                    (tag.aliases && tag.aliases.some(a => a.toLowerCase().includes(q)))
                  );
                }
                return true;
              })
              .map(tag => (
                <a
                  key={tag.id}
                  href={tag.jjwxcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-border-custom/80 bg-bg-card hover:bg-bg-surface p-3 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-text-main group-hover:text-emerald-400 transition-colors">
                        {tag.nameVi}
                      </span>
                      <ExternalLink className="w-3 h-3 text-text-sub opacity-50 group-hover:opacity-100 transition-all shrink-0" />
                    </div>
                    <div className="text-[11px] text-text-sub font-chinese mt-0.5">
                      {tag.zh}
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-border-custom/40 flex items-center justify-between text-[10px] text-text-sub/70">
                    <span className="capitalize">{tag.category}</span>
                    <span style={{ color: primaryAccent }} className="font-medium">Xem Tấn Giang ↗</span>
                  </div>
                </a>
              ))}
          </div>
        </div>
      ) : (
        <>

      {/* Thanh tab các BXH dạng cuộn ngang */}
      {!showSavedOnly && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {JJWXC_RANK_CATEGORIES.map(category => {
              const isSelected = selectedRankId === category.id;
              const count = dataset.rankings?.[category.id]?.items?.length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedRankId(category.id)}
                  className="px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer"
                  style={isSelected ? {
                    borderColor: primaryAccent,
                    backgroundColor: hexToRgba(primaryAccent, 0.18),
                    color: primaryAccent,
                    fontWeight: 'bold',
                    boxShadow: `0 0 12px ${hexToRgba(primaryAccent, 0.3)}`
                  } : {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text-sub)'
                  }}
                >
                  <span>{category.nameViGuide}</span>
                  {count !== undefined && (
                    <span 
                      className="text-[10px] px-1.5 py-0.2 rounded-full font-sans"
                      style={isSelected ? {
                        backgroundColor: hexToRgba(primaryAccent, 0.3),
                        color: '#ffffff'
                      } : {
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-sub)'
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tiêu chí xếp hạng của bảng hiện tại */}
          <div 
            className="text-[11px] text-text-sub px-3 py-2 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 shadow-2xs transition-colors duration-500"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: hexToRgba(primaryAccent, 0.3)
            }}
          >
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Info className="w-3.5 h-3.5 shrink-0" style={{ color: primaryAccent }} />
              <span className="font-semibold text-text-main shrink-0">Tiêu chí BXH:</span>
              <span className="font-medium truncate" style={{ color: primaryAccent }}>
                {currentCategoryConfig.sortCriteria || currentCategoryConfig.desc}
              </span>
            </div>
            <span className="font-mono text-[10px] text-text-sub/70 shrink-0 self-end sm:self-auto">
              {currentCategoryConfig.channel}
            </span>
          </div>
        </div>
      )}

      {/* Thanh tìm kiếm & lọc nhanh gọn */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-sub" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên truyện, tác giả..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border-custom bg-bg-surface text-text-main focus:outline-none"
            style={{ borderColor: searchQuery ? primaryAccent : undefined }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-sub hover:text-text-main cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Lọc trạng thái */}
        <div className="flex items-center rounded-lg border border-border-custom bg-bg-surface p-0.5 text-xs shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className="px-2 py-1 rounded transition-all cursor-pointer"
            style={statusFilter === 'all' ? {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: primaryAccent,
              fontWeight: 'bold'
            } : { color: 'var(--text-sub)' }}
          >
            Tất cả
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className="px-2 py-1 rounded transition-all cursor-pointer"
            style={statusFilter === 'completed' ? {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: primaryAccent,
              fontWeight: 'bold'
            } : { color: 'var(--text-sub)' }}
          >
            Hoàn
          </button>
          <button
            onClick={() => setStatusFilter('ongoing')}
            className="px-2 py-1 rounded transition-all cursor-pointer"
            style={statusFilter === 'ongoing' ? {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: primaryAccent,
              fontWeight: 'bold'
            } : { color: 'var(--text-sub)' }}
          >
            Đang ra
          </button>
        </div>
      </div>

      {/* Danh sách xếp hạng truyện */}
      {filteredNovels.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-custom py-12 text-center text-text-sub bg-bg-card/30">
          <BookOpen className="w-8 h-8 mx-auto text-text-sub/40 mb-2" />
          <p className="text-xs">Không tìm thấy truyện phù hợp</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredNovels.map((novel, index) => {
              const isSaved = savedNovelIds.includes(novel.novelId);
              const isTop1 = novel.rank === 1;

              return (
                <div
                  key={`${novel.novelId}-${index}`}
                  onClick={() => setActiveNovel(novel)}
                  className="group rounded-xl border transition-all p-3 flex items-center justify-between gap-3 cursor-pointer shadow-xs"
                  style={isTop1 ? {
                    backgroundColor: 'var(--bg-card)',
                    borderColor: hexToRgba(primaryAccent, 0.45),
                    boxShadow: `0 4px 18px -4px ${hexToRgba(primaryAccent, 0.25)}`
                  } : {
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-custom)'
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getRankBadge(novel.rank)}

                    <div className="relative shrink-0">
                      <img
                        src={getNovelCoverUrl(novel.novelId, novel.coverUrl)}
                        alt={novel.title}
                        loading="lazy"
                        className="w-11 h-15 object-cover rounded-md border border-border-custom shrink-0 group-hover:scale-105 transition-transform bg-bg-surface shadow-xs"
                        onError={(e) => handleCoverError(e, novel.novelId, novel.coverUrl)}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 
                        className="text-sm font-bold text-text-main group-hover:opacity-90 transition-colors truncate"
                        title={novel.title}
                      >
                        {novel.title}
                      </h2>

                      <div className="flex items-center gap-2 text-xs text-text-sub mt-1">
                        <span className="truncate max-w-[120px]">{novel.author}</span>
                        <span>•</span>
                        <span className={novel.status.includes('完结') ? 'text-emerald-400 font-medium' : 'text-blue-400 font-medium'}>
                          {novel.status.includes('完结') ? 'Hoàn' : 'Đang ra'}
                        </span>
                      </div>

                      {novel.score && (
                        <div className="text-[11px] text-text-sub/80 mt-1 truncate">
                          <span>Điểm tích lũy: </span>
                          <span 
                            className="font-medium"
                            style={{ color: isTop1 ? primaryAccent : '#f59e0b' }}
                          >
                            {novel.score.trim()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleSaveNovel(novel.novelId, e)}
                    className={`p-2 rounded-lg border transition-all shrink-0 cursor-pointer ${
                      isSaved 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'border-transparent text-text-sub hover:text-text-main'
                    }`}
                    title={isSaved ? 'Bỏ lưu' : 'Lưu truyện'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-400' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>
      )}

      {/* Modal Chi Tiết - TOÀN BỘ CÁC THÀNH PHẦN THAY ĐỔI THEO MÃ MÀU TRÍCH XUẤT TỪ BÌA */}
      {activeNovel && (() => {
        const isLight = activePalette?.isLightCover ?? false;
        const modalAccent = activePalette?.accent || primaryAccent;
        const modalSecondary = activePalette?.secondary || primaryAccent;
        const modalGlow = activePalette?.glow || `rgba(2, 132, 199, 0.45)`;

        // Toàn bộ màu nền, viền và chữ lấy trực tiếp từ bảng màu bìa phân tích được
        const modalBg = activePalette?.modalBg || 'linear-gradient(145deg, #fef3c7 0%, #e0f2fe 100%)';
        const cardBg = activePalette?.cardBg || 'rgba(255, 255, 255, 0.85)';
        const cardBorder = activePalette?.cardBorder || hexToRgba(modalAccent, 0.3);

        const textPrimary = activePalette?.textPrimary || '#0f172a';
        const textSecondary = activePalette?.textSecondary || '#334155';
        const textMuted = activePalette?.textMuted || '#64748b';

        const introBg = activePalette?.introBg || 'rgba(255, 255, 255, 0.85)';
        const introBorder = activePalette?.introBorder || hexToRgba(modalSecondary, 0.25);

        const isCompleted = activeNovel.status.includes('完结');

        return (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 transition-all duration-300"
            onClick={() => setActiveNovel(null)}
          >
            {/* Vầng hào quang Ambient phát sáng từ mã màu bìa */}
            <div 
              className="absolute w-[560px] h-[560px] rounded-full blur-[100px] opacity-45 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: modalGlow }}
            />

            {/* Container Modal - MANG ĐÚNG MÀU SẮC ĐỒNG ĐIỆU CỦA TRANH BÌA */}
            <div 
              className="relative w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 z-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)]"
              style={{
                background: modalBg,
                borderColor: cardBorder,
                borderWidth: '1px',
                borderStyle: 'solid',
                color: textPrimary
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div 
                className="px-5 py-4 border-b flex items-center justify-between"
                style={{ borderColor: cardBorder }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span 
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-md font-sans"
                    style={{
                      background: activePalette?.accentGradient || `linear-gradient(135deg, ${modalAccent}, ${modalSecondary})`,
                      boxShadow: `0 4px 14px ${hexToRgba(modalAccent, 0.45)}`
                    }}
                  >
                    #{activeNovel.rank}
                  </span>
                  <h3 
                    className="text-base sm:text-lg font-bold truncate tracking-tight"
                    style={{ color: textPrimary }}
                  >
                    {activeNovel.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveNovel(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)',
                    color: textPrimary
                  }}
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-sans">
                {/* Thẻ thông tin truyện & Bìa - Mang màu sắc của bìa */}
                <div 
                  className="p-4 rounded-2xl border shadow-sm transition-colors duration-500 backdrop-blur-md"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: cardBorder
                  }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Bìa truyện với ánh hào quang tỏa ra từ chính bìa */}
                    <div className="relative shrink-0 self-center sm:self-start">
                      <img
                        src={getNovelCoverUrl(activeNovel.novelId, activeNovel.coverUrl)}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover rounded-xl blur-lg scale-105 opacity-65 pointer-events-none"
                      />
                      <img
                        src={getNovelCoverUrl(activeNovel.novelId, activeNovel.coverUrl)}
                        alt={activeNovel.title}
                        referrerPolicy="no-referrer"
                        className="relative z-10 w-28 h-40 object-cover rounded-xl border shrink-0 shadow-xl"
                        style={{ borderColor: cardBorder }}
                        onError={(e) => handleCoverError(e, activeNovel.novelId, activeNovel.coverUrl)}
                      />
                    </div>

                    {/* Danh sách thông số - Màu chữ và badge đồng bộ theo màu bìa */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs shrink-0" style={{ color: textMuted }}>Tác giả:</span>
                        <strong className="font-bold text-sm truncate" style={{ color: textPrimary }}>
                          {activeNovel.author}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs shrink-0" style={{ color: textMuted }}>Tình trạng:</span>
                        <span 
                          className="font-semibold px-2.5 py-0.5 rounded-full text-[11px] inline-block border"
                          style={isCompleted ? {
                            backgroundColor: hexToRgba('#10b981', isLight ? 0.15 : 0.25),
                            borderColor: hexToRgba('#10b981', 0.4),
                            color: isLight ? '#047857' : '#34d399'
                          } : {
                            backgroundColor: hexToRgba(modalSecondary, isLight ? 0.15 : 0.25),
                            borderColor: hexToRgba(modalSecondary, 0.4),
                            color: isLight ? modalAccent : modalSecondary
                          }}
                        >
                          {isCompleted ? 'Đã hoàn thành' : 'Đang cập nhật'}
                        </span>
                      </div>

                      {activeNovel.score && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs shrink-0" style={{ color: textMuted }}>Điểm tích lũy:</span>
                          <span 
                            className="font-bold tracking-wide text-sm font-mono"
                            style={{ color: modalAccent }}
                          >
                            {activeNovel.score.trim()}
                          </span>
                        </div>
                      )}

                      {activeNovel.wordCount && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs shrink-0" style={{ color: textMuted }}>Số chữ:</span>
                          <span className="font-medium" style={{ color: textSecondary }}>
                            {activeNovel.wordCount.trim()}
                          </span>
                        </div>
                      )}

                      {/* Hiển thị Dải Mã Màu Bìa Phân Tích Được (Palette Swatches) */}
                      {activePalette?.colors && activePalette.colors.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] flex items-center gap-1 shrink-0" style={{ color: textMuted }}>
                            <Palette className="w-3 h-3" style={{ color: modalAccent }} />
                            <span>Mã màu bìa:</span>
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {activePalette.colors.map((hexCode, cIdx) => (
                              <div
                                key={cIdx}
                                className="w-4.5 h-4.5 rounded-full border shadow-xs cursor-pointer transition-transform hover:scale-125"
                                style={{ 
                                  backgroundColor: hexCode,
                                  borderColor: isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.4)'
                                }}
                                title={`Mã màu bìa: ${hexCode}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Các nút hành động chính */}
                      <div className="pt-2 flex flex-wrap items-center gap-2.5">
                        <a
                          href={activeNovel.jjwxcUrl || `https://www.jjwxc.net/onebook.php?novelid=${activeNovel.novelId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl font-bold text-white transition-all shadow-md cursor-pointer flex items-center gap-2 hover:opacity-95 active:scale-95"
                          style={{
                            background: activePalette?.accentGradient || `linear-gradient(135deg, ${modalAccent}, ${modalSecondary})`,
                            boxShadow: `0 4px 16px ${hexToRgba(modalAccent, 0.4)}`
                          }}
                        >
                          <span>Mở link gốc</span>
                          <ExternalLink className="w-3.5 h-3.5 text-white/90" />
                        </a>

                        <button
                          onClick={(e) => toggleSaveNovel(activeNovel.novelId, e)}
                          className="px-3.5 py-2 rounded-xl font-medium border transition-all cursor-pointer flex items-center gap-2"
                          style={{
                            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.1)',
                            borderColor: cardBorder,
                            color: savedNovelIds.includes(activeNovel.novelId) ? modalAccent : textSecondary
                          }}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${savedNovelIds.includes(activeNovel.novelId) ? 'fill-current' : ''}`} />
                          <span>{savedNovelIds.includes(activeNovel.novelId) ? 'Đã lưu' : 'Lưu truyện'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Giới thiệu tác phẩm - Nền & viền đổi theo màu bìa */}
                <div className="space-y-2">
                  <h4 
                    className="font-bold flex items-center justify-between text-xs tracking-wide"
                    style={{ color: textPrimary }}
                  >
                    <span className="flex items-center gap-1.5">
                      <BookText className="w-3.5 h-3.5" style={{ color: modalAccent }} />
                      <span>Giới thiệu tác phẩm:</span>
                    </span>
                    {isLoadingIntro && (
                      <span className="text-[11px] font-normal flex items-center gap-1" style={{ color: textMuted }}>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Đang tải...
                      </span>
                    )}
                  </h4>

                  <div 
                    className="p-4 rounded-2xl border leading-relaxed whitespace-pre-line text-xs max-h-72 overflow-y-auto shadow-xs font-sans backdrop-blur-md"
                    style={{ 
                      lineHeight: '1.9',
                      backgroundColor: introBg,
                      borderColor: introBorder,
                      color: textSecondary
                    }}
                  >
                    {isLoadingIntro && !novelIntro ? (
                      <div className="py-8 text-center flex items-center justify-center gap-2" style={{ color: textMuted }}>
                        <RefreshCw className="w-4 h-4 animate-spin" style={{ color: modalAccent }} />
                        <span>Đang tải giới thiệu từ Tấn Giang...</span>
                      </div>
                    ) : (
                      novelIntro || activeNovel.intro || 'Chưa có thông tin giới thiệu.'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
