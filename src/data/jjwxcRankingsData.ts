import rawData from './jjwxcRealData.json';

export interface JjwxcNovel {
  rank: number;
  novelId: string;
  title: string;          // Tên gốc tiếng Trung (Không dịch)
  author: string;         // Tác giả gốc tiếng Trung (Không dịch)
  authorId?: string;
  genre: string;          // Thể loại gốc JJWXC (原创-纯爱-...)
  status: string;         // Tình trạng gốc (完结 / 连载)
  wordCount: string;      // Số chữ gốc
  score: string;          // Điểm tích lũy / điểm bá vương gốc
  publishDate?: string;   // Ngày phát hành gốc
  intro: string;          // Văn án gốc tiếng Trung của tác giả
  coverUrl: string;       // Bìa gốc từ server JJWXC
  jjwxcUrl: string;       // Link truyện gốc trên JJWXC
}

export interface JjwxcRankCategoryConfig {
  id: string;
  name: string;           // Tên chữ Hán gốc
  nameViGuide: string;    // Chú thích loại bảng để độc giả Việt hiểu
  fullName: string;
  desc: string;
  channel: string;
  badgeColor: string;
  sortCriteria: string;   // Tiêu chí xếp hạng thực tế của Tấn Giang
  metricLabel: string;    // Nhãn điểm hiển thị
}

export const JJWXC_RANK_CATEGORIES: JjwxcRankCategoryConfig[] = [
  {
    id: 'zongfen',
    name: '总分排行榜',
    nameViGuide: 'Top Mọi Thời Đại',
    fullName: '总分排行榜 (Bảng tổng điểm tích lũy lịch sử Đam Mỹ)',
    desc: 'Bảng xếp hạng tổng điểm tích lũy Đam Mỹ cao nhất mọi thời đại trong lịch sử Tấn Giang',
    channel: '纯爱频道 (Only Đam Mỹ)',
    badgeColor: 'indigo',
    sortCriteria: 'Xếp theo tổng điểm tích lũy lịch sử (lượt click + bookmark + bình luận + điểm tiêu phí VIP) của tác phẩm Đam Mỹ',
    metricLabel: 'Điểm tích lũy'
  },
  {
    id: 'bawang',
    name: '霸王票总榜',
    nameViGuide: 'Top Bá Vương Phiếu',
    fullName: '霸王票总榜 (Bá Vương Phiếu Tổng Bảng - Ném mìn bằng tiền thật)',
    desc: 'Bảng xếp hạng truyện Đam Mỹ nhận được nhiều Bá Vương Phiếu (ném mìn, đại pháo bằng Tấn Giang Tệ) nhất từ độc giả',
    channel: '纯爱频道 (Only Đam Mỹ)',
    badgeColor: 'rose',
    sortCriteria: 'Xếp theo tổng giá trị tặng thưởng Bá Vương Phiếu thực tế (Địa Lôi, Thủ Lựu Đạn, Hỏa Tiễn Pháo, Thâm Thủy Tạc Đạn) của độc giả',
    metricLabel: 'Điểm tích lũy'
  },
  {
    id: 'wanjie',
    name: '完结金榜',
    nameViGuide: 'Bảng Vàng Truyện Hoàn',
    fullName: '完结金榜 (Bảng Vàng Truyện Hoàn - Doanh thu 30 ngày sau kết thúc)',
    desc: 'Bảng xếp hạng các tác phẩm Đam Mỹ đã hoàn thành dựa trên doanh thu đọc VIP (订阅) trong vòng 30 ngày sau khi truyện kết thúc',
    channel: '纯爱频道 (Only Đam Mỹ)',
    badgeColor: 'emerald',
    sortCriteria: 'Xếp theo doanh thu đọc trả phí (VIP订阅) trên toàn kênh trong 30 ngày sau khi tác phẩm Đam Mỹ bấm hoàn thành',
    metricLabel: 'Điểm tích lũy'
  },
  {
    id: 'vip',
    name: 'VIP金榜',
    nameViGuide: 'VIP Kim Bảng Ngày',
    fullName: 'VIP金榜 (VIP Kim Bảng - Biến động theo ngày)',
    desc: 'Bảng vàng VIP thay đổi theo ngày, đo lường doanh thu đọc trả phí (VIP 24h) của các tác phẩm Đam Mỹ đang ra có chương mới nhất',
    channel: '纯爱频道 (Only Đam Mỹ)',
    badgeColor: 'amber',
    sortCriteria: 'Xếp theo doanh thu mua chương VIP thực tế theo ngày của các tác phẩm Đam Mỹ đang ra',
    metricLabel: 'Điểm tích lũy'
  },
  {
    id: 'yuedu',
    name: '月度排行榜',
    nameViGuide: 'Bảng Xếp Hạng Tháng',
    fullName: '月度排行榜 (Top Đam Mỹ nổi bật trong tháng)',
    desc: 'Bảng xếp hạng các tác phẩm Đam Mỹ mới nổi bật đạt tốc độ tăng trưởng tích phân cao nhất trong vòng 1-2 tháng qua',
    channel: '纯爱频道 (Only Đam Mỹ)',
    badgeColor: 'blue',
    sortCriteria: 'Xếp theo tốc độ tăng trưởng điểm tích lũy của tác phẩm Đam Mỹ trong chu kỳ 30 - 60 ngày',
    metricLabel: 'Điểm tích lũy'
  },
  {
    id: 'jidu',
    name: '季度排行榜',
    nameViGuide: 'Bảng Xếp Hạng Quý',
    fullName: '季度排行榜 (Top Đam Mỹ nổi bật theo quý)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ xuất sắc đạt tích phân cao nhất trong vòng 1 quý (3 tháng / 90 ngày) gần nhất',
    channel: '纯爱频道 (Only Đam Mỹ)',
    badgeColor: 'teal',
    sortCriteria: 'Xếp theo điểm số và thành tích của tác phẩm Đam Mỹ phát hành trong vòng 90 ngày',
    metricLabel: 'Điểm tích lũy'
  },
  {
    id: 'bannian',
    name: '半年排行榜',
    nameViGuide: 'Bảng Xếp Hạng Nửa Năm',
    fullName: '半年排行榜 (Top Đam Mỹ nửa năm qua)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ duy trì phong độ và độ hot hàng đầu trong suốt nửa năm (6 tháng)',
    channel: '纯爱频道 (Only Đam Mỹ)',
    badgeColor: 'cyan',
    sortCriteria: 'Xếp theo điểm tổng hợp và mức độ duy trì nhiệt độ của truyện Đam Mỹ trong 6 tháng',
    metricLabel: 'Điểm tích lũy'
  },
  {
    id: 'xinjin',
    name: '新晋作者榜',
    nameViGuide: 'Tân Tấn Tác Giả',
    fullName: '新晋作者榜 (Bút mới Đam Mỹ triển vọng)',
    desc: 'Bảng xếp hạng dành riêng cho tác giả mới viết Đam Mỹ (đăng ký tài khoản trong 30 ngày, chưa từng ký hợp đồng VIP cũ)',
    channel: '纯爱频道 (Only Đam Mỹ)',
    badgeColor: 'green',
    sortCriteria: 'Xếp theo điểm tăng trưởng 30 ngày đầu của tác phẩm đầu tay do tác giả mới viết Đam Mỹ phát hành',
    metricLabel: 'Điểm tích lũy'
  }
];

export interface JjwxcRealDataset {
  metadata?: {
    generatedAt: string;
    source: string;
    channel: string;
    version: string;
  };
  rankings: Record<string, {
    title: string;
    subtitle: string;
    items: JjwxcNovel[];
  }>;
}

export const initialRealRankingsData = rawData as unknown as JjwxcRealDataset;
