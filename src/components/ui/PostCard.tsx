import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2 } from 'lucide-react';

interface PostCardProps {
    community: string;
    author: string;
    timeAgo: string;
    title: string;
    bodyText?: string;
    imageUrl?: string;
    initialVotes: number;
    commentsCount: number;
}

export const PostCard: React.FC<PostCardProps> = ({
    community,
    author,
    timeAgo,
    title,
    bodyText,
    imageUrl,
    initialVotes,
    commentsCount,
}) => {
    const [votes, setVotes] = useState(initialVotes);
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

    const handleVote = (type: 'up' | 'down') => {
        if (userVote === type) {
            setUserVote(null);
            setVotes(type === 'up' ? votes - 1 : votes + 1);
        } else {
            const adjustment = userVote ? 2 : 1;
            setUserVote(type);
            setVotes(type === 'up' ? votes + adjustment : votes - adjustment);
        }
    };

    return (
        <article className="post-card">
            {/* Header */}
            <div className="post-header">
                <a href="#" className="community-name">
                    {community}
                </a>
                <span className="post-meta">• Posted by u/{author} {timeAgo}</span>
            </div>

            {/* Title */}
            <h2 className="post-title">
                <a href="#">{title}</a>
            </h2>

            {/* Optional Body Text */}
            {bodyText && <div className="post-body">{bodyText}</div>}

            {/* Optional Media Image */}
            {imageUrl && (
                <div className="post-media">
                    <img src={imageUrl} alt={title} />
                </div>
            )}

            {/* Footer */}
            <footer className="post-footer">
                {/* Reddit-style Upvote/Downvote Pill */}
                <div className="vote-box">
                    <button
                        onClick={() => handleVote('up')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: userVote === 'up' ? 'var(--accent-orange)' : 'inherit',
                        }}
                    >
                        <ArrowBigUp style={{ width: '18px', height: '18px' }} />
                    </button>

                    <span style={{ color: userVote === 'up' ? 'var(--accent-orange)' : userVote === 'down' ? 'var(--accent-blue)' : 'inherit' }}>
                        {votes}
                    </span>

                    <button
                        onClick={() => handleVote('down')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: userVote === 'down' ? 'var(--accent-blue)' : 'inherit',
                        }}
                    >
                        <ArrowBigDown style={{ width: '18px', height: '18px' }} />
                    </button>
                </div>

                {/* Comments Button */}
                <button className="pill-button">
                    <MessageSquare style={{ width: '14px', height: '14px' }} />
                    <span>{commentsCount} Comments</span>
                </button>

                {/* Share Button */}
                <button className="pill-button">
                    <Share2 style={{ width: '14px', height: '14px' }} />
                    <span>Share</span>
                </button>
            </footer>
        </article>
    );
};