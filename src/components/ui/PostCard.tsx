// src/components/ui/PostCard.tsx
import React, { useState, useEffect } from 'react';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Link2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toggleUpvote, hasUserUpvoted, getPostUpvoteCount } from '../../services/upvoteService';
import { getCommentCount } from '../../services/commentService';

interface PostCardProps {
  id: string;
  community: string;
  author: string;
  timeAgo: string;
  title: string;
  bodyText: string;
  imageUrl?: string;
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
  onOpen,
}) => {
  const { user } = useAuth();

  const [upvotes, setUpvotes] = useState<number>(0);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);


  const [commentsCount, setCommentsCount] = useState<number>(0);

  // Share dropdown state
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const shareMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  useEffect(() => {
    let isMounted = true;

    async function loadPostData() {
      try {
        const count = await getPostUpvoteCount(id);
        if (isMounted) setUpvotes(count);

        const totalComments = await getCommentCount(id);
        if (isMounted) setCommentsCount(totalComments);

        if (user) {
          const hasVoted = await hasUserUpvoted(id, user.id);
          if (isMounted && hasVoted) setUserVote('up');
        }
      } catch (err) {
        console.error(`Error loading data for post ${id}:`, err);
      }
    }

    loadPostData();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const handleVote = async (type: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert('Please log in to vote!');
      return;
    }

    if (isVoting) return;

    const previousVote = userVote;
    const previousCount = upvotes;

    if (previousVote === type) {
      setUserVote(null);
      setUpvotes(type === 'up' ? Math.max(0, previousCount - 1) : previousCount + 1);
    } else if (previousVote === null) {
      setUserVote(type);
      setUpvotes(type === 'up' ? previousCount + 1 : Math.max(0, previousCount - 1));
    } else {
      setUserVote(type);
      setUpvotes(type === 'up' ? previousCount + 2 : Math.max(0, previousCount - 2));
    }

    try {
      setIsVoting(true);

      const shouldHaveUpvoteRecord = (previousVote !== 'up' && type === 'up');
      const currentlyHasRecord = await hasUserUpvoted(id, user.id);

      if (shouldHaveUpvoteRecord && !currentlyHasRecord) {
        await toggleUpvote(id, user.id);
      } else if (!shouldHaveUpvoteRecord && currentlyHasRecord) {
        await toggleUpvote(id, user.id);
      }
    } catch (err) {
      setUserVote(previousVote);
      setUpvotes(previousCount);
      console.error('Failed to sync vote:', err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareMenu(false);
    }, 1200);
  };

  return (
    <article className="post-card bg-[#1A1A1B] border border-[#343536] rounded-xl mb-3 hover:border-[#818384] transition">
      <div className="p-3">
        {/* Subreddit & Author header */}
        <div className="flex items-center gap-2 text-xs text-[#818384] mb-2">
          <span className="font-bold text-[#D7DADC] hover:underline cursor-pointer">
            {community.startsWith('c/') ? community : `c/${community}`}
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
          <div className="flex items-center bg-[#272729] rounded-full px-2 py-1 gap-1 text-xs">
            <button
              onClick={(e) => handleVote('up', e)}
              disabled={isVoting}
              title="Upvote"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                color: userVote === 'up' ? '#FF4500' : '#D7DADC',
                transition: 'color 0.15s ease, transform 0.1s ease',
              }}
              className="hover:scale-110"
            >
              <ArrowBigUp
                className="w-5 h-5"
                fill={userVote === 'up' ? '#FF4500' : 'transparent'}
              />
            </button>

            <span
              className="font-bold px-1"
              style={{
                color:
                  userVote === 'up'
                    ? '#FF4500'
                    : userVote === 'down'
                      ? '#7193FF'
                      : '#D7DADC',
                transition: 'color 0.15s ease',
              }}
            >
              {upvotes}
            </span>

            <button
              onClick={(e) => handleVote('down', e)}
              disabled={isVoting}
              title="Downvote"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                color: userVote === 'down' ? '#7193FF' : '#D7DADC',
                transition: 'color 0.15s ease, transform 0.1s ease',
              }}
              className="hover:scale-110"
            >
              <ArrowBigDown
                className="w-5 h-5"
                fill={userVote === 'down' ? '#7193FF' : 'transparent'}
              />
            </button>
          </div>

          {/* COMMENTS BUTTON */}
          <button
            onClick={() => onOpen && onOpen(id)}
            className="flex items-center gap-1.5 bg-[#272729] hover:bg-[#343536] rounded-full px-3 py-1 text-xs text-[#818384] hover:text-[#D7DADC] transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{commentsCount} comments</span>
          </button>

          {/* SHARE BUTTON */}
          <div className="relative" ref={shareMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareMenu(!showShareMenu);
              }}
              className="flex items-center gap-1.5 bg-[#272729] hover:bg-[#343536] rounded-full px-3 py-1 text-xs text-[#818384] hover:text-[#D7DADC] transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {showShareMenu && (
              <div
                className="absolute left-0 bottom-full mb-2 w-36 bg-[#1A1A1B] border border-[#343536] rounded-xl shadow-2xl p-1 z-50"
                style={{
                  backgroundColor: '#1A1A1B',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.85)'
                }}
              >
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#D7DADC] hover:bg-[#272729] rounded-lg transition text-left cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5 text-[#818384]" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </article >
  );
};