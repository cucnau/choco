import React, { useState } from 'react';
import { Gamepad2, Play, Trophy, LayoutGrid } from 'lucide-react';
import { UserProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { BlockBlastGame } from './BlockBlastGame';
import { Game2048 } from './Game2048';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      </div>
    </div>
  );
};

