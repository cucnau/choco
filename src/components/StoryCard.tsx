import React from 'react';
import { Story } from '../types';

interface StoryCardProps {
  story: Story;
  onSelectStory: (story: Story) => void;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent, storyId: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onSelectStory,
}) => {
  return (
    <article
      onClick={() => onSelectStory(story)}
      className="bg-[#11090c] border border-[#2d1822] hover:border-[#5e2f46] p-2.5 transition cursor-pointer flex flex-col group font-mono-code"
    >
      <div className="space-y-2.5">
        {/* Cover image if available */}
        {story.coverUrl ? (
          <div className="w-full aspect-[3/4] bg-[#170d12] border border-[#2d1822] overflow-hidden flex justify-center items-center">
            <img
              src={story.coverUrl}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
        ) : (
          <div className="w-full aspect-[3/4] bg-[#170d12] border border-[#2d1822] flex items-center justify-center text-xs text-[#8a717a]">
            Chưa có ảnh bìa
          </div>
        )}

        <div className="space-y-1">
          <h3 className="font-mono-code font-bold text-xs text-[#e0c0cc] group-hover:text-[#d0a0b0] transition leading-snug line-clamp-2">
            {story.title}
          </h3>

          <div className="text-[11px] text-[#8a717a] space-y-0.5 font-mono-code">
            <p className="truncate">Tác giả: <span className="text-[#c0a0aa]">{story.author}</span></p>
            <p>Lượt đọc: <span className="text-[#e0c0cc]">{story.viewsCount}</span></p>
          </div>
        </div>
      </div>
    </article>
  );
};
