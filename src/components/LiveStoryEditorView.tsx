import React from 'react';
import {
  BookOpen,
  Bookmark,
  Plus,
  Trash2,
  Lock,
  Upload,
  Link,
  User,
  Users,
  TrendingUp,
  FileText,
  Images,
  Folder,
  UploadCloud,
  List,
  LayoutGrid,
  GitCommit,
  Table,
  Columns2,
  Tag,
  LayoutList,
  Hash,
  MessageSquare,
} from 'lucide-react';
import { StoryLayoutBlockId, StoryLayoutMode, Chapter, CharacterInfo, StoryGalleryImage } from '../types';
import { StoryCornerAccents } from '../lib/borderStyles';

interface LiveStoryEditorViewProps {
  storyLayoutMode: StoryLayoutMode;
  storyLayoutLeft: StoryLayoutBlockId[];
  storyLayoutRight: StoryLayoutBlockId[];
  storyLayoutBottom: StoryLayoutBlockId[];
  storyLayoutOrder: StoryLayoutBlockId[];
  currentCardBg: string;
  currentBtnBg: string;
  currentBtnBorder: string;
  currentBtnText: string;
  currentBtnSecondaryBg: string;
  currentBorder: string;
  currentText: string;
  currentTextMuted: string;
  currentBorderObj: any;
  borderRadius: string;
  activeBCorner: any;
  customTitleFont: string;
  customBodyFont: string;
  customMutedFont: string;
  titleFontSize: string;
  bodyFontSize: string;
  coverUrl: string;
  setCoverUrl: (url: string) => void;
  setTempCoverUrl: (url: string) => void;
  setShowCoverUrlModal: (show: boolean) => void;
  isCompressingCover: boolean;
  coverFileInputRef: React.RefObject<HTMLInputElement>;
  title: string;
  setTitle: (t: string) => void;
  author: string;
  setAuthor: (a: string) => void;
  synopsis: string;
  setSynopsis: (s: string) => void;
  initialStory?: any;
  editorAvatarUrl: string;
  setEditorAvatarUrl: (url: string) => void;
  editorName: string;
  setEditorName: (n: string) => void;
  isCompressingAvatar: boolean;
  avatarFileInputRef: React.RefObject<HTMLInputElement>;
  tags: string[];
  newTagInput: string;
  setNewTagInput: (t: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (t: string) => void;
  characters: CharacterInfo[];
  setActiveDrawerTab: (tab: any) => void;
  showProgressWidget: boolean;
  setShowProgressWidget: (show: boolean) => void;
  progressTitle: string;
  progressTotalChapters: number;
  storyChapters: Chapter[];
  showCustomWidget: boolean;
  setShowCustomWidget: (show: boolean) => void;
  customWidgetTitle: string;
  customWidgetContent: string;
  showGalleryWidget: boolean;
  setShowGalleryWidget: (show: boolean) => void;
  galleryWidgetTitle: string;
  galleryMode: 'single' | 'album';
  gallerySingleImageUrl: string;
  gallerySingleImageCaption: string;
  galleryImages: StoryGalleryImage[];
  chapterListStyle: any;
  setChapterListStyle: (style: any) => void;
  handleOpenCreateNewChapter: (volumeTitle?: string) => void;
  setIsBulkUploading: (b: boolean) => void;
  handleOpenEditChapterItem: (chap: Chapter) => void;
  setChapterToDeleteItem: (chap: Chapter) => void;
  getStoryBorderStyle: (borderConfig: any, fallbackColor: string) => React.CSSProperties;
}

export const LiveStoryEditorView: React.FC<LiveStoryEditorViewProps> = (props) => {
  const {
    storyLayoutMode,
    storyLayoutLeft,
    storyLayoutRight,
    storyLayoutBottom,
    storyLayoutOrder,
    currentCardBg,
    currentBtnBg,
    currentBtnBorder,
    currentBtnText,
    currentBtnSecondaryBg,
    currentBorder,
    currentText,
    currentTextMuted,
    currentBorderObj,
    borderRadius,
    activeBCorner,
    customTitleFont,
    customBodyFont,
    customMutedFont,
    titleFontSize,
    bodyFontSize,
    coverUrl,
    setCoverUrl,
    setTempCoverUrl,
    setShowCoverUrlModal,
    isCompressingCover,
    coverFileInputRef,
    title,
    setTitle,
    author,
    setAuthor,
    synopsis,
    setSynopsis,
    initialStory,
    editorAvatarUrl,
    setEditorAvatarUrl,
    editorName,
    setEditorName,
    isCompressingAvatar,
    avatarFileInputRef,
    tags,
    newTagInput,
    setNewTagInput,
    handleAddTag,
    handleRemoveTag,
    characters,
    setActiveDrawerTab,
    showProgressWidget,
    setShowProgressWidget,
    progressTitle,
    progressTotalChapters,
    storyChapters,
    showCustomWidget,
    setShowCustomWidget,
    customWidgetTitle,
    customWidgetContent,
    showGalleryWidget,
    setShowGalleryWidget,
    galleryWidgetTitle,
    galleryMode,
    gallerySingleImageUrl,
    gallerySingleImageCaption,
    galleryImages,
    chapterListStyle,
    setChapterListStyle,
    handleOpenCreateNewChapter,
    setIsBulkUploading,
    handleOpenEditChapterItem,
    setChapterToDeleteItem,
    getStoryBorderStyle,
  } = props;

  const renderLiveBlock = (blockId: StoryLayoutBlockId) => {
    switch (blockId) {
      case 'cover':
        return (
          <div
            id="editor-block-cover"
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
                    id="btn-upload-new-cover"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="w-full py-1.5 px-2 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] flex items-center justify-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh mới</span>
                  </button>
                  <button
                    id="btn-paste-cover-link"
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
                    id="btn-remove-cover"
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
                    id="btn-upload-cover-empty"
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
                    id="btn-paste-cover-empty"
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
        );

      case 'editor_info':
        return (
          <div
            id="editor-block-editor-info"
            className="p-3 rounded border text-xs space-y-2 font-mono"
            style={{
              background: currentCardBg,
              borderColor: currentBorder,
              color: currentText,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[10px] opacity-80" style={{ color: currentTextMuted }}>
                Người đăng / Editor
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative group/avatar shrink-0">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center"
                  style={{ borderColor: currentBorder, background: currentBtnSecondaryBg }}
                >
                  {editorAvatarUrl ? (
                    <img src={editorAvatarUrl} alt={editorName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 opacity-60" style={{ color: currentTextMuted }} />
                  )}
                </div>
                <button
                  id="btn-upload-avatar-overlay"
                  onClick={() => avatarFileInputRef.current?.click()}
                  disabled={isCompressingAvatar}
                  className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition"
                  title="Tải avatar mới"
                >
                  <Upload className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <input
                  id="input-editor-name"
                  type="text"
                  placeholder="Tên Editor..."
                  value={editorName}
                  onChange={(e) => setEditorName(e.target.value)}
                  className="w-full px-2 py-1 bg-transparent rounded border border-dashed hover:border-solid focus:border-solid transition-all font-bold text-xs focus:outline-none"
                  style={{ borderColor: currentBorder, color: currentText }}
                />
                <div className="flex items-center gap-2 mt-1">
                  <button
                    id="btn-upload-avatar"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="text-[10px] opacity-75 hover:opacity-100 flex items-center gap-1 underline"
                    style={{ color: currentTextMuted }}
                  >
                    <Upload className="w-2.5 h-2.5" />
                    <span>{editorAvatarUrl ? 'Đổi avatar' : 'Tải avatar'}</span>
                  </button>
                  {editorAvatarUrl && (
                    <button
                      id="btn-delete-avatar"
                      onClick={() => setEditorAvatarUrl('')}
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'action_buttons':
        return (
          <div id="editor-block-actions" className="flex flex-col gap-2 font-mono">
            <button
              id="btn-preview-read-first"
              disabled
              className="w-full py-2 px-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs opacity-90 cursor-default"
              style={{
                background: currentBtnBg,
                borderColor: currentBtnBorder,
                color: currentBtnText,
              }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Đọc từ đầu</span>
            </button>
            <button
              id="btn-preview-bookmark"
              disabled
              className="w-full py-1.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-2 border opacity-80 cursor-default"
              style={{
                background: currentBtnSecondaryBg,
                borderColor: currentBorder,
                color: currentText,
              }}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Theo dõi truyện</span>
            </button>
          </div>
        );

      case 'tags':
        return (
          <div id="editor-block-tags" className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: currentTextMuted }}>
                Thể loại / Thẻ tags:
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border"
                  style={{
                    background: currentBtnSecondaryBg,
                    borderColor: currentBorder,
                    color: currentText,
                  }}
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400 font-bold ml-0.5"
                    title="Xóa tag này"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1 pt-1">
              <input
                id="input-new-tag"
                type="text"
                placeholder="Thêm tag (VD: Đô thị, Tu tiên)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-2 py-1 bg-transparent rounded border text-[11px] focus:outline-none"
                style={{ borderColor: currentBorder, color: currentText }}
              />
              <button
                id="btn-add-tag"
                onClick={handleAddTag}
                className="px-2 py-1 rounded border text-[11px] font-bold hover:opacity-90 transition"
                style={{
                  background: currentBtnBg,
                  borderColor: currentBtnBorder,
                  color: currentBtnText,
                }}
              >
                + Thêm
              </button>
            </div>
          </div>
        );

      case 'character_widget':
        return (
          <div id="editor-block-characters" className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: currentTextMuted }}>
                <Users className="w-3 h-3" />
                <span>Nhân vật ({characters.length}):</span>
              </span>
              <button
                id="btn-open-character-widget-tab"
                type="button"
                onClick={() => setActiveDrawerTab('widgets')}
                className="text-[10px] font-bold px-2 py-0.5 rounded border hover:opacity-90 cursor-pointer"
                style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
              >
                Cài đặt nhân vật
              </button>
            </div>
            {characters.length === 0 ? (
              <div className="p-2.5 rounded border border-dashed text-[11px] text-center opacity-60" style={{ borderColor: currentBorder }}>
                Chưa có thông tin nhân vật
              </div>
            ) : (
              <div className="space-y-1.5">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className="p-2 rounded border flex items-center gap-2 text-xs"
                    style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                  >
                    {char.avatarUrl ? (
                      <img src={char.avatarUrl} alt={char.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0" style={{ borderColor: currentBorder }}>
                        <User className="w-4 h-4 opacity-50" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="font-bold block truncate">{char.name}</span>
                      <span className="text-[10px] opacity-70 block truncate">{char.role || char.gender || 'Nhân vật'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'title':
        return (
          <div id="editor-block-title" className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-70" style={{ color: currentTextMuted }}>
              Tên truyện (Nhấp để sửa trực tiếp):
            </span>
            <input
              id="input-story-title"
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
        );

      case 'meta':
        return (
          <div
            id="editor-block-meta"
            className={`text-xs space-y-2 border-b pb-3.5 ${customMutedFont}`}
            style={{ borderColor: currentBorder, color: currentTextMuted }}
          >
            <div className="flex items-center gap-2">
              <span className="shrink-0 font-medium">Tác giả:</span>
              <input
                id="input-story-author"
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
        );

      case 'synopsis':
        return (
          <div id="editor-block-synopsis" className="space-y-1.5">
            <span className={`text-xs font-bold uppercase tracking-wider block ${customBodyFont}`} style={{ color: currentTextMuted }}>
              Giới thiệu truyện (Nhấp để sửa):
            </span>
            <textarea
              id="textarea-story-synopsis"
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
        );

      case 'progress_widget':
        return (
          <div id="editor-block-progress" className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: currentTextMuted }}>
                <TrendingUp className="w-3 h-3" />
                <span>Widget Tiến độ:</span>
              </span>
              <button
                id="btn-toggle-progress-widget"
                type="button"
                onClick={() => setShowProgressWidget(!showProgressWidget)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
                  showProgressWidget ? '' : 'opacity-60 hover:opacity-100'
                }`}
                style={showProgressWidget ? { backgroundColor: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText } : { borderColor: currentBorder, color: currentTextMuted }}
              >
                {showProgressWidget ? '✓ Đang bật Widget' : '+ Bật Widget'}
              </button>
            </div>
            {showProgressWidget && (
              <div className="p-3 rounded border space-y-2" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                <div className="flex items-center justify-between text-xs font-bold" style={{ color: currentText }}>
                  <span>{progressTitle || 'Tiến độ dịch thuật'}</span>
                  <span className="text-[11px] font-mono">
                    {storyChapters.length} / {progressTotalChapters || storyChapters.length} chương
                    {progressTotalChapters > 0 && ` (${Math.round((storyChapters.length / progressTotalChapters) * 100)}%)`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-black/20 border" style={{ borderColor: currentBorder }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, progressTotalChapters > 0 ? (storyChapters.length / progressTotalChapters) * 100 : 100))}%`,
                      background: currentBtnBg,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'custom_widget':
        return (
          <div id="editor-block-custom-widget" className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: currentTextMuted }}>
                <FileText className="w-3 h-3" />
                <span>Widget Nội dung tùy chỉnh:</span>
              </span>
              <button
                id="btn-toggle-custom-widget"
                type="button"
                onClick={() => setShowCustomWidget(!showCustomWidget)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
                  showCustomWidget ? '' : 'opacity-60 hover:opacity-100'
                }`}
                style={showCustomWidget ? { backgroundColor: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText } : { borderColor: currentBorder, color: currentTextMuted }}
              >
                {showCustomWidget ? '✓ Đang bật Widget' : '+ Bật Widget'}
              </button>
            </div>
            {showCustomWidget && (
              <div className="p-3.5 rounded border space-y-2 font-mono text-xs" style={{ borderColor: currentBorder, background: currentBtnSecondaryBg }}>
                <span className="font-bold block text-xs" style={{ color: currentText }}>
                  {customWidgetTitle || 'Thông báo / Lời ngỏ'}
                </span>
                <p className="text-[11px] leading-relaxed whitespace-pre-wrap opacity-85" style={{ color: currentText }}>
                  {customWidgetContent || 'Chưa có nội dung tùy chỉnh. Mở tab Widgets để nhập nội dung.'}
                </p>
              </div>
            )}
          </div>
        );

      case 'gallery_widget':
        return (
          <div id="editor-block-gallery" className="space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: currentTextMuted }}>
                <Images className="w-3 h-3" />
                <span>Widget Ảnh lẻ / Album:</span>
              </span>
              <button
                id="btn-toggle-gallery-widget"
                type="button"
                onClick={() => setShowGalleryWidget(!showGalleryWidget)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
                  showGalleryWidget ? '' : 'opacity-60 hover:opacity-100'
                }`}
                style={showGalleryWidget ? { backgroundColor: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText } : { borderColor: currentBorder, color: currentTextMuted }}
              >
                {showGalleryWidget ? '✓ Đang bật Widget' : '+ Bật Widget'}
              </button>
            </div>
            {showGalleryWidget && (
              <div className="p-3.5 rounded border space-y-2.5 font-mono text-xs" style={{ borderColor: currentBorder, background: currentBtnSecondaryBg }}>
                <span className="font-bold block text-xs" style={{ color: currentText }}>
                  {galleryWidgetTitle || 'Hình ảnh & Album'}
                </span>
                {galleryMode === 'single' ? (
                  gallerySingleImageUrl ? (
                    <div className="space-y-1 text-center">
                      <img src={gallerySingleImageUrl} alt="Ảnh nghệ thuật" className="max-h-60 mx-auto rounded border object-contain" style={{ borderColor: currentBorder }} />
                      {gallerySingleImageCaption && <p className="text-[10px] italic opacity-75">{gallerySingleImageCaption}</p>}
                    </div>
                  ) : (
                    <p className="text-[11px] opacity-60 text-center py-2">Chưa có URL ảnh đơn. Mở tab Widgets để dán link.</p>
                  )
                ) : (
                  galleryImages.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {galleryImages.map((img) => (
                        <img key={img.id} src={img.url} alt={img.caption || 'Album'} className="h-24 w-24 object-cover rounded border shrink-0" style={{ borderColor: currentBorder }} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] opacity-60 text-center py-2">Album chưa có ảnh. Mở tab Widgets để thêm ảnh.</p>
                  )
                )}
              </div>
            )}
          </div>
        );

      case 'chapter_list':
        return (
          <div id="editor-block-chapters" className="space-y-3 pt-4 border-t font-mono" style={{ borderColor: currentBorder }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${customBodyFont}`} style={{ color: currentText }}>
                  <BookOpen className="w-4 h-4 opacity-80" />
                  <span>Danh sách chương ({storyChapters.length})</span>
                </h3>
                <button
                  id="btn-add-new-chapter-inline"
                  type="button"
                  onClick={() => handleOpenCreateNewChapter()}
                  className="px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1 transition shadow-xs hover:opacity-90 cursor-pointer"
                  style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm chương mới</span>
                </button>
                <button
                  id="btn-add-volume-inline"
                  type="button"
                  onClick={() => handleOpenCreateNewChapter('Quyển 1: ...')}
                  className="px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1 transition shadow-xs hover:opacity-90 cursor-pointer"
                  style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Ngắt phần/quyển</span>
                </button>
                <button
                  id="btn-bulk-upload-inline"
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
              <div className="flex items-center gap-1 p-0.5 rounded border flex-wrap" style={{ borderColor: currentBorder, background: currentCardBg }}>
                {[
                  { id: 'standard', label: 'Chuẩn', icon: List },
                  { id: 'grid', label: 'Lưới', icon: LayoutGrid },
                  { id: 'accordion', label: 'Quyển', icon: Folder },
                  { id: 'timeline', label: 'Timeline', icon: GitCommit },
                  { id: 'minimal_table', label: 'Bảng', icon: Table },
                  { id: 'book_catalog', label: 'Mục lục', icon: Columns2 },
                  { id: 'scroll_strip', label: 'Huy hiệu', icon: Tag },
                  { id: 'cards_bento', label: 'Bento', icon: LayoutList },
                  { id: 'modern_compact', label: 'Hiện đại', icon: List },
                  { id: 'numbers_only', label: 'Số tròn', icon: Hash },
                ].map((st) => {
                  const isSelected = chapterListStyle === st.id;
                  const IconComp = st.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setChapterListStyle(st.id as any)}
                      className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                        isSelected ? 'shadow-xs' : 'hover:opacity-80 opacity-70'
                      }`}
                      style={{
                        backgroundColor: isSelected ? currentBtnBg : 'transparent',
                        color: isSelected ? currentBtnText : currentText,
                      }}
                      title={`Chuyển kiểu hiển thị: ${st.label}`}
                    >
                      <IconComp className="w-3 h-3" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RENDER ALL CHAPTERS BY SELECTED STYLE */}
            {(() => {
              if (storyChapters.length === 0) {
                return (
                  <div
                    className="p-8 text-center rounded border border-dashed space-y-3"
                    style={{ borderColor: currentBorder, background: currentBtnSecondaryBg }}
                  >
                    <BookOpen className="w-8 h-8 mx-auto opacity-50" style={{ color: currentTextMuted }} />
                    <p className="text-xs" style={{ color: currentTextMuted }}>
                      Truyện chưa có chương nào. Bạn có thể nhấn <strong>Thêm chương mới</strong> hoặc <strong>Tải file tổng</strong> để nhập nhiều chương.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-2">
                  {storyChapters.map((chap) => (
                    <div
                      key={chap.id}
                      className="p-2.5 rounded border text-xs flex items-center justify-between gap-3 hover:opacity-95 transition cursor-pointer"
                      style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}
                      onClick={() => handleOpenEditChapterItem(chap)}
                    >
                      <div className="flex-1 min-w-0">
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
                        </div>
                        <div className="text-[10px] font-mono opacity-65 flex items-center gap-2 mt-0.5" style={{ color: currentTextMuted }}>
                          <span>{(chap.content || '').match(/\S+/g)?.length || 0} từ</span>
                          <span>•</span>
                          <span>Cập nhật: {chap.updatedAt || chap.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setChapterToDeleteItem(chap); }}
                          className="p-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition cursor-pointer"
                          title="Xóa chương này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        );

      case 'comments':
        return (
          <div id="editor-block-comments" className="space-y-3 pt-4 border-t font-mono" style={{ borderColor: currentBorder }}>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${customBodyFont}`} style={{ color: currentText }}>
              <MessageSquare className="w-4 h-4 opacity-80" />
              <span>Bình luận & Thảo luận</span>
            </h3>
            <div className="p-3 rounded border text-xs italic opacity-75 text-center" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentTextMuted }}>
              Khu vực bình luận độc giả sẽ xuất hiện tại đây khi xem truyện.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <article
      id="live-editor-story-article"
      className="p-6 space-y-6 relative transition-all duration-200"
      style={{
        background: currentCardBg,
        ...getStoryBorderStyle(currentBorderObj, currentBorder),
      }}
    >
      {/* Corner Accents */}
      <StoryCornerAccents accent={activeBCorner} borderStyle={currentBorderObj?.borderStyle} color={currentBorder} />

      {/* Dynamic Layout Rendering */}
      {storyLayoutMode === 'single_column' ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {storyLayoutOrder.map((blockId) => (
            <div key={blockId} className="w-full">
              {renderLiveBlock(blockId)}
            </div>
          ))}
        </div>
      ) : storyLayoutMode === 'inverted_two_columns' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_224px] gap-6 items-start">
            <div className="w-full min-w-0 flex flex-col gap-4">
              {storyLayoutRight.map((blockId) => (
                <div key={blockId} className="w-full">
                  {renderLiveBlock(blockId)}
                </div>
              ))}
            </div>
            <div className="w-full max-w-[224px] sm:max-w-none mx-auto sm:mx-0 shrink-0 flex flex-col gap-4">
              {storyLayoutLeft.map((blockId) => (
                <div key={blockId} className="w-full">
                  {renderLiveBlock(blockId)}
                </div>
              ))}
            </div>
          </div>
          {storyLayoutBottom.length > 0 && (
            <div className="space-y-6 pt-4 border-t" style={{ borderColor: currentBorder }}>
              {storyLayoutBottom.map((blockId) => (
                <div key={blockId} className="w-full">
                  {renderLiveBlock(blockId)}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-[224px_1fr] gap-6 items-start">
            <div className="w-full max-w-[224px] sm:max-w-none mx-auto sm:mx-0 shrink-0 flex flex-col gap-4">
              {storyLayoutLeft.map((blockId) => (
                <div key={blockId} className="w-full">
                  {renderLiveBlock(blockId)}
                </div>
              ))}
            </div>
            <div className="w-full min-w-0 flex flex-col gap-4">
              {storyLayoutRight.map((blockId) => (
                <div key={blockId} className="w-full">
                  {renderLiveBlock(blockId)}
                </div>
              ))}
            </div>
          </div>
          {storyLayoutBottom.length > 0 && (
            <div className="space-y-6 pt-4 border-t" style={{ borderColor: currentBorder }}>
              {storyLayoutBottom.map((blockId) => (
                <div key={blockId} className="w-full">
                  {renderLiveBlock(blockId)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
