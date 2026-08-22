import React from 'react';
import { Story } from '../types';
import { getStoryBorderStyle, StoryCornerAccents } from '../lib/borderStyles';

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
  // Chỉ khi người dùng chọn kiểu nét viền trang trí đặc biệt (dashed, dotted, sketch, gradient, stamp, film,...)
  // hoặc bật hiệu ứng phát sáng thì mới dùng màu customBorderColor cho viền ngoài.
  // Còn với nét viền chuẩn (solid/mặc định) thì giữ màu viền tối chuẩn #2d1822 để các thẻ trên danh sách đồng nhất, không bị sáng chói.
  const hasCustomStyle = Boolean(
    (story.borderStyle && story.borderStyle !== 'solid' && story.borderStyle !== 'none') ||
    (story.borderGlow && story.borderGlow !== 'none')
  );

  const cardBorderColor = hasCustomStyle ? (story.customBorderColor || '#5e2f46') : '#2d1822';
  const customCardStyle = getStoryBorderStyle(
    {
      ...story,
      customBorderColor: cardBorderColor,
    },
    '#2d1822'
  );

  return (
    <article
      onClick={() => onSelectStory(story)}
      className="bg-[#11090c] p-2.5 transition-all duration-200 cursor-pointer flex flex-col group font-mono-code relative hover:scale-[1.01]"
      style={customCardStyle}
    >
      {/* Corner Accents nếu có */}
      <StoryCornerAccents
        accent={story.borderCornerAccent}
        color={story.customBorderColor || '#5e2f46'}
      />

      <div className="space-y-2.5 relative z-10">
        {/* Cover image if available */}
        {story.coverUrl ? (
          <div className="w-full aspect-[3/4] bg-[#170d12] border border-[#2d1822] overflow-hidden flex justify-center items-center rounded-xs">
            <img
              src={story.coverUrl}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
        ) : (
          <div className="w-full aspect-[3/4] bg-[#170d12] border border-[#2d1822] flex items-center justify-center text-xs text-[#8a717a] rounded-xs">
            Chưa có ảnh bìa
          </div>
        )}

        <div className="space-y-1">
          <h3 className="font-mono-code font-bold text-xs text-[#e0c0cc] group-hover:text-[#ffd6e2] transition leading-snug line-clamp-2">
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

