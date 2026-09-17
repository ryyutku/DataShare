// src/components/ui/CommentSection.tsx
import React, { useState } from 'react';
import type { Comment } from '../../services/commentService';

interface CommentSectionProps {
  comments: Comment[];
  currentUserId?: string;
  onAddComment: (body: string, parentCommentId?: string | null) => Promise<void>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  currentUserId,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleTopLevelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      await onAddComment(newComment);
      setNewComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4 border-t border-[#343536] pt-4">
      <h3 className="text-sm font-bold text-[#D7DADC]">Comments</h3>

      <form onSubmit={handleTopLevelSubmit} className="flex flex-col gap-2 rounded-xl border border-[#343536] bg-[#1A1A1B] p-3">
        <textarea
          rows={3}
          placeholder={currentUserId ? 'What are your thoughts on this dataset?' : 'Log in to join the conversation'}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!currentUserId}
          className="w-full resize-y bg-transparent text-xs text-[#D7DADC] placeholder-[#818384] outline-none"
        />
        <div className="flex justify-end border-t border-[#343536] pt-2">
          <button
            type="submit"
            disabled={submitting || !newComment.trim() || !currentUserId}
            className="rounded-full bg-[#FF4500] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#E03D00] disabled:opacity-50 transition"
          >
            {submitting ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {comments.length === 0 ? (
          <p className="text-xs text-[#818384] text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((c) => (
            <CommentNode key={c.id} comment={c} onReply={onAddComment} currentUserId={currentUserId} />
          ))
        )}
      </div>
    </div>
  );
};

interface CommentNodeProps {
  comment: Comment;
  onReply: (body: string, parentCommentId?: string | null) => Promise<void>;
  currentUserId?: string;
}

const CommentNode: React.FC<CommentNodeProps> = ({ comment, onReply, currentUserId }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      setSubmittingReply(true);
      await onReply(replyText, comment.id);
      setReplyText('');
      setShowReplyBox(false);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 border-l-2 border-[#343536] pl-3 py-1 text-xs">
      <div className="flex items-center gap-2 text-[#818384]">
        <span className="font-bold text-[#D7DADC]">u/{comment.author?.username || 'anonymous'}</span>
        <span>•</span>
        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
      </div>

      <p className="text-[#D7DADC] leading-relaxed my-1">{comment.body}</p>

      <div className="flex items-center gap-3">
        {currentUserId && (
          <button
            type="button"
            onClick={() => setShowReplyBox((v) => !v)}
            className="text-[11px] font-semibold text-[#818384] hover:text-[#D7DADC]"
          >
            Reply
          </button>
        )}
      </div>

      {showReplyBox && (
        <div className="mt-2 flex flex-col gap-2 rounded-lg border border-[#343536] bg-[#272729] p-2.5">
          <textarea
            rows={2}
            placeholder={`Reply to u/${comment.author?.username || 'user'}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full resize-none bg-transparent text-xs text-[#D7DADC] outline-none placeholder-[#818384]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReplyBox(false)}
              className="rounded-full px-3 py-1 text-[11px] text-[#818384] hover:bg-[#343536]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submittingReply || !replyText.trim()}
              onClick={handleSendReply}
              className="rounded-full bg-[#FF4500] px-3.5 py-1 text-[11px] font-semibold text-white hover:bg-[#E03D00] disabled:opacity-50"
            >
              {submittingReply ? 'Replying...' : 'Reply'}
            </button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {comment.replies.map((reply) => (
            <CommentNode key={reply.id} comment={reply} onReply={onReply} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
};