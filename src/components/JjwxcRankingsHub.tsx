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
  RefreshCw
} from 'lucide-react';
import { 
  JjwxcNovel, 
  JJWXC_RANK_CATEGORIES, 
  initialRealRankingsData, 
  JjwxcRankCategoryConfig 
} from '../data/jjwxcRankingsData';
import { Story } from '../types';
import { extractPaletteFromImage, CanvaPalette } from '../lib/coverColorExtractor';
import { getNovelCoverUrl, getCorsCoverUrl, handleCoverError } from '../utils/coverImage';

interface JjwxcRankingsHubProps {
  currentStory?: Story | null;
  stories?: Story[];
  onSelectStory?: (story: Story) => void;
  onNavigateHome?: () => void;
}

export const JjwxcRankingsHub: React.FC<JjwxcRankingsHubProps> = ({
  stories = [],
  onSelectStory,
  onNavigateHome
}) => {
  // Bảng xếp hạng đang chọn (Mặc định Top Mọi Thời Đại)
  const [selectedRankId, setSelectedRankId] = useState<string>('zongfen');
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

      // Nếu truyện đã có sẵn văn án giới thiệu
      if (activeNovel.intro && activeNovel.intro.trim().length > 0) {
        setNovelIntro(activeNovel.intro);
        setIsLoadingIntro(false);
      } else {
        // Tự động lấy trực tiếp từ trang onebook.php của Tấn Giang
        setIsLoadingIntro(true);
        setNovelIntro('');
        fetch(`/api/jjwxc/intro/${activeNovel.novelId}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.intro) {
              setNovelIntro(data.intro);
              activeNovel.intro = data.intro;
            } else {
              setNovelIntro('Chưa có thông tin giới thiệu.');
            }
          })
          .catch(() => {
            setNovelIntro('Chưa có thông tin giới thiệu.');
          })
          .finally(() => {
            setIsLoadingIntro(false);
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
            Bảng Xếp Hạng Tấn Giang
          </h1>
          <span className="text-xs text-text-sub px-2 py-0.5 rounded bg-bg-card border border-border-custom">
            {showSavedOnly ? 'Đã lưu' : currentCategoryConfig.nameViGuide}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {savedNovelIds.length > 0 && (
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

          <button
            onClick={() => fetchRankings(true)}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-border-custom bg-bg-card hover:bg-bg-surface text-text-sub hover:text-text-main transition-all"
            title="Làm mới"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Thanh tab các BXH dạng cuộn ngang đơn giản */}
      {!showSavedOnly && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {JJWXC_RANK_CATEGORIES.map(category => {
              const isSelected = selectedRankId === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedRankId(category.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all ${
                    isSelected
                      ? 'border-emerald-500/80 bg-emerald-500/15 text-emerald-400 font-bold shadow-xs'
                      : 'border-border-custom/70 bg-bg-card/70 hover:bg-bg-card text-text-sub hover:text-text-main'
                  }`}
                >
                  {category.nameViGuide}
                </button>
              );
            })}
          </div>

          {/* Tiêu chí xếp hạng của bảng hiện tại */}
          <div className="text-[11px] text-text-sub bg-bg-card/40 px-3 py-1.5 rounded-lg border border-border-custom/60 flex items-center justify-between">
            <span>📌 {currentCategoryConfig.desc}</span>
            <span className="font-mono text-[10px] opacity-75">{currentCategoryConfig.channel}</span>
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
                        <span>{selectedRankId === 'bawang' ? 'Điểm ủng hộ: ' : 'Tích phân: '}</span>
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
      )}

      {/* Modal Chi Tiết Tối Giản khi bấm vào truyện - Tự động đồng bộ màu theo bìa (Giống Canva Photo Palette) */}
      {activeNovel && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-200"
          onClick={() => setActiveNovel(null)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150"
            style={{
              backgroundColor: activePalette?.bg || '#f4f6f4',
              borderColor: activePalette?.border || '#cbd5cc',
              color: activePalette?.text || '#1a231d',
              boxShadow: activePalette 
                ? `0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 25px -5px ${activePalette.border}` 
                : '0 25px 60px -15px rgba(0, 0, 0, 0.7)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div 
              className="p-4 border-b flex items-center justify-between"
              style={{
                backgroundColor: activePalette?.cardBg || '#ffffff',
                borderColor: activePalette?.border || '#cbd5cc'
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span 
                  className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 border"
                  style={{
                    backgroundColor: activePalette?.accent || '#2b7050',
                    borderColor: activePalette?.border || '#cbd5cc',
                    color: activePalette?.accentText || '#ffffff'
                  }}
                >
                  {activeNovel.rank}
                </span>
                <h3 
                  className="text-base font-bold truncate tracking-tight"
                  style={{ color: activePalette?.text || '#1a231d' }}
                >
                  {activeNovel.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveNovel(null)}
                className="p-1.5 rounded-lg border transition-all shrink-0 ml-2 hover:opacity-75"
                style={{
                  backgroundColor: activePalette?.cardBg || '#ffffff',
                  borderColor: activePalette?.border || '#cbd5cc',
                  color: activePalette?.textMuted || '#4f6154'
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div 
                className="p-3.5 rounded-xl border space-y-3"
                style={{
                  backgroundColor: activePalette?.cardBg || '#ffffff',
                  borderColor: activePalette?.border || '#cbd5cc'
                }}
              >
                <div className="flex gap-4">
                  <img
                    src={getNovelCoverUrl(activeNovel.novelId, activeNovel.coverUrl)}
                    alt={activeNovel.title}
                    referrerPolicy="no-referrer"
                    className="w-22 h-30 object-cover rounded-lg border shrink-0 shadow-md"
                    style={{ borderColor: activePalette?.border || '#cbd5cc' }}
                    onError={(e) => handleCoverError(e, activeNovel.novelId, activeNovel.coverUrl)}
                  />

                  <div className="space-y-1.5 flex-1 min-w-0" style={{ color: activePalette?.textMuted || '#4f6154' }}>
                    <div>
                      Tác giả: <strong style={{ color: activePalette?.text || '#1a231d' }}>{activeNovel.author}</strong>
                    </div>
                    <div>
                      Tình trạng: <span 
                        className="font-bold px-1.5 py-0.5 rounded border text-[11px]"
                        style={{
                          backgroundColor: activePalette?.isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                          borderColor: activePalette?.border || '#cbd5cc',
                          color: activePalette?.accent || '#2b7050'
                        }}
                      >
                        {activeNovel.status.includes('完结') ? 'Đã hoàn thành' : 'Đang cập nhật'}
                      </span>
                    </div>
                    {activeNovel.score && (
                      <div>
                        Điểm tích phân: <span className="font-bold" style={{ color: activePalette?.accent || '#2b7050' }}>{activeNovel.score.trim()}</span>
                      </div>
                    )}
                    {activeNovel.wordCount && (
                      <div>
                        Số chữ: <span style={{ color: activePalette?.text || '#1a231d' }}>{activeNovel.wordCount.trim()}</span>
                      </div>
                    )}

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={(e) => handleCopyChinese(activeNovel.title, activeNovel.novelId, e)}
                        className="px-2.5 py-1.5 rounded-md border font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-xs hover:opacity-90"
                        style={{
                          backgroundColor: activePalette?.accent || '#2b7050',
                          borderColor: activePalette?.border || '#cbd5cc',
                          color: activePalette?.accentText || '#ffffff'
                        }}
                      >
                        {copiedId === activeNovel.novelId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === activeNovel.novelId ? 'Đã chép' : 'Sao chép tên'}</span>
                      </button>

                      <a
                        href={activeNovel.jjwxcUrl || `https://www.jjwxc.net/onebook.php?novelid=${activeNovel.novelId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-md border font-semibold flex items-center gap-1 transition-all hover:opacity-90 shadow-xs"
                        style={{
                          backgroundColor: activePalette?.cardBg || '#ffffff',
                          borderColor: activePalette?.border || '#cbd5cc',
                          color: activePalette?.text || '#1a231d'
                        }}
                      >
                        <span>Mở link gốc</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Giới thiệu tác phẩm */}
              <div>
                <h4 className="font-bold mb-1.5" style={{ color: activePalette?.textMuted || '#4f6154' }}>
                  Giới thiệu tác phẩm:
                </h4>
                <div 
                  className="p-3.5 rounded-xl border leading-relaxed whitespace-pre-line text-xs max-h-60 overflow-y-auto font-sans shadow-inner"
                  style={{
                    backgroundColor: activePalette?.cardBg || '#ffffff',
                    borderColor: activePalette?.border || '#cbd5cc',
                    color: activePalette?.text || '#1a231d',
                    lineHeight: '1.75'
                  }}
                >
                  {isLoadingIntro ? (
                    <div className="py-4 text-center flex items-center justify-center gap-2 opacity-70">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
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
      )}
    </div>
  );
};

