// src/pages/PostPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseclient';
import {
  getPostById,
  getSubmissionRows,
  submitRow,
  togglePostUpvote,
  toggleCommunityMembership,
  checkCommunityMembership,
  type Post,
  type SubmissionRow,
} from '../services/postService';
import {
  getCommentsByPostId,
  addComment,
  type Comment,
} from '../services/commentService';
import { ContributeRowModal } from '../components/ui/ContributeRowModal';
import { CommentSection } from '../components/ui/CommentSection';
import type { PageType } from '../components/navigation/Navbar';

interface PostPageProps {
  postId: string;
  onNavigate: (page: PageType, postId?: string) => void;
}

export const PostPage: React.FC<PostPageProps> = ({ postId, onNavigate }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadPostData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const postData = await getPostById(postId, user?.id);
        if (!postData) throw new Error('Dataset post not found.');

        const [rowsData, commentsData] = await Promise.all([
          getSubmissionRows(postId),
          getCommentsByPostId(postId),
        ]);

        if (user && postData.community?.id) {
          const membership = await checkCommunityMembership(postData.community.id, user.id);
          setIsJoined(membership);
        }

        setPost(postData);
        setRows(rowsData);
        setComments(commentsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    }
    loadPostData();
  }, [postId]);

  const handleVote = async () => {
    if (!currentUser || !post) return;
    const previousVoted = post.has_upvoted;
    const previousScore = post.upvotes_count || 0;

    setPost({
      ...post,
      has_upvoted: !previousVoted,
      upvotes_count: previousVoted ? previousScore - 1 : previousScore + 1,
    });

    try {
      await togglePostUpvote(post.id, currentUser.id);
    } catch {
      setPost({ ...post, has_upvoted: previousVoted, upvotes_count: previousScore });
    }
  };

  const handleJoinToggle = async () => {
    if (!currentUser || !post?.community?.id) return;
    const nextState = !isJoined;
    setIsJoined(nextState);
    await toggleCommunityMembership(post.community.id, currentUser.id);
  };

  const handleContributeRow = async (rowData: Record<string, any>) => {
    if (!currentUser || !post) return;
    await submitRow(post.id, currentUser.id, rowData);
    const updatedRows = await getSubmissionRows(post.id);
    setRows(updatedRows);
  };

  const handleAddComment = async (body: string, parentCommentId: string | null = null) => {
    if (!currentUser || !post) return;
    await addComment({
      post_id: post.id,
      user_id: currentUser.id,
      body,
      parent_comment_id: parentCommentId,
    });
    const updated = await getCommentsByPostId(post.id);
    setComments(updated);
  };

  const handleExportCSV = () => {
    if (!post || rows.length === 0) return;
    const headers = Object.keys(post.schema);
    const csvRows: string[] = [];

    csvRows.push(headers.join(','));

    rows.forEach((r) => {
      const values = headers.map((header) => {
        const val = r.data[header] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${post.title.toLowerCase().replace(/\s+/g, '_')}_dataset.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0E1113] p-12 text-center text-sm text-[#818384]">Loading dataset post...</div>;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0E1113] p-12 text-center text-sm text-red-400">
        {error || 'Post not found.'}
        <div className="mt-4">
          <button onClick={() => onNavigate('home')} className="text-xs text-[#FF4500] underline">
            Back to Home Feed
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((rows.length / (post.goal_count || 1)) * 100));

  return (
    <div className="min-h-screen bg-[#0E1113] text-[#D7DADC] font-sans pb-16">
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= MAIN COLUMN ================= */}
        <main className="lg:col-span-2 flex flex-col gap-4">
          <article className="rounded-xl border border-[#343536] bg-[#1A1A1B] p-5 shadow-sm">
            
            <div className="flex items-center justify-between text-xs text-[#818384] mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#D7DADC] hover:underline cursor-pointer">
                  r/{post.community?.slug || 'general'}
                </span>
                <span>•</span>
                <span>Posted by u/{post.author?.username || 'anonymous'}</span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="hover:text-[#D7DADC] text-xs font-semibold"
              >
                ← Back
              </button>
            </div>

            <h1 className="text-xl font-bold text-[#D7DADC] mb-2">{post.title}</h1>
            <p className="text-xs text-[#D7DADC]/90 leading-relaxed whitespace-pre-line mb-6">
              {post.description}
            </p>

            {/* Collection Progress & Actions */}
            <div className="rounded-xl border border-[#343536] bg-[#272729]/50 p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#D7DADC]">Collection Progress</span>
                  <span className="text-xs text-[#818384]">
                    ({rows.length} of {post.goal_count} rows contributed)
                  </span>
                </div>
                <span className="text-xs font-bold text-[#FF4500]">{progressPercent}%</span>
              </div>

              <div className="w-full bg-[#1A1A1B] h-2.5 rounded-full overflow-hidden border border-[#343536]">
                <div
                  className="bg-[#FF4500] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#343536]/60">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    disabled={!currentUser}
                    className="flex items-center gap-1.5 rounded-full bg-[#FF4500] hover:bg-[#E03D00] px-4 py-1.5 text-xs font-semibold text-white transition shadow-sm disabled:opacity-50"
                  >
                    <span>+</span> Contribute Data
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={rows.length === 0}
                    className="flex items-center gap-1.5 rounded-full border border-[#343536] bg-[#1A1A1B] hover:bg-[#272729] px-4 py-1.5 text-xs font-semibold text-[#D7DADC] transition disabled:opacity-40"
                  >
                    <span>📥</span> Export CSV ({rows.length})
                  </button>
                </div>

                {!currentUser && (
                  <span className="text-[11px] text-[#818384] italic">
                    Log in to contribute data points.
                  </span>
                )}
              </div>
            </div>

            {/* Table Preview */}
            <div className="rounded-xl border border-[#343536] bg-[#1A1A1B] overflow-hidden mb-6">
              <div className="bg-[#272729] px-4 py-2 border-b border-[#343536] flex justify-between items-center">
                <span className="text-xs font-bold text-[#D7DADC] uppercase tracking-wider">
                  Dataset Schema &amp; Submissions
                </span>
                <span className="text-[11px] text-[#818384]">Showing {rows.length} rows</span>
              </div>

              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#343536] bg-[#1A1A1B] text-[#818384]">
                      <th className="py-2.5 px-3 font-semibold">Contributor</th>
                      {Object.entries(post.schema || {}).map(([field, type]) => (
                        <th key={field} className="py-2.5 px-3 font-semibold">
                          {field} <span className="text-[10px] font-mono text-[#818384]">({String(type)})</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#343536] text-[#D7DADC]">
                    {post.example_row && (
                      <tr className="bg-[#FF4500]/5 text-[#818384] italic">
                        <td className="py-2 px-3 text-[11px] font-medium text-[#FF4500]">Sample Row</td>
                        {Object.keys(post.schema || {}).map((field) => (
                          <td key={field} className="py-2 px-3 text-[11px]">
                            {String(post.example_row[field] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    )}

                    {rows.map((row) => (
                      <tr key={row.id} className="hover:bg-[#272729]/50 transition">
                        <td className="py-2 px-3 font-medium text-[#D7DADC]">
                          u/{row.contributor?.username || 'anonymous'}
                        </td>
                        {Object.keys(post.schema || {}).map((field) => (
                          <td key={field} className="py-2 px-3">
                            {String(row.data[field] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Voting bar */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleVote}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  post.has_upvoted
                    ? 'border-[#FF4500] text-[#FF4500] bg-[#FF4500]/10'
                    : 'border-[#343536] text-[#818384] hover:bg-[#272729] hover:text-[#D7DADC]'
                }`}
              >
                <span>▲</span>
                <span>{post.upvotes_count ?? 0}</span>
              </button>

              <span className="text-xs text-[#818384]">
                💬 {comments.length} Comments
              </span>
            </div>

            {/* Comment Section */}
            <CommentSection
              comments={comments}
              currentUserId={currentUser?.id}
              onAddComment={handleAddComment}
            />
          </article>
        </main>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="hidden lg:flex flex-col gap-4">
          {post.community && (
            <div className="rounded-xl border border-[#343536] bg-[#1A1A1B] p-4">
              <div className="flex items-center justify-between border-b border-[#343536] pb-3 mb-3">
                <h3 className="font-bold text-sm text-[#D7DADC]">r/{post.community.slug}</h3>
                <button
                  type="button"
                  onClick={handleJoinToggle}
                  disabled={!currentUser}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                    isJoined
                      ? 'border border-[#343536] text-[#D7DADC] hover:bg-[#272729]'
                      : 'bg-[#FF4500] text-white hover:bg-[#E03D00]'
                  }`}
                >
                  {isJoined ? 'Joined' : 'Join'}
                </button>
              </div>

              <p className="text-xs text-[#818384] leading-relaxed mb-4">
                {post.community.description || 'Collaborative research and data-sharing community.'}
              </p>

              <div className="grid grid-cols-2 gap-2 border-t border-[#343536] pt-3 text-center">
                <div>
                  <div className="text-sm font-bold text-[#D7DADC]">{rows.length}</div>
                  <div className="text-[10px] text-[#818384]">Total Rows</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#D7DADC]">{post.goal_count}</div>
                  <div className="text-[10px] text-[#818384]">Goal Rows</div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[#343536] bg-[#1A1A1B] p-4">
            <h4 className="font-bold text-xs text-[#D7DADC] uppercase tracking-wider mb-2">
              Contribution Guidelines
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#818384]">
              <li>Provide verified, clean data.</li>
              <li>Match types requested in schema.</li>
              <li>Avoid duplicates and test inputs.</li>
              <li>Never post private or identifying information.</li>
            </ol>
          </div>

          <footer className="px-2 text-xs text-[#818384] flex flex-wrap gap-x-3 gap-y-1">
            <a href="#" className="hover:underline">Data Guidelines</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <p className="w-full mt-2 text-[11px] text-zinc-600">DataShare Platform © 2026</p>
          </footer>
        </aside>
      </div>

      <ContributeRowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schema={post.schema || {}}
        exampleRow={post.example_row || {}}
        onSubmit={handleContributeRow}
      />
    </div>
  );
};