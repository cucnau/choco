import React from 'react';
import { Story, Chapter, Comment, StoryLayoutBlockId, StoryLayoutMode } from '../types';
import {
  Bookmark,
  BookOpen,
  Send,
  MessageSquare,
  Lock,
  Key,
  CheckCircle2,
  User,
  RotateCcw,
  BookmarkCheck,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Folder,
  GitCommit,
  Table,
  Columns2,
  Tag,
  LayoutList,
  Clock,
  FileText,
  Image as ImageIcon,
  Images,
  ZoomIn,
  Play,
  Pause,
  Hash,
} from 'lucide-react';
import { getStoryBorderStyle, getStoryButtonBorderStyle } from '../lib/borderStyles';

export const DEFAULT_LAYOUT_LEFT: StoryLayoutBlockId[] = [
  'cover',
  'editor_info',
  'action_buttons',
  'tags',
  'character_widget',
];

export const DEFAULT_LAYOUT_RIGHT: StoryLayoutBlockId[] = [
  'title',
  'meta',
  'synopsis',
  'progress_widget',
  'custom_widget',
  'gallery_widget',
];

export const DEFAULT_LAYOUT_BOTTOM: StoryLayoutBlockId[] = [
  'chapter_list',
  'comments',
];

export const DEFAULT_LAYOUT_SINGLE: StoryLayoutBlockId[] = [
  'cover',
  'title',
  'meta',
  'editor_info',
  'action_buttons',
  'tags',
  'synopsis',
  'gallery_widget',
  'character_widget',
  'progress_widget',
  'custom_widget',
  'chapter_list',
  'comments',
];

export interface StoryBlockRendererProps {
  blockId: StoryLayoutBlockId;
  story: Story;
  chapters: Chapter[];
  lastReadChapter: Chapter | null;
  lastReadProgress: any;
  firstChapter: Chapter | null;
  isBookmarked: boolean;
  onToggleBookmark: (storyId: string) => void;
  onSelectChapter: (chapter: Chapter) => void;
  getChapterStatus: (chap: Chapter) => {
    isUnlocked: boolean;
    isPassUnlocked: boolean;
    isAuthorOrOwner: boolean;
    isReading: boolean;
  };
  customStyles: any;
  isCustomTheme: boolean;
  tone: any;
  storyTitleFont: string;
  storyBodyFont: string;
  storyMutedFont: string;
  storyBtnFont: string;
  activeBorderColor: string;
  activeBtnBorderColor: string;
  activeBtnBgColor: string;
  cardBgColor: string;
  storyBorderObj: any;
  comments: Comment[];
  commentText: string;
  setCommentText: (val: string) => void;
  handleCommentSubmit: (e: React.FormEvent) => void;
  setLightboxImages: (imgs: any) => void;
  setLightboxCurrentIndex: (idx: number) => void;
  isStripPaused: boolean;
  setIsStripPaused: (val: boolean | ((prev: boolean) => boolean)) => void;
  isSynopsisExpanded: boolean;
  setIsSynopsisExpanded: (val: boolean) => void;
  searchChapterQuery: string;
  setSearchChapterQuery: (val: string) => void;
  selectedVolumeFilter: string | null;
  setSelectedVolumeFilter: (val: string | null) => void;
  expandedVolumes: Record<string, boolean>;
  toggleVolume: (vol: string) => void;
  editorAvatarUrl?: string;
  editorDisplayName: string;
}

export const StoryBlockRenderer: React.FC<StoryBlockRendererProps> = (props) => {
  const {
    blockId,
    story,
    chapters,
    lastReadChapter,
    lastReadProgress,
    firstChapter,
    isBookmarked,
    onToggleBookmark,
    onSelectChapter,
    getChapterStatus,
    customStyles,
    isCustomTheme,
    tone,
    storyTitleFont,
    storyBodyFont,
    storyMutedFont,
    storyBtnFont,
    activeBorderColor,
    activeBtnBorderColor,
    activeBtnBgColor,
    cardBgColor,
    storyBorderObj,
    comments,
    commentText,
    setCommentText,
    handleCommentSubmit,
    setLightboxImages,
    setLightboxCurrentIndex,
    isStripPaused,
    setIsStripPaused,
    isSynopsisExpanded,
    setIsSynopsisExpanded,
    searchChapterQuery,
    setSearchChapterQuery,
    selectedVolumeFilter,
    setSelectedVolumeFilter,
    expandedVolumes,
    toggleVolume,
    editorAvatarUrl,
    editorDisplayName,
  } = props;

  // 1. COVER BLOCK
  if (blockId === 'cover') {
    if (!story.coverUrl) return null;
    return (
      <div
        key="cover"
        className="w-full aspect-[3/4] max-w-[260px] mx-auto sm:max-w-none overflow-hidden flex justify-center items-center relative"
        style={{
          ...(isCustomTheme
            ? { background: story.customBtnSecondaryBgColor || story.customBgColor }
            : { backgroundColor: tone.inputBg }),
          ...getStoryBorderStyle(
            {
              borderStyle: 'solid',
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
    );
  }

  // 2. EDITOR INFO BLOCK
  if (blockId === 'editor_info') {
    return (
      <div
        key="editor_info"
        className={`p-2.5 flex items-center gap-2.5 ${isCustomTheme ? '' : `${tone.inputBg}`}`}
        style={{
          ...(isCustomTheme
            ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor }
            : {}),
          ...getStoryBorderStyle(
            {
              borderStyle: 'solid',
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
    );
  }

  // 3. ACTION BUTTONS BLOCK
  if (blockId === 'action_buttons') {
    return (
      <div key="action_buttons" className="space-y-2">
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
    );
  }

  // 4. TAGS BLOCK
  if (blockId === 'tags') {
    if (!story?.tags || story.tags.length === 0) return null;
    return (
      <div key="tags" className="flex flex-wrap gap-1.5 pt-1">
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
                  borderStyle: 'solid',
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
    );
  }

  // 5. CHARACTER WIDGET BLOCK
  if (blockId === 'character_widget') {
    if (!story?.showCharacterWidget || !story.characters || story.characters.length === 0) return null;
    return (
      <div
        key="character_widget"
        className={`p-3 space-y-2.5 rounded transition ${isCustomTheme ? '' : `${tone.inputBg}`}`}
        style={{
          ...(isCustomTheme
            ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor }
            : {}),
          ...getStoryBorderStyle(
            {
              borderStyle: story.borderStyle || 'solid',
              borderWidth: story.borderWidth || 'thin',
              borderRadius: story.borderRadius || 'xs',
              borderCornerAccent: story.borderCornerAccent || 'none',
              borderGlow: story.borderGlow || 'none',
            },
            activeBorderColor
          ),
        }}
      >
        <div className="flex items-center gap-1.5 border-b pb-1.5 opacity-90" style={{ borderColor: isCustomTheme ? story.customBorderColor : tone.border }}>
          <Users className="w-3.5 h-3.5 shrink-0" style={customStyles.text} />
          <span className={`text-xs font-bold uppercase tracking-wider ${storyBodyFont}`} style={customStyles.text}>
            {story.characterWidgetTitle || 'Thông tin nhân vật'}
          </span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
          {story.characters.map((char) => (
            <div key={char.id} className="flex items-start gap-2 text-xs">
              <div
                className="w-8 h-8 rounded-full border shrink-0 overflow-hidden flex items-center justify-center bg-black/20"
                style={{ borderColor: isCustomTheme ? story.customBorderColor : tone.border }}
              >
                {char.avatarUrl ? (
                  <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 opacity-60" style={customStyles.text} />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-bold ${storyBodyFont}`} style={customStyles.text}>
                    {char.name}
                  </span>
                  {char.role && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${storyBtnFont} ${isCustomTheme ? '' : `${tone.buttonBgPrimary} ${tone.text}`}`}
                      style={{
                        background: isCustomTheme ? (story.customBtnBgColor || story.customBorderColor) : undefined,
                        color: isCustomTheme ? story.customTextColor : undefined,
                      }}
                    >
                      {char.role}
                    </span>
                  )}
                </div>
                {char.description && (
                  <p className={`text-[11px] leading-relaxed opacity-80 ${storyMutedFont}`} style={customStyles.textMuted}>
                    {char.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. TITLE BLOCK
  if (blockId === 'title') {
    return (
      <h1
        key="title"
        className={`font-bold tracking-[0.02em] ${storyTitleFont} ${story.titleFontSize ? '' : 'text-lg sm:text-2xl'}`}
        style={{
          ...customStyles.text,
          ...(story.titleFontSize ? { fontSize: story.titleFontSize } : {}),
        }}
      >
        {story.title}
      </h1>
    );
  }

  // 7. META BLOCK (Tác giả, Ngày đăng, Lượt xem)
  if (blockId === 'meta') {
    return (
      <div
        key="meta"
        className={`text-xs space-y-1 border-b pb-3 ${storyMutedFont}`}
        style={isCustomTheme ? { borderColor: story.customBorderColor, color: story.customTextMutedColor } : { borderColor: tone.border, color: tone.textMuted }}
      >
        <p>Tác giả: <span className="font-semibold" style={customStyles.text}>{story.author}</span></p>
        <p>Ngày đăng: <span>{story.createdAt}</span></p>
        <p>Lượt xem: <span>{story.viewsCount}</span></p>
      </div>
    );
  }

  // 8. SYNOPSIS BLOCK
  if (blockId === 'synopsis') {
    return (
      <div key="synopsis" className="space-y-2">
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
                      ...(story.bodyFontSize ? { fontSize: story.bodyFontSize } : {}),
                    }}
                  >
                    {para}
                  </p>
                ))}

              {!isSynopsisExpanded && story.synopsis.length > 250 && (
                <div
                  className="absolute bottom-0 inset-x-0 h-16 pointer-events-none"
                  style={{
                    background: `linear-gradient(to top, ${cardBgColor} 15%, transparent 100%)`,
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
    );
  }

  // 9. PROGRESS WIDGET BLOCK
  if (blockId === 'progress_widget') {
    if (!story?.showProgressWidget) return null;
    return (
      <div
        key="progress_widget"
        className={`p-3 space-y-2 rounded transition border ${isCustomTheme ? '' : `${tone.inputBg}`}`}
        style={{
          ...(isCustomTheme
            ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor }
            : {}),
          ...getStoryBorderStyle(
            {
              borderStyle: story.borderStyle || 'solid',
              borderWidth: story.borderWidth || 'thin',
              borderRadius: story.borderRadius || 'xs',
              borderCornerAccent: story.borderCornerAccent || 'none',
              borderGlow: story.borderGlow || 'none',
            },
            activeBorderColor
          ),
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 opacity-90">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" style={customStyles.text} />
            <span className={`text-xs font-bold uppercase tracking-wider ${storyBodyFont}`} style={customStyles.text}>
              {(!story.progressWidgetTitle || story.progressWidgetTitle === 'Tiến độ bộ truyện') ? 'Tiến độ' : story.progressWidgetTitle}
            </span>
          </div>
          <span className={`text-xs font-bold font-mono ${storyBtnFont}`} style={customStyles.text}>
            {story.totalPlannedChapters && story.totalPlannedChapters > 0
              ? `${Math.min(100, Math.round((chapters.length / story.totalPlannedChapters) * 100))}%`
              : '0%'}
          </span>
        </div>

        <div
          className="w-full h-2.5 rounded-full overflow-hidden bg-black/20 border"
          style={{ borderColor: isCustomTheme ? story.customBorderColor : tone.border }}
        >
          <div
            className={`h-full transition-all duration-500 rounded-full ${isCustomTheme ? '' : tone.buttonBgPrimary}`}
            style={{
              width: `${story.totalPlannedChapters && story.totalPlannedChapters > 0
                ? Math.min(100, Math.round((chapters.length / story.totalPlannedChapters) * 100))
                : 0}%`,
              background: isCustomTheme ? (story.customBtnBgColor || story.customBorderColor) : undefined,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] opacity-90" style={customStyles.textMuted}>
          <span></span>
          <span className="font-mono">
            <strong style={customStyles.text}>{chapters.length}</strong>/{story.totalPlannedChapters || '—'} chương
          </span>
        </div>
      </div>
    );
  }

  // 10. CUSTOM CONTENT WIDGET BLOCK
  if (blockId === 'custom_widget') {
    if (!story?.showCustomWidget || (!story.customWidgetTitle && !story.customWidgetContent)) return null;
    return (
      <div
        key="custom_widget"
        className={`p-3 space-y-2 rounded transition border ${isCustomTheme ? '' : `${tone.inputBg}`}`}
        style={{
          ...(isCustomTheme
            ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor }
            : {}),
          ...getStoryBorderStyle(
            {
              borderStyle: story.borderStyle || 'solid',
              borderWidth: story.borderWidth || 'thin',
              borderRadius: story.borderRadius || 'xs',
              borderCornerAccent: story.borderCornerAccent || 'none',
              borderGlow: story.borderGlow || 'none',
            },
            activeBorderColor
          ),
        }}
      >
        {story.customWidgetTitle && (
          <div className="flex items-center gap-1.5 opacity-90 border-b pb-1.5" style={{ borderColor: isCustomTheme ? story.customBorderColor : tone.border }}>
            <FileText className="w-3.5 h-3.5 shrink-0" style={customStyles.text} />
            <span className={`text-xs font-bold uppercase tracking-wider ${storyBodyFont}`} style={customStyles.text}>
              {story.customWidgetTitle}
            </span>
          </div>
        )}
        {story.customWidgetContent && (
          <div
            className={`text-xs leading-relaxed opacity-90 whitespace-pre-wrap ${storyBodyFont}`}
            style={customStyles.text}
          >
            {story.customWidgetContent}
          </div>
        )}
      </div>
    );
  }

  // 11. GALLERY WIDGET BLOCK
  if (blockId === 'gallery_widget') {
    if (!story?.showGalleryWidget) return null;
    const isSingle = story.galleryMode === 'single' || (!story.galleryImages || story.galleryImages.length === 0);
    const singleUrl = story.gallerySingleImageUrl || (story.galleryImages && story.galleryImages[0]?.url);
    const albumImages = (story.galleryImages && story.galleryImages.length > 0)
      ? story.galleryImages
      : (singleUrl ? [{ id: 'single_img_0', url: singleUrl, caption: story.gallerySingleImageCaption }] : []);

    if (isSingle && !singleUrl) return null;
    if (!isSingle && albumImages.length === 0) return null;

    const speedClass = story.galleryAutoScrollSpeed === 'slow'
      ? 'gallery-strip-track-slow'
      : story.galleryAutoScrollSpeed === 'fast'
      ? 'gallery-strip-track-fast'
      : 'gallery-strip-track-normal';

    return (
      <div
        key="gallery_widget"
        className={`p-3 space-y-2.5 rounded transition border overflow-hidden ${isCustomTheme ? '' : `${tone.inputBg}`}`}
        style={{
          ...(isCustomTheme
            ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor }
            : {}),
          ...getStoryBorderStyle(
            {
              borderStyle: story.borderStyle || 'solid',
              borderWidth: story.borderWidth || 'thin',
              borderRadius: story.borderRadius || 'xs',
              borderCornerAccent: story.borderCornerAccent || 'none',
              borderGlow: story.borderGlow || 'none',
            },
            activeBorderColor
          ),
        }}
      >
        <div className="flex items-center justify-between border-b pb-1.5 opacity-90" style={{ borderColor: isCustomTheme ? story.customBorderColor : tone.border }}>
          <div className="flex items-center gap-1.5">
            {isSingle ? (
              <ImageIcon className="w-3.5 h-3.5 shrink-0" style={customStyles.text} />
            ) : (
              <Images className="w-3.5 h-3.5 shrink-0" style={customStyles.text} />
            )}
            <span className={`text-xs font-bold uppercase tracking-wider ${storyBodyFont}`} style={customStyles.text}>
              {story.galleryWidgetTitle || (isSingle ? 'Hình ảnh' : 'Album ảnh')}
            </span>
          </div>
          {!isSingle && albumImages.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsStripPaused(!isStripPaused)}
                title={isStripPaused ? 'Chạy tiếp' : 'Tạm dừng'}
                className="text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 opacity-85 hover:opacity-100 transition cursor-pointer"
                style={{
                  borderColor: isCustomTheme ? story.customBorderColor : tone.border,
                  color: isCustomTheme ? story.customTextColor : tone.text,
                }}
              >
                {isStripPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
                <span className="font-mono">{isStripPaused ? 'Chạy' : 'Dừng'}</span>
              </button>
            </div>
          )}
        </div>

        {isSingle && singleUrl && (
          <div className="space-y-1.5">
            <div
              className="group relative rounded overflow-hidden border cursor-pointer max-h-80 flex items-center justify-center bg-black/20"
              style={{ borderColor: isCustomTheme ? story.customBorderColor : tone.border }}
              onClick={() => {
                setLightboxImages([{ url: singleUrl, caption: story.gallerySingleImageCaption }]);
                setLightboxCurrentIndex(0);
              }}
            >
              <img
                src={singleUrl}
                alt={story.gallerySingleImageCaption || 'Story image'}
                className="w-full h-auto max-h-80 object-contain group-hover:scale-101 transition duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 text-white text-xs font-medium backdrop-blur-xs">
                <ZoomIn className="w-4 h-4" />
                <span>Phóng to xem chi tiết</span>
              </div>
            </div>
            {story.gallerySingleImageCaption && (
              <p className={`text-[11px] italic text-center opacity-85 ${storyMutedFont}`} style={customStyles.textMuted}>
                {story.gallerySingleImageCaption}
              </p>
            )}
          </div>
        )}

        {!isSingle && albumImages.length > 0 && (
          <div className="relative overflow-hidden py-1">
            <div
              className={`gallery-strip-track gallery-strip-track-moving ${speedClass} ${isStripPaused ? 'gallery-strip-paused' : ''} gap-2.5`}
            >
              {[...albumImages, ...albumImages].map((img, idx) => {
                const originalIdx = idx % albumImages.length;
                return (
                  <div
                    key={`${img.id}-${idx}`}
                    className="group relative w-36 sm:w-44 h-28 sm:h-32 shrink-0 rounded overflow-hidden border cursor-pointer bg-black/25 transition-all duration-200 hover:scale-105 hover:z-10 shadow-xs"
                    style={{ borderColor: isCustomTheme ? story.customBorderColor : tone.border }}
                    onClick={() => {
                      setLightboxImages(albumImages);
                      setLightboxCurrentIndex(originalIdx);
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.caption || `Ảnh ${originalIdx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-1.5 text-center text-white backdrop-blur-xs">
                      <ZoomIn className="w-4 h-4 mb-0.5" />
                      <span className="text-[10px] font-semibold line-clamp-2">
                        {img.caption || `Ảnh ${originalIdx + 1}`}
                      </span>
                    </div>
                    {img.caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[9px] px-1.5 py-0.5 truncate group-hover:hidden text-center">
                        {img.caption}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 12. CHAPTER LIST BLOCK
  if (blockId === 'chapter_list') {
    const sorted = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
    const volumes = Array.from(new Set(chapters.map(c => c.volumeTitle).filter(Boolean))) as string[];
    const style = story.chapterListStyle || 'standard';

    return (
      <div
        key="chapter_list"
        className="space-y-3 pt-4 border-t"
        style={customStyles.border}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className={`text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 ${storyBodyFont}`} style={customStyles.text}>
            <BookOpen className="w-4 h-4 opacity-80" />
            <span>Danh sách chương ({chapters.length})</span>
          </h3>
        </div>

        {chapters.length === 0 ? (
          <div className="p-6 text-center text-xs opacity-75" style={customStyles.textMuted}>
            Chưa có chương nào được đăng tải.
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((chap, idx) => {
              const prevChap = idx > 0 ? sorted[idx - 1] : null;
              const isNewVolume = !!(chap.volumeTitle && (!prevChap || prevChap.volumeTitle !== chap.volumeTitle));
              const isTransitionToNoVolume = !chap.volumeTitle && !!(prevChap && prevChap.volumeTitle);
              const { isUnlocked, isPassUnlocked, isAuthorOrOwner, isReading } = getChapterStatus(chap);

              return (
                <React.Fragment key={chap.id}>
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
                          {(sorted || []).filter(c => c && c.volumeTitle === chap.volumeTitle).length} chương
                        </span>
                      </div>
                    </div>
                  )}

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
                          borderStyle: 'solid',
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
                          ...(story.bodyFontSize ? { fontSize: story.bodyFontSize } : {}),
                        }}
                      >
                        {chap.title}
                      </span>

                      {isReading && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[11px] font-semibold ${storyBtnFont}`}
                          style={{
                            backgroundColor: `${activeBtnBgColor}1a`,
                            borderColor: `${activeBtnBgColor}33`,
                            color: activeBtnBgColor,
                          }}
                        >
                          <BookmarkCheck className="w-3.5 h-3.5 opacity-80" />
                          <span>Đang đọc dở ({lastReadProgress?.progressPercent || 0}%)</span>
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
                      {chap.isPasswordProtected ? (
                        (isPassUnlocked && !isAuthorOrOwner) ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[11px] font-semibold ${storyBtnFont} ${isCustomTheme ? '' : `${tone.badgeFree} ${tone.badgeFreeBorder} ${tone.badgeFreeText}`}`}
                            style={isCustomTheme ? { backgroundColor: story.customCardBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 opacity-80" />
                            <span>Đã mở Pass</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[11px] font-semibold shadow-xs ${storyBtnFont} ${isCustomTheme ? '' : `${tone.badgeLocked} ${tone.badgeLockedBorder} ${tone.badgeLockedText}`}`}
                            style={isCustomTheme ? { backgroundColor: story.customBtnBgColor || story.customCardBgColor, borderColor: story.customBorderColor, color: story.customTextColor } : {}}
                          >
                            <Key
                              className={`w-3.5 h-3.5 ${isCustomTheme ? '' : tone.badgeLockedIcon}`}
                              style={isCustomTheme ? { color: story.customTextColor } : {}}
                            />
                            <span>Có Pass</span>
                          </span>
                        )
                      ) : null}
                    </div>
                    <span className={`text-xs ${storyMutedFont}`} style={customStyles.textMuted}>{chap.createdAt}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 13. COMMENTS BLOCK
  if (blockId === 'comments') {
    return (
      <div
        key="comments"
        className="space-y-4 pt-6 border-t"
        style={customStyles.border}
      >
        <h3 className={`text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 ${storyBodyFont}`} style={customStyles.text}>
          <MessageSquare className="w-4 h-4 opacity-85" style={customStyles.textMuted} />
          <span>Bình luận ({comments.length})</span>
        </h3>

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
    );
  }

  return null;
};

export const StoryLayoutContainer: React.FC<Omit<StoryBlockRendererProps, 'blockId'>> = (props) => {
  const { story } = props;
  const layoutMode = story.storyLayoutMode || 'two_columns';

  // Lấy danh sách block cho từng vùng (hoặc dùng mặc định nếu chưa cấu hình)
  const leftBlocks = story.storyLayoutLeft || DEFAULT_LAYOUT_LEFT;
  const rightBlocks = story.storyLayoutRight || DEFAULT_LAYOUT_RIGHT;
  const bottomBlocks = story.storyLayoutBottom || DEFAULT_LAYOUT_BOTTOM;
  const singleBlocks = story.storyLayoutOrder || DEFAULT_LAYOUT_SINGLE;

  if (layoutMode === 'single_column') {
    return (
      <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
        {singleBlocks.map((blockId) => (
          <StoryBlockRenderer key={blockId} blockId={blockId} {...props} />
        ))}
      </div>
    );
  }

  if (layoutMode === 'inverted_two_columns') {
    return (
      <div className="space-y-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_240px] gap-6 items-start">
          {/* Cột chính bên trái */}
          <div className="w-full flex flex-col gap-4">
            {rightBlocks.map((blockId) => (
              <StoryBlockRenderer key={blockId} blockId={blockId} {...props} />
            ))}
          </div>

          {/* Cột phụ bên phải */}
          <div className="w-full max-w-[240px] sm:max-w-none mx-auto sm:mx-0 shrink-0 flex flex-col gap-3.5">
            {leftBlocks.map((blockId) => (
              <StoryBlockRenderer key={blockId} blockId={blockId} {...props} />
            ))}
          </div>
        </div>

        {/* Chân trang toàn chiều rộng */}
        {bottomBlocks.length > 0 && (
          <div className="space-y-6 w-full">
            {bottomBlocks.map((blockId) => (
              <StoryBlockRenderer key={blockId} blockId={blockId} {...props} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Mặc định: 'two_columns'
  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-[224px_1fr] gap-6 items-start">
        {/* Cột trái */}
        <div className="w-full max-w-[224px] sm:max-w-none mx-auto sm:mx-0 shrink-0 flex flex-col gap-3.5">
          {leftBlocks.map((blockId) => (
            <StoryBlockRenderer key={blockId} blockId={blockId} {...props} />
          ))}
        </div>

        {/* Cột phải */}
        <div className="w-full flex flex-col gap-4">
          {rightBlocks.map((blockId) => (
            <StoryBlockRenderer key={blockId} blockId={blockId} {...props} />
          ))}
        </div>
      </div>

      {/* Chân trang toàn chiều rộng */}
      {bottomBlocks.length > 0 && (
        <div className="space-y-6 w-full">
          {bottomBlocks.map((blockId) => (
            <StoryBlockRenderer key={blockId} blockId={blockId} {...props} />
          ))}
        </div>
      )}
    </div>
  );
};
