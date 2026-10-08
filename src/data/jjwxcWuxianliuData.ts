import wuxianliuJson from './jjwxcWuxianliuRankingsData.json';
import { JjwxcNovel } from './jjwxcRankingsData';

export interface WuxianliuCriteriaConfig {
  id: string;
  sortType: string;
  name: string;        // 'tích phân', 'Thông tin cập nhật mới nhất', ...
  nameZh: string;      // '积分', '最近更新', ...
  desc: string;
  metricLabel: string;
}

export const WUXIANLIU_CRITERIA_LIST: WuxianliuCriteriaConfig[] = [
  {
    id: 'score',
    sortType: '2',
    name: 'Điểm tích lũy',
    nameZh: '积分',
    desc: 'Xếp theo tổng điểm tích lũy (tích phân) cao nhất lịch sử của truyện Vô Hạn Lưu trên Tấn Giang',
    metricLabel: 'Điểm tích lũy'
  },
  {
    id: 'latest_update',
    sortType: '1',
    name: 'Mới cập nhật',
    nameZh: '最近更新',
    desc: 'Xếp theo thời gian ra chương mới nhất gần đây của truyện Vô Hạn Lưu',
    metricLabel: 'Cập nhật'
  },
  {
    id: 'latest_publish',
    sortType: '3',
    name: 'Mới đăng tải',
    nameZh: '最新发表',
    desc: 'Xếp theo thời điểm truyện Vô Hạn Lưu mới nhất được đăng tải / phát hành trên Tấn Giang',
    metricLabel: 'Ngày đăng tải'
  },
  {
    id: 'word_count',
    sortType: '5',
    name: 'Số chữ',
    nameZh: '字数',
    desc: 'Xếp theo dung lượng số lượng chữ nhiều nhất của truyện Vô Hạn Lưu',
    metricLabel: 'Số chữ'
  },
  {
    id: 'favorites',
    sortType: '4',
    name: 'Lượt lưu truyện',
    nameZh: '收藏数',
    desc: 'Xếp theo tổng số lượt độc giả bấm lưu truyện vào giá sách (收藏) cao nhất trên Tấn Giang',
    metricLabel: 'Lượt lưu truyện'
  },
  {
    id: 'completed_high_score',
    sortType: '10',
    name: 'Hoàn thành điểm cao',
    nameZh: '完结高分',
    desc: 'Xếp các tác phẩm Vô Hạn Lưu đã hoàn thành trọn vẹn và đạt điểm số đánh giá cao nhất',
    metricLabel: 'Điểm đánh giá'
  }
];

export interface WuxianliuDataset {
  metadata: {
    tag: string;
    tagVi: string;
    bq: string;
    channelId: string;
    crawledAt: string;
    source: string;
    totalCriteria: number;
  };
  rankings: Record<string, {
    id: string;
    sortType: string;
    name: string;
    nameZh: string;
    desc: string;
    metricLabel: string;
    total: number;
    items: JjwxcNovel[];
  }>;
}

export const initialWuxianliuRankingsData = wuxianliuJson as unknown as WuxianliuDataset;
