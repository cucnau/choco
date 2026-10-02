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
    fullName: '总分排行榜 (Bảng tổng điểm tích lũy lịch sử)',
    desc: 'Bảng xếp hạng tổng điểm tích lũy Đam Mỹ cao nhất mọi thời đại trong lịch sử Tấn Giang',
    channel: '纯爱 (Only Đam Mỹ)',
    badgeColor: 'indigo',
    sortCriteria: 'Xếp hạng từ cao xuống thấp theo Tổng điểm tích lũy Đam Mỹ',
    metricLabel: 'Tổng điểm tích lũy'
  },
  {
    id: 'bawang',
    name: '霸王票总榜',
    nameViGuide: 'Được Yêu Thích Nhất',
    fullName: '霸王票总榜 (Top ủng hộ ném mìn / đại pháo)',
    desc: 'Bảng xếp hạng truyện Đam Mỹ được độc giả bỏ tiền thật ném mìn, đại pháo ủng hộ nhiều nhất',
    channel: '纯爱 (Only Đam Mỹ)',
    badgeColor: 'rose',
    sortCriteria: 'Xếp hạng theo Tổng số Bá Vương Phiếu (ném mìn / đại pháo bằng tiền thật)',
    metricLabel: 'Điểm tích lũy (Xếp theo Bá Vương Phiếu)'
  },
  {
    id: 'wanjie_jinbang',
    name: '完结金榜',
    nameViGuide: 'Truyện Đã Hoàn',
    fullName: '完结金榜 (Top truyện hoàn thành bán chạy 30 ngày)',
    desc: 'Bảng xếp hạng truyện Đam Mỹ đã hoàn thành bán chạy nhất trong 30 ngày qua trên Tấn Giang',
    channel: '纯爱 (Only Đam Mỹ)',
    badgeColor: 'emerald',
    sortCriteria: 'Xếp hạng theo Doanh thu bán chương VIP 30 ngày của truyện Đam Mỹ đã hoàn',
    metricLabel: 'Điểm tích lũy (Xếp theo Doanh thu hoàn)'
  },
  {
    id: 'vip_jinbang',
    name: 'VIP金榜',
    nameViGuide: 'Bán Chạy Tuần',
    fullName: 'VIP金榜 (Top truyện VIP bán chạy)',
    desc: 'Bảng xếp hạng truyện Đam Mỹ VIP bán chạy nhất trên Tấn Giang',
    channel: '纯爱 (Only Đam Mỹ)',
    badgeColor: 'amber',
    sortCriteria: 'Xếp hạng theo Doanh thu bán chương VIP trong tuần của truyện Đam Mỹ',
    metricLabel: 'Điểm tích lũy (Xếp theo Doanh thu VIP)'
  },
  {
    id: 'yuedu',
    name: '月度排行榜',
    nameViGuide: 'Bảng Xếp Hạng Tháng',
    fullName: '月度排行榜 (Top truyện nổi bật theo tháng)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ mới nổi bật nhất đăng tải từ 11 đến 40 ngày',
    channel: '纯爱 (Only Đam Mỹ)',
    badgeColor: 'blue',
    sortCriteria: 'Xếp hạng theo Điểm tổng hợp tác phẩm Đam Mỹ mới (11-40 ngày)',
    metricLabel: 'Điểm tích lũy (Xếp theo Top Tháng)'
  },
  {
    id: 'jidu',
    name: '季度排行榜',
    nameViGuide: 'Bảng Xếp Hạng Quý',
    fullName: '季度排行榜 (Top truyện nổi bật theo quý)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ nổi bật đăng tải từ 41 đến 130 ngày trên Tấn Giang',
    channel: '纯爱 (Only Đam Mỹ)',
    badgeColor: 'teal',
    sortCriteria: 'Xếp hạng theo Điểm tổng hợp tác phẩm Đam Mỹ mới (41-130 ngày)',
    metricLabel: 'Điểm tích lũy (Xếp theo Top Quý)'
  },
  {
    id: 'bannian',
    name: '半年排行榜',
    nameViGuide: 'Bảng Xếp Hạng Nửa Năm',
    fullName: '半年排行榜 (Top truyện nổi bật nửa năm)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ duy trì độ hot hàng đầu trong nửa năm qua',
    channel: '纯爱 (Only Đam Mỹ)',
    badgeColor: 'cyan',
    sortCriteria: 'Xếp hạng theo Điểm tổng hợp duy trì độ hot Đam Mỹ trong 6 tháng',
    metricLabel: 'Điểm tích lũy (Xếp theo Top Nửa Năm)'
  },
  {
    id: 'xinjin',
    name: '新晋作者榜',
    nameViGuide: 'Tác Giả Mới',
    fullName: '新晋作者榜 (Cây bút mới triển vọng)',
    desc: 'Bảng xếp hạng tác phẩm Đam Mỹ của tác giả mới tạo tài khoản trong vòng 30 ngày',
    channel: '纯爱 (Only Đam Mỹ)',
    badgeColor: 'green',
    sortCriteria: 'Xếp hạng theo Điểm tăng trưởng 30 ngày đầu của tác giả mới Đam Mỹ',
    metricLabel: 'Điểm tích lũy (Xếp theo Điểm Tân Tấn)'
  }
];

export interface JjwxcRealDataset {
  crawledAt: string;
  source: string;
  rankings: Record<string, {
    id: string;
    name: string;
    fullName: string;
    desc: string;
    channel: string;
    items: JjwxcNovel[];
  }>;
}

export const initialRealRankingsData = rawData as JjwxcRealDataset;
