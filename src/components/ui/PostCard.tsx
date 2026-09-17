// src/components/ui/PostCard.tsx
import React from 'react';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2 } from 'lucide-react';

interface PostCardProps {
  id: string;
  community: string;
  author: string;
  timeAgo: string;
  title: string;
  bodyText: string;
  imageUrl?: string;
  initialVotes?: number;
  commentsCount?: number;
  onOpen?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  community,
  author,
  timeAgo,
  title,
  bodyText,
  imageUrl,
  initialVotes = 0,
  commentsCount = 0,
  onOpen,
}) => {
  return (
    <article className="post-card bg-[#1A1A1B] border border-[#343536] rounded-xl mb-3 overflow-hidden hover:border-[#818384] transition">
      <div className="p-3">
        {/* Subreddit & Author header */}
        <div className="flex items-center gap-2 text-xs text-[#818384] mb-2">
          <span className="font-bold text-[#D7DADC] hover:underline cursor-pointer">
            {community.startsWith('r/') ? community : `r/${community}`}
          </span>
          <span>•</span>
          <span>Posted by u/{author}</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>

        {/* Title (clickable) */}
        <h2
          onClick={() => onOpen && onOpen(id)}
          className="text-base font-bold text-[#D7DADC] cursor-pointer hover:underline mb-1"
        >
          {title}
        </h2>

        {/* Snippet body (clickable) */}
        <p
          onClick={() => onOpen && onOpen(id)}
          className="text-xs text-[#818384] line-clamp-3 cursor-pointer mb-3 leading-relaxed"
        >
          {bodyText}
        </p>

        {imageUrl && (
          <div className="mb-3 overflow-hidden rounded-lg">
            <img src={imageUrl} alt="" className="max-h-96 w-full object-cover" />
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center bg-[#272729] rounded-full px-2 py-1 gap-1 text-xs text-[#D7DADC]">
            <ArrowBigUp className="w-4 h-4 hover:text-[#FF4500] cursor-pointer" />
            <span className="font-bold">{initialVotes}</span>
            <ArrowBigDown className="w-4 h-4 hover:text-blue-500 cursor-pointer" />
          </div>

          <button
            onClick={() => onOpen && onOpen(id)}
            className="flex items-center gap-1.5 bg-[#272729] hover:bg-[#343536] rounded-full px-3 py-1 text-xs text-[#818384] hover:text-[#D7DADC] transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{commentsCount} comments</span>
          </button>

          <button className="flex items-center gap-1.5 bg-[#272729] hover:bg-[#343536] rounded-full px-3 py-1 text-xs text-[#818384] hover:text-[#D7DADC] transition">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
};