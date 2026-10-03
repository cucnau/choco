import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Bookmark, 
  BookOpen, 
  X, 
  RefreshCw,
  Tag as TagIcon
} from 'lucide-react';
import { 
  JjwxcNovel, 
  JJWXC_RANK_CATEGORIES, 
  initialRealRankingsData, 
  JjwxcRankCategoryConfig 
} from '../data/jjwxcRankingsData';
import { CORE_JJWXC_TAGS, TAG_CATEGORY_TABS, CoreTagConfig } from '../data/jjwxcTagsData';
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
  stories = [],
  onSelectStory,
  onNavigateHome,
  selectedRankId: propRankId,
  selectedTagId: propTagId,
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

  // Dữ liệu bảng xếp hạng
  const [dataset, setDataset] = useState(initialRealRankingsData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'ongoing'>('all');
  
  // Modal xem chi tiết giới thiệu gốc & bảng màu tự động từ bìa truyện (Không dùng AI)
  const [activeNovel, setActiveNovel] = useState<JjwxcNovel | null>(null);
  const [activePalette, setActivePalette] = useState<CanvaPalette | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [novelIntro, setNovelIntro] = useState<string>('');
  const [isLoadingIntro, setIsLoadingIntro] = useState<boolean>(false);

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

  // Tự động phân tích màu sắc từ ảnh bìa và tải giới thiệu đầy đủ khi mở modal truyện
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
          .catch(() => {
            // Không làm gì vì đã có activeNovel.intro hiển thị sẵn
          });
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

  // Fetch dữ liệu từ backend API nếu có cập nhật
  const fetchRankings = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsLoading(true);
      const res = await fetch('/api/jjwxc/rankings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rankings) {
          setDataset(data);
        }
      }
    } catch (err) {
      console.error('Không thể tải API rankings, dùng dữ liệu bundle sẵn có:', err);
    } finally {
      if (isManualRefresh) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings(false);
  }, []);

  const toggleSaveNovel = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedNovelIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCopyChinese = (text: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

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

  // Toàn bộ truyện đã bookmark
  const allSavedNovels: JjwxcNovel[] = useMemo(() => {
    const map = new Map<string, JjwxcNovel>();
    Object.values(dataset.rankings || {}).forEach(r => {
      r.items?.forEach(n => {
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

  // Badge thứ hạng tối giản
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-bold text-xs shrink-0">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-md bg-slate-300/20 text-slate-300 border border-slate-300/40 flex items-center justify-center font-bold text-xs shrink-0">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-md bg-amber-700/20 text-amber-600 border border-amber-600/40 flex items-center justify-center font-bold text-xs shrink-0">
          3
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-md bg-bg-surface text-text-sub border border-border-custom/50 flex items-center justify-center text-xs font-semibold shrink-0">
        {rank}
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 font-mono text-text-main space-y-4">
      {/* Header thanh lịch, đơn giản */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-custom">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
          <h1 className="text-lg font-bold text-text-main tracking-tight">
            Tấn Giang (JJWXC) - Đam Mỹ
          </h1>
          <span className="text-xs text-text-sub px-2 py-0.5 rounded bg-bg-card border border-border-custom">
            {hubMode === 'tags' ? 'Tra Cứu Tag' : (showSavedOnly ? 'Đã lưu' : currentCategoryConfig.nameViGuide)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút chuyển đổi BXH / Thẻ Tag */}
          <div className="flex items-center rounded-lg border border-border-custom bg-bg-surface p-0.5 text-xs">
            <button
              onClick={() => {
                setHubMode('ranks');
                onRankingChange?.('ranks', selectedRankId);
              }}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 ${
                hubMode === 'ranks'
                  ? 'bg-bg-card text-emerald-400 font-bold shadow-xs'
                  : 'text-text-sub hover:text-text-main'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Bảng Xếp Hạng</span>
            </button>
            <button
              onClick={() => {
                setHubMode('tags');
                onRankingChange?.('tags', undefined, 'wuxianliu');
              }}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 ${
                hubMode === 'tags'
                  ? 'bg-bg-card text-emerald-400 font-bold shadow-xs'
                  : 'text-text-sub hover:text-text-main'
              }`}
            >
              <TagIcon className="w-3.5 h-3.5" />
              <span>Thẻ Tag</span>
            </button>
          </div>

          {savedNovelIds.length > 0 && hubMode === 'ranks' && (
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                showSavedOnly 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' 
                  : 'bg-bg-card border-border-custom text-text-sub hover:text-text-main'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-emerald-400' : ''}`} />
              <span>Đã lưu ({savedNovelIds.length})</span>
            </button>
          )}

          {hubMode === 'ranks' && (
            <button
              onClick={() => fetchRankings(true)}
              disabled={isLoading}
              className="p-1.5 rounded-lg border border-border-custom bg-bg-card hover:bg-bg-surface text-text-sub hover:text-text-main transition-all"
              title="Làm mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* NẾU ĐANG Ở CHẾ ĐỘ THẺ TAG */}
      {hubMode === 'tags' ? (
        <div className="space-y-4">
          {/* Thanh tìm kiếm & lọc phân loại tag */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-sub" />
              <input
                type="text"
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                placeholder="Tìm tag tiếng Trung, Hán Việt..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border-custom bg-bg-surface text-text-main focus:outline-none focus:border-emerald-500/70"
              />
              {tagSearchQuery && (
                <button 
                  onClick={() => setTagSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-sub hover:text-text-main"
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
                  className={`px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap transition-all ${
                    selectedTagCategory === tab.id
                      ? 'border-emerald-500/80 bg-emerald-500/15 text-emerald-400 font-bold'
                      : 'border-border-custom/70 bg-bg-card/70 hover:bg-bg-card text-text-sub hover:text-text-main'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lưới danh sách thẻ tag chính thức trên Tấn Giang */}
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
                  className="group rounded-xl border border-border-custom/80 bg-bg-card hover:bg-bg-surface hover:border-emerald-500/50 p-3 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-text-main group-hover:text-emerald-400 transition-colors">
                        {tag.nameVi}
                      </span>
                      <ExternalLink className="w-3 h-3 text-text-sub opacity-50 group-hover:opacity-100 group-hover:text-emerald-400 transition-all shrink-0" />
                    </div>
                    <div className="text-[11px] text-text-sub font-chinese mt-0.5">
                      {tag.zh}
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-border-custom/40 flex items-center justify-between text-[10px] text-text-sub/70">
                    <span className="capitalize">{tag.category}</span>
                    <span className="text-emerald-500 font-medium">Xem Tấn Giang ↗</span>
                  </div>
                </a>
              ))}
          </div>
        </div>
      ) : (
        <>

      {/* Thanh tab các BXH dạng cuộn ngang đơn giản */}
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
                  className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-emerald-500/80 bg-emerald-500/15 text-emerald-400 font-bold shadow-xs'
                      : 'border-border-custom/70 bg-bg-card/70 hover:bg-bg-card text-text-sub hover:text-text-main'
                  }`}
                >
                  <span>{category.nameViGuide}</span>
                  {count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-500/25 text-emerald-300' : 'bg-bg-surface text-text-sub'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tiêu chí xếp hạng của bảng hiện tại */}
          <div className="text-[11px] text-text-sub bg-bg-card/60 px-3 py-2 rounded-lg border border-border-custom/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="font-semibold text-text-main shrink-0">📌 Tiêu chí BXH:</span>
              <span className="text-emerald-400 font-medium truncate">{currentCategoryConfig.sortCriteria || currentCategoryConfig.desc}</span>
            </div>
            <span className="font-mono text-[10px] text-text-sub/70 shrink-0 self-end sm:self-auto">{currentCategoryConfig.channel}</span>
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
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border-custom bg-bg-surface text-text-main focus:outline-none focus:border-emerald-500/70"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-sub hover:text-text-main"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Lọc trạng thái */}
        <div className="flex items-center rounded-lg border border-border-custom bg-bg-surface p-0.5 text-xs shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-1 rounded transition-all ${
              statusFilter === 'all'
                ? 'bg-bg-card text-emerald-400 font-bold shadow-xs'
                : 'text-text-sub hover:text-text-main'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-2 py-1 rounded transition-all ${
              statusFilter === 'completed'
                ? 'bg-bg-card text-emerald-400 font-bold shadow-xs'
                : 'text-text-sub hover:text-text-main'
            }`}
          >
            Hoàn
          </button>
          <button
            onClick={() => setStatusFilter('ongoing')}
            className={`px-2 py-1 rounded transition-all ${
              statusFilter === 'ongoing'
                ? 'bg-bg-card text-emerald-400 font-bold shadow-xs'
                : 'text-text-sub hover:text-text-main'
            }`}
          >
            Đang ra
          </button>
        </div>
      </div>

      {/* Danh sách xếp hạng truyện tối giản */}
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

              return (
                <div
                  key={`${novel.novelId}-${index}`}
                  onClick={() => setActiveNovel(novel)}
                  className="group rounded-xl border border-border-custom/80 bg-bg-card hover:bg-bg-surface hover:border-emerald-500/50 transition-all p-3 flex items-center justify-between gap-3 cursor-pointer shadow-xs"
                >
                  {/* Thứ hạng + Bìa + Thông tin chính */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getRankBadge(novel.rank)}

                    {/* Bìa truyện */}
                    <img
                      src={getNovelCoverUrl(novel.novelId, novel.coverUrl)}
                      alt={novel.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-11 h-15 object-cover rounded-md border border-border-custom shrink-0 group-hover:scale-102 transition-transform bg-bg-surface"
                      onError={(e) => handleCoverError(e, novel.novelId, novel.coverUrl)}
                    />

                    {/* Chi tiết truyện */}
                    <div className="min-w-0 flex-1">
                      <h2 
                        className="text-sm font-bold text-text-main group-hover:text-emerald-400 transition-colors truncate"
                        title={novel.title}
                      >
                        {novel.title}
                      </h2>

                      <div className="flex items-center gap-2 text-xs text-text-sub mt-1">
                        <span className="truncate max-w-[120px]">{novel.author}</span>
                        <span>•</span>
                        <span className={novel.status.includes('完结') ? 'text-emerald-400' : 'text-blue-400'}>
                          {novel.status.includes('完结') ? 'Hoàn' : 'Đang ra'}
                        </span>
                      </div>

                      {novel.score && (
                        <div className="text-[11px] text-text-sub/80 mt-1 truncate">
                          <span>Điểm tích lũy: </span>
                          <span className="text-amber-500 font-medium">{novel.score.trim()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bookmark nhanh */}
                  <button
                    onClick={(e) => toggleSaveNovel(novel.novelId, e)}
                    className={`p-2 rounded-lg border transition-all shrink-0 ${
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

      {/* Modal Chi Tiết - Kính Mờ Cao Cấp Tự Động Thích Ứng Tone Sáng/Tối Theo Bìa Truyện */}
      {activeNovel && (() => {
        const isDarkModal = activePalette?.isDarkTheme ?? false;
        const textPrimary = isDarkModal ? '#ffffff' : '#0f172a';
        const textSecondary = isDarkModal ? '#f1f5f9' : '#334155';
        const textMuted = isDarkModal ? '#94a3b8' : '#64748b';
        const cardBg = isDarkModal ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.75)';
        const cardBorder = isDarkModal ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)';
        const statusColor = activeNovel.status.includes('完结') 
          ? (isDarkModal ? '#34d399' : '#059669') 
          : (isDarkModal ? '#60a5fa' : '#2563eb');

        return (
          <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200"
            onClick={() => setActiveNovel(null)}
          >
            <div 
              className="w-full max-w-lg rounded-2xl border overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150"
              style={{
                backgroundColor: isDarkModal ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)',
                backgroundImage: isDarkModal
                  ? `linear-gradient(135deg, ${hexToRgba(activePalette?.accent, 0.15)}, rgba(15, 23, 42, 0.78))`
                  : `linear-gradient(135deg, rgba(255, 255, 255, 0.95), ${hexToRgba(activePalette?.bg || '#ffffff', 0.45)})`,
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                borderColor: isDarkModal ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.85)',
                boxShadow: isDarkModal
                  ? '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.12)'
                  : '0 25px 60px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div 
                className="px-5 py-4 border-b flex items-center justify-between"
                style={{ borderColor: isDarkModal ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span 
                    className="w-6.5 h-6.5 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
                    style={{
                      backgroundColor: activePalette?.accent || (isDarkModal ? '#38bdf8' : '#0284c7'),
                      color: activePalette?.accentText || '#ffffff'
                    }}
                  >
                    {activeNovel.rank}
                  </span>
                  <h3 
                    className="text-base font-bold truncate tracking-tight"
                    style={{ color: textPrimary }}
                  >
                    {activeNovel.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveNovel(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    backgroundColor: isDarkModal ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    color: textMuted
                  }}
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
                {/* Thẻ thông tin truyện */}
                <div 
                  className="p-4 rounded-2xl border space-y-3 shadow-xs"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: cardBorder,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)'
                  }}
                >
                  <div className="flex gap-4">
                    <img
                      src={getNovelCoverUrl(activeNovel.novelId, activeNovel.coverUrl)}
                      alt={activeNovel.title}
                      referrerPolicy="no-referrer"
                      className="w-22 h-31 object-cover rounded-xl border shrink-0 shadow-md"
                      style={{ borderColor: isDarkModal ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }}
                      onError={(e) => handleCoverError(e, activeNovel.novelId, activeNovel.coverUrl)}
                    />

                    <div className="space-y-1.5 flex-1 min-w-0" style={{ color: textMuted }}>
                      <div>
                        <span>Tác giả: </span>
                        <strong className="font-semibold" style={{ color: textPrimary }}>
                          {activeNovel.author}
                        </strong>
                      </div>
                      <div>
                        <span>Tình trạng: </span>
                        <span 
                          className="font-semibold px-2 py-0.5 rounded-md text-[11px] inline-block border"
                          style={{
                            backgroundColor: isDarkModal ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                            borderColor: isDarkModal ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                            color: statusColor
                          }}
                        >
                          {activeNovel.status.includes('完结') ? 'Đã hoàn thành' : 'Đang cập nhật'}
                        </span>
                      </div>
                      {activeNovel.score && (
                        <div>
                          <span>Điểm tích lũy: </span>
                          <span 
                            className="font-bold tracking-wide text-sm" 
                            style={{ color: activePalette?.accent || statusColor }}
                          >
                            {activeNovel.score.trim()}
                          </span>
                        </div>
                      )}
                      {activeNovel.wordCount && (
                        <div>
                          <span>Số chữ: </span>
                          <span className="font-medium" style={{ color: textSecondary }}>
                            {activeNovel.wordCount.trim()}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <a
                          href={activeNovel.jjwxcUrl || `https://www.jjwxc.net/onebook.php?novelid=${activeNovel.novelId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl font-medium border transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          style={{
                            backgroundColor: isDarkModal ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.85)',
                            borderColor: isDarkModal ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                            color: textSecondary
                          }}
                        >
                          <span>Mở link gốc</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Giới thiệu tác phẩm */}
                <div>
                  <h4 
                    className="font-semibold mb-2 flex items-center justify-between text-xs"
                    style={{ color: textPrimary }}
                  >
                    <span>Giới thiệu tác phẩm:</span>
                    {isLoadingIntro && (
                      <span className="text-[11px] font-normal flex items-center gap-1" style={{ color: textMuted }}>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Đang tải...
                      </span>
                    )}
                  </h4>
                  <div 
                    className="p-4 rounded-2xl border leading-relaxed whitespace-pre-line text-xs max-h-72 overflow-y-auto font-sans shadow-xs selection:bg-emerald-500/20"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      color: textSecondary,
                      lineHeight: '1.85'
                    }}
                  >
                    {isLoadingIntro && !novelIntro ? (
                      <div className="py-6 text-center flex items-center justify-center gap-2" style={{ color: textMuted }}>
                        <RefreshCw className="w-4 h-4 animate-spin" />
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

