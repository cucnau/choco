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
  score: string;          // Điểm tích phân / điểm bá vương gốc
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
}

export const JJWXC_RANK_CATEGORIES: JjwxcRankCategoryConfig[] = [
  {
    id: 'zongfen',
    name: '总分排行榜',
    nameViGuide: 'Top Mọi Thời Đại',
    fullName: '总分排行榜 (Bảng tổng điểm tích phân lịch sử)',
    desc: 'Bảng xếp hạng tổng điểm tích phân cao nhất mọi thời đại trong lịch sử Tấn Giang',
    channel: '非言情站',
    badgeColor: 'indigo'
  },
  {
    id: 'bawang',
    name: '霸王票总榜',
    nameViGuide: 'Được Yêu Thích Nhất',
    fullName: '霸王票总榜 (Top ủng hộ ném mìn / đại pháo)',
    desc: 'Bảng xếp hạng truyện được độc giả bỏ tiền thật ném mìn, đại pháo ủng hộ nhiều nhất',
    channel: '非言情站',
    badgeColor: 'rose'
  },
  {
    id: 'wanjie_jinbang',
    name: '完结金榜',
    nameViGuide: 'Truyện Đã Hoàn',
    fullName: '完结金榜 (Top truyện hoàn thành bán chạy 30 ngày)',
    desc: 'Bảng xếp hạng truyện đã hoàn thành bán chạy nhất trong 30 ngày qua trên Tấn Giang',
    channel: '纯爱分站',
    badgeColor: 'emerald'
  },
  {
    id: 'vip_jinbang',
    name: 'VIP金榜',
    nameViGuide: 'Bán Chạy Tuần',
    fullName: 'VIP金榜 (Top truyện VIP bán chạy)',
    desc: 'Bảng xếp hạng truyện VIP bán chạy nhất trên Tấn Giang',
    channel: '纯爱分站',
    badgeColor: 'amber'
  },
  {
    id: 'yuedu',
    name: '月度排行榜',
    nameViGuide: 'Bảng Xếp Hạng Tháng',
    fullName: '月度排行榜 (Top truyện nổi bật theo tháng)',
    desc: 'Bảng xếp hạng tác phẩm mới nổi bật nhất đăng tải từ 11 đến 40 ngày',
    channel: '非言情站',
    badgeColor: 'blue'
  },
  {
    id: 'jidu',
    name: '季度排行榜',
    nameViGuide: 'Bảng Xếp Hạng Quý',
    fullName: '季度排行榜 (Top truyện nổi bật theo quý)',
    desc: 'Bảng xếp hạng tác phẩm nổi bật đăng tải từ 41 đến 130 ngày trên Tấn Giang',
    channel: '非言情站',
    badgeColor: 'teal'
  },
  {
    id: 'bannian',
    name: '半年排行榜',
    nameViGuide: 'Bảng Xếp Hạng Nửa Năm',
    fullName: '半年排行榜 (Top truyện nổi bật nửa năm)',
    desc: 'Bảng xếp hạng tác phẩm duy trì độ hot hàng đầu trong nửa năm qua',
    channel: '非言情站',
    badgeColor: 'cyan'
  },
  {
    id: 'xinjin',
    name: '新晋作者榜',
    nameViGuide: 'Tác Giả Mới',
    fullName: '新晋作者榜 (Cây bút mới triển vọng)',
    desc: 'Bảng xếp hạng tác phẩm của tác giả mới tạo tài khoản trong vòng 30 ngày',
    channel: '非言情站',
    badgeColor: 'green'
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
