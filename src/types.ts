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
  customBgColor?: string; // Màu nền trang đọc truyện (Màu đơn hoặc Gradient CSS)
  customCardBgColor?: string; // Màu nền khung truyện/thẻ truyện (Màu đơn hoặc Gradient CSS)
  customTextColor?: string; // Màu chữ chính
  customTextMutedColor?: string; // Màu chữ phụ/nhỏ
  customBorderColor?: string; // Màu đường viền khung
  customBtnBgColor?: string; // Màu nền nút bấm chính (Màu đơn hoặc Gradient CSS)
  customBtnSecondaryBgColor?: string; // Màu nền nút phụ / ô editor / danh sách chương (Màu đơn hoặc Gradient CSS)
  tags?: string[]; // Danh sách các tag thể loại của truyện
  readingEffect?: 'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'ginkgo'; // Hiệu ứng đọc truyện
  borderStyle?: 'solid' | 'double' | 'dashed' | 'dotted' | 'groove' | 'ridge' | 'inset' | 'outset' | 'none'; // Kiểu nét đường viền
  borderWidth?: 'thin' | 'medium' | 'thick' | 'heavy'; // Độ dày đường viền
  borderRadius?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'chamfer' | 'leaf'; // Kiểu bo góc viền
  borderCornerAccent?: 'none' | 'brackets' | 'vintage' | 'rivets' | 'dots' | 'crosshairs'; // Trang trí góc viền
  borderGlow?: 'none' | 'soft' | 'neon' | 'shadow'; // Hiệu ứng phát sáng hoặc đổ bóng viền
  
  // Tách biệt theme chương và truyện riêng biệt
  useSeparateChapterTheme?: boolean;
  chapterThemeTone?: string;
  chapterCustomBgColor?: string;
  chapterCustomCardBgColor?: string;
  chapterCustomTextColor?: string;
  chapterCustomTextMutedColor?: string;
  chapterCustomBorderColor?: string;
  chapterCustomBtnBgColor?: string;
  chapterCustomBtnSecondaryBgColor?: string;
  chapterBorderStyle?: 'solid' | 'double' | 'dashed' | 'dotted' | 'groove' | 'ridge' | 'inset' | 'outset' | 'none';
  chapterBorderWidth?: 'thin' | 'medium' | 'thick' | 'heavy';
  chapterBorderRadius?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'chamfer' | 'leaf';
  chapterBorderCornerAccent?: 'none' | 'brackets' | 'vintage' | 'rivets' | 'dots' | 'crosshairs';
  chapterBorderGlow?: 'none' | 'soft' | 'neon' | 'shadow';
  chapterReadingEffect?: 'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'ginkgo';
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


