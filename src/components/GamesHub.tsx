import React, { useState } from 'react';
import { Gamepad2, Play, Trophy, LayoutGrid, Grid3X3, Bomb } from 'lucide-react';
import { UserProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { BlockBlastGame } from './BlockBlastGame';
import { Game2048 } from './Game2048';
import { NonogramGame } from './NonogramGame';
import { MinesweeperGame } from './MinesweeperGame';

interface GamesHubProps {
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  selectedGameId?: string | null;
  onSelectGame?: (gameId: string | null) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ 
  currentUser, 
  userProfile,
  selectedGameId: propSelectedGameId,
  onSelectGame
}) => {
  const [internalGameId, setInternalGameId] = useState<string | null>(null);
  const activeGameId = propSelectedGameId !== undefined ? propSelectedGameId : internalGameId;

  const setActiveGameId = (id: string | null) => {
    setInternalGameId(id);
    if (onSelectGame) {
      onSelectGame(id);
    }
  };

  // Lấy kỷ lục điểm Block đã lưu trong localStorage
  const blockHighScore = (() => {
    try {
      const saved = localStorage.getItem('blockblast_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  })();

  // Lấy kỷ lục điểm 2048 đã lưu trong localStorage
  const game2048HighScore = (() => {
    try {
      const saved = localStorage.getItem('game_2048_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  })();

  // Lấy số câu đố Nonogram đã giải trong localStorage
  const nonogramSolvedCount = (() => {
    try {
      const savedRecords = localStorage.getItem('nonogram_size_records');
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords);
        const total = (parsed[5]?.solvedCount || 0) + (parsed[10]?.solvedCount || 0) + (parsed[15]?.solvedCount || 0);
        if (total > 0) return total;
      }
      const legacy = localStorage.getItem('nonogram_completed_puzzles');
      return legacy ? Object.keys(JSON.parse(legacy)).length : 0;
    } catch {
      return 0;
    }
  })();

  // Lấy thống kê game Dò mìn (Minesweeper)
  const minesweeperStats = (() => {
    try {
      const times = localStorage.getItem('minesweeper_best_times');
      const wins = localStorage.getItem('minesweeper_win_stats');
      const parsedTimes: Record<string, number> = times ? JSON.parse(times) : {};
      const parsedWins: Record<string, number> = wins ? JSON.parse(wins) : {};
      const totalWins: number = Object.values(parsedWins).reduce<number>((sum, val) => sum + (Number(val) || 0), 0);
      const bestEasy: number | undefined = parsedTimes.easy;
      return { totalWins, bestEasy };
    } catch {
      return { totalWins: 0, bestEasy: undefined };
    }
  })();

  // Nếu đang chơi game Block
  if (activeGameId === 'block' || activeGameId === 'block_blast') {
    return (
      <BlockBlastGame
        onBack={() => setActiveGameId(null)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    );
  }

  // Nếu đang chơi game 2048
  if (activeGameId === '2048') {
    return (
      <Game2048
        onBack={() => setActiveGameId(null)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    );
  }

  // Nếu đang chơi game Nonogram
  if (activeGameId === 'nonogram' || activeGameId === 'picross') {
    return (
      <NonogramGame
        onBack={() => setActiveGameId(null)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    );
  }

  // Nếu đang chơi game Dò Mìn (Minesweeper)
  if (activeGameId === 'minesweeper' || activeGameId === 'do-min' || activeGameId === 'do_min') {
    return (
      <MinesweeperGame
        onBack={() => setActiveGameId(null)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Banner / Header */}
      <div className="bg-[#25101b] border border-[#4d2138] rounded-xs p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#14080e] border border-[#ff4d79]/30 rounded-xs text-[#ff4d79]">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-mono-code text-[#ffc2d4] tracking-tight">
              TRUNG TÂM TRÒ CHƠI
            </h1>
          </div>
        </div>
      </div>

      {/* Danh sách các trò chơi sẵn có */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card Game Block */}
          <div className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#ff4d79] rounded-xs p-5 flex flex-col justify-between space-y-4 transition group shadow-sm">
            <div className="space-y-3">
              {/* Game Icon & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-[#25101b] border border-[#ff4d79]/40 flex items-center justify-center text-[#ff4d79] group-hover:scale-105 transition shadow-xs">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                      Block
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kỷ lục cá nhân nếu có */}
              {blockHighScore > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#fbbf24] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Kỷ lục của bạn: <strong>{blockHighScore.toLocaleString()}</strong> điểm</span>
                </div>
              )}
            </div>

            {/* Nút vào chơi */}
            <button
              onClick={() => setActiveGameId('block')}
              className="w-full py-2.5 bg-[#881337] hover:bg-[#9f1239] text-white font-mono-code font-bold text-xs rounded-xs border border-[#ff4d79] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>CHƠI NGAY</span>
            </button>
          </div>

          {/* Card Game 2048 Vô Tận */}
          <div className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#ffd166] rounded-xs p-5 flex flex-col justify-between space-y-4 transition group shadow-sm">
            <div className="space-y-3">
              {/* Game Icon & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-gradient-to-br from-[#ffd166]/20 via-[#f72585]/20 to-[#ffd166]/10 border border-[#ffd166]/50 flex items-center justify-center text-[#ffd166] group-hover:scale-105 transition shadow-xs">
                    <span className="font-mono-code font-black text-sm tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#ffd166] to-[#f72585]">
                      2048
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                      2048
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kỷ lục cá nhân nếu có */}
              {game2048HighScore > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#fbbf24] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Kỷ lục của bạn: <strong>{game2048HighScore.toLocaleString()}</strong> điểm</span>
                </div>
              )}
            </div>

            {/* Nút vào chơi */}
            <button
              onClick={() => setActiveGameId('2048')}
              className="w-full py-2.5 bg-[#854d0e] hover:bg-[#a16207] text-white font-mono-code font-bold text-xs rounded-xs border border-[#ffd166] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>CHƠI NGAY</span>
            </button>
          </div>

          {/* Card Game Nonogram (Picross) */}
          <div className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#ff4d79] rounded-xs p-5 flex flex-col justify-between space-y-4 transition group shadow-sm">
            <div className="space-y-3">
              {/* Game Icon & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-gradient-to-br from-[#ff4d79]/20 via-[#c084fc]/20 to-[#38bdf8]/20 border border-[#ff4d79]/50 flex items-center justify-center text-[#ff4d79] group-hover:scale-105 transition shadow-xs">
                    <Grid3X3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                      Nonogram
                    </h3>
                  </div>
                </div>
              </div>

              {/* Tiến độ giải câu đố */}
              {nonogramSolvedCount > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#4ade80] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <Trophy className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span>Đã hoàn thành: <strong>{nonogramSolvedCount}</strong> câu đố</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#8a717a] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <span>Tranh số logic (Picross)</span>
                </div>
              )}
            </div>

            {/* Nút vào chơi */}
            <button
              onClick={() => setActiveGameId('nonogram')}
              className="w-full py-2.5 bg-[#881337] hover:bg-[#9f1239] text-white font-mono-code font-bold text-xs rounded-xs border border-[#ff4d79] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>CHƠI NGAY</span>
            </button>
          </div>

          {/* Card Game Dò Mìn (Minesweeper) */}
          <div className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#f43f5e] rounded-xs p-5 flex flex-col justify-between space-y-4 transition group shadow-sm">
            <div className="space-y-3">
              {/* Game Icon & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-gradient-to-br from-[#f43f5e]/20 via-[#be123c]/20 to-[#fb7185]/20 border border-[#f43f5e]/50 flex items-center justify-center text-[#ff4d79] group-hover:scale-105 transition shadow-xs">
                    <Bomb className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                      Dò Mìn
                    </h3>
                  </div>
                </div>
              </div>

              {/* Tiến độ hoặc Kỷ lục */}
              {minesweeperStats.bestEasy ? (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#fbbf24] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Kỷ lục: <strong>{minesweeperStats.bestEasy}s</strong> {minesweeperStats.totalWins > 0 && `(${minesweeperStats.totalWins} thắng)`}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#8a717a] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <span>Minesweeper kinh điển</span>
                </div>
              )}
            </div>

            {/* Nút vào chơi */}
            <button
              onClick={() => setActiveGameId('minesweeper')}
              className="w-full py-2.5 bg-[#881337] hover:bg-[#9f1239] text-white font-mono-code font-bold text-xs rounded-xs border border-[#ff4d79] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>CHƠI NGAY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

