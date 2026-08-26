export interface Chapter {
  id: string;
  storyId: string;
  chapterNumber: number;
  title: string;
  content: string; // Nội dung chữ
  views: number;
  createdAt: string;
  updatedAt: string;
  isLocked?: boolean; // Chương có bị khóa Chucu không
  unlockPrice?: number; // Số Chucu cần để mở khóa (mặc định min 1 nếu khóa, ví dụ 1, 2, 5...)
  isPasswordProtected?: boolean; // Chương có đặt mật khẩu (Pass) không
  password?: string; // Mật khẩu đọc chương
  passwordHint?: string; // Gợi ý câu hỏi / pass
  volumeTitle?: string; // Tên phần / quyển / ngắt phần (ví dụ: "Quyển 1: Đêm đông sống lại")
}

export interface Comment {
  id: string;
  storyId: string;
  chapterId?: string;
  paragraphIndex?: number;
  paragraphSnippet?: string;
  userName: string;
  userUid?: string;
  userPhoto?: string;
  content: string;
  createdAt: string;
  parentCommentId?: string; // ID của bình luận cha nếu đây là phản hồi (reply)
  parentCommentAuthorUid?: string; // UID của người được phản hồi để gửi thông báo
}

export interface Notification {
  id: string;
  userId: string; // Người nhận thông báo (UID)
  title: string;
  content: string;
  type: 'new_chapter' | 'new_comment' | 'reply_comment';
  storyId: string;
  chapterId?: string;
  chapterNumber?: number;
  paragraphIndex?: number;
  commentId?: string;
  senderName: string;
  senderPhoto?: string;
  isRead: boolean;
  createdAt: string; // ISOString
}

export interface CharacterInfo {
  id: string;
  name: string;
  role?: string; // Tùy chọn: Nam chính, Nữ chính, Phản diện, Sư phụ, v.v.
  avatarUrl?: string; // Tùy chọn: URL ảnh đại diện nhân vật
  description?: string; // Tùy chọn: Mô tả ngắn nhân vật
}

export interface StoryGalleryImage {
  id: string;
  url: string;
  caption?: string; // Chú thích cho từng ảnh
}

export interface Story {
  id: string;
  title: string;
  coverUrl: string;
  author: string;
  authorUid?: string; // UID của Editor/Tác giả sở hữu truyện
  authorEmail?: string; // Email của Editor/Tác giả sở hữu truyện
  editorName?: string; // Tên hiển thị của Editor
  editorPhoto?: string; // Ảnh đại diện của Editor
  synopsis: string; // Tóm tắt bài / truyện
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  themeTone?: string; // Tông màu truyện ('dark-rose' | 'sepia' | 'emerald' | 'slate' | 'classic-dark' | 'gradient-rose' | 'gradient-midnight' | 'gradient-ocean' | 'gradient-emerald' | 'gradient-sunset' | 'gradient-cyber' | 'custom')
  defaultFont?: string; // Font chữ mặc định của truyện
  customTitleFont?: string; // Font chữ cho tiêu đề truyện / tiêu đề chương
  customBodyFont?: string; // Font chữ cho nội dung / chữ thường
  customMutedFont?: string; // Font chữ phụ / chú thích / tác giả / ngày tháng
  customBtnFont?: string; // Font chữ cho các nút bấm / huy hiệu / nhãn trạng thái
  titleFontSize?: string; // Cỡ chữ tiêu đề truyện (ví dụ: '18px', '20px', '24px', '28px', '32px')
  bodyFontSize?: string; // Cỡ chữ nội dung / tóm tắt / danh sách chương (ví dụ: '12px', '14px', '16px', '18px')
  customBgColor?: string; // Màu nền trang đọc truyện (Màu đơn hoặc Gradient CSS)
  customCardBgColor?: string; // Màu nền khung truyện/thẻ truyện (Màu đơn hoặc Gradient CSS)
  customTextColor?: string; // Màu chữ chính
  customTextMutedColor?: string; // Màu chữ phụ/nhỏ
  customBorderColor?: string; // Màu đường viền khung
  customBtnBgColor?: string; // Màu nền nút bấm chính (Màu đơn hoặc Gradient CSS)
  customBtnSecondaryBgColor?: string; // Màu nền nút phụ / ô editor / danh sách chương (Màu đơn hoặc Gradient CSS)
  tags?: string[]; // Danh sách các tag thể loại của truyện

  // Widget thông tin nhân vật (Character Info Widget)
  showCharacterWidget?: boolean; // Editor chọn bật/tắt hiển thị Widget nhân vật
  characterWidgetTitle?: string; // Tiêu đề ô Widget (Mặc định: "Thông tin nhân vật")
  characters?: CharacterInfo[]; // Danh sách các nhân vật trong widget

  // Widget tiến độ truyện (Story Progress Widget)
  showProgressWidget?: boolean; // Editor chọn bật/tắt hiển thị Widget tiến độ
  progressWidgetTitle?: string; // Tiêu đề ô Widget (Mặc định: "Tiến độ hoàn thành" hoặc "Tiến độ bộ truyện")
  totalPlannedChapters?: number; // Tổng số chương dự kiến của bộ truyện

  // Widget nội dung tùy chỉnh (Custom Content Widget)
  showCustomWidget?: boolean; // Editor chọn bật/tắt hiển thị Widget tùy chỉnh
  customWidgetTitle?: string; // Tiêu đề ô Widget tự đặt
  customWidgetContent?: string; // Nội dung ô Widget tự viết

  // Widget ảnh lẻ / Album ảnh di chuyển (Gallery / Single Image / Moving Album Widget)
  showGalleryWidget?: boolean; // Editor chọn bật/tắt hiển thị Widget ảnh lẻ / album
  galleryWidgetTitle?: string; // Tiêu đề ô Widget ảnh/album
  galleryMode?: 'single' | 'album'; // Kiểu: 'single' (Ảnh lẻ) | 'album' (Album dải ảnh di chuyển)
  gallerySingleImageUrl?: string; // Đường dẫn ảnh lẻ
  gallerySingleImageCaption?: string; // Chú thích cho ảnh lẻ
  galleryImages?: StoryGalleryImage[]; // Danh sách các ảnh trong album
  galleryAutoScrollSpeed?: 'slow' | 'normal' | 'fast'; // Tốc độ di chuyển dải album (chậm/vừa/nhanh)

  // Kiểu trình bày danh sách chương (Chapter List Display Style)
  chapterListStyle?: 'standard' | 'grid' | 'accordion' | 'timeline' | 'minimal_table' | 'book_catalog' | 'scroll_strip' | 'cards_bento' | 'modern_compact' | 'numbers_only';

  // Tùy chỉnh Bố cục & Thứ tự các phần trong trang truyện (Story Page Layout & Block Reordering)
  storyLayoutMode?: StoryLayoutMode; // 'two_columns' (2 Cột chuẩn) | 'single_column' (1 Cột) | 'inverted_two_columns' (2 Cột đảo)
  storyLayoutLeft?: StoryLayoutBlockId[]; // Danh sách khối ở cột trái
  storyLayoutRight?: StoryLayoutBlockId[]; // Danh sách khối ở cột phải
  storyLayoutBottom?: StoryLayoutBlockId[]; // Danh sách khối ở phần dưới (chân trang)
  storyLayoutOrder?: StoryLayoutBlockId[]; // Danh sách thứ tự khối khi dùng chế độ 1 Cột (Single Column)

  readingEffect?: 'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'ginkgo' | 'fireworks' | 'fire_sparks'; // Hiệu ứng đọc truyện
  borderStyle?: 'solid' | 'double' | 'dashed' | 'dotted' | 'dash-dot' | 'sketch' | 'stitched' | 'gradient' | 'stamp' | 'film' | 'groove' | 'ridge' | 'offset' | 'none'; // Kiểu nét đường viền
  borderWidth?: 'thin' | 'medium' | 'thick' | 'heavy' | 'bold' | 'frame'; // Độ dày đường viền
  borderRadius?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'leaf' | 'chamfer' | 'ticket' | 'petal' | 'tab'; // Kiểu bo góc viền đa dạng
  borderCornerAccent?: 'none' | 'brackets' | 'vintage' | 'rivets' | 'dots' | 'crosshairs' | 'washi' | 'sparkle' | 'heart' | 'botanical' | 'artdeco' | 'bow' | 'paperclip'; // Trang trí góc viền nghệ thuật
  borderGlow?: 'none' | 'soft' | 'neon' | 'shadow' | 'soft-depth' | 'gradient-aura' | 'isometric'; // Hiệu ứng phát sáng / đổ bóng viền
  customBorderGradientColor2?: string; // Màu thứ 2 cho Viền Gradient đa sắc
  customBorderGlowColor1?: string; // Màu thứ 1 cho Hào quang Gradient
  customBorderGlowColor2?: string; // Màu thứ 2 cho Hào quang Gradient
  
  // Tách biệt theme chương và truyện riêng biệt
  useSeparateChapterTheme?: boolean;
  useSeparateChapterEffect?: boolean; // Tách biệt hiệu ứng hạt rơi giữa trang truyện và đọc chương
  chapterThemeTone?: string;
  chapterCustomBgColor?: string;
  chapterCustomCardBgColor?: string;
  chapterCustomTextColor?: string;
  chapterCustomTextMutedColor?: string;
  chapterCustomBorderColor?: string;
  chapterCustomBtnBgColor?: string;
  chapterCustomBtnSecondaryBgColor?: string;
  chapterBorderStyle?: 'solid' | 'double' | 'dashed' | 'dotted' | 'dash-dot' | 'sketch' | 'stitched' | 'gradient' | 'stamp' | 'film' | 'groove' | 'ridge' | 'offset' | 'none';
  chapterBorderWidth?: 'thin' | 'medium' | 'thick' | 'heavy' | 'bold' | 'frame';
  chapterBorderRadius?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'leaf' | 'chamfer' | 'ticket' | 'petal' | 'tab';
  chapterBorderCornerAccent?: 'none' | 'brackets' | 'vintage' | 'rivets' | 'dots' | 'crosshairs' | 'washi' | 'sparkle' | 'heart' | 'botanical' | 'artdeco' | 'bow' | 'paperclip';
  chapterBorderGlow?: 'none' | 'soft' | 'neon' | 'shadow' | 'soft-depth' | 'gradient-aura' | 'isometric';
  chapterCustomBorderGradientColor2?: string;
  chapterCustomBorderGlowColor1?: string;
  chapterCustomBorderGlowColor2?: string;
  chapterReadingEffect?: 'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'ginkgo' | 'fireworks' | 'fire_sparks';
}

export interface ReadingProgress {
  storyId: string;
  chapterId: string;
  chapterNumber?: number;
  chapterTitle?: string;
  scrollY?: number;
  progressPercent?: number;
  updatedAt: string;
}

export interface BookmarkItem {
  storyId: string;
  createdAt: string;
}

export interface LoungeMessage {
  id: string;
  userName: string;
  userUid?: string;
  userPhoto?: string;
  content: string;
  createdAt: string;
}

export interface EditorRequest {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  reason?: string;
  experience?: string;
  contact?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  chucu: number; // Đơn vị tiền tệ ảo Chucu
  streak: number; // Chuỗi ngày điểm danh liên tiếp
  lastCheckInDate?: string; // YYYY-MM-DD của lần điểm danh gần nhất
  totalCheckIns?: number; // Tổng số ngày đã điểm danh
  unlockedChapters?: string[]; // Danh sách các chapterId đã mở khóa bằng Chucu
  unlockedPasswordChapters?: string[]; // Danh sách các chapterId đã mở khóa bằng Pass
  createdAt?: string;
  updatedAt?: string;
}

export interface BlockLeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  highScore: number;
  updatedAt: string;
}

export interface Game2048LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  highScore: number;
  maxTile: number;
  updatedAt: string;
}

export type StoryLayoutBlockId = 
  | 'cover'
  | 'title'
  | 'meta'
  | 'synopsis'
  | 'editor_info'
  | 'action_buttons'
  | 'tags'
  | 'character_widget'
  | 'progress_widget'
  | 'custom_widget'
  | 'gallery_widget'
  | 'chapter_list'
  | 'comments';

export type StoryLayoutMode = 'two_columns' | 'single_column' | 'inverted_two_columns';


