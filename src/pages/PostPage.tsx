// src/pages/PostPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseclient';
import {
  getPostById,
  getSubmissionRows,
  submitRow,
  togglePostUpvote,
  toggleCommunityMembership,
  checkCommunityMembership,
  updatePost,
  deletePost,
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
import { Pencil, Trash2, Copy, Bookmark, Plus, X, Lock, ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { toggleUpvote, hasUserUpvoted, getPostUpvoteCount } from '../services/upvoteService';

interface PostPageProps {
  postId: string;
  onNavigate: (page: PageType, postId?: string) => void;
}

interface ColumnItem {
  id: string;
  name: string;
  type: string;
  exampleValue: string;
  isExisting: boolean; // existing columns cannot be deleted
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

  // Author Edit State
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editGoalCount, setEditGoalCount] = useState<number>(100);
  const [columnsList, setColumnsList] = useState<ColumnItem[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  // Dedicated Upvote / Downvote State
  const [upvotes, setUpvotes] = useState<number>(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

        // Fetch real votes and user's previous vote status
        const count = await getPostUpvoteCount(postId);
        setUpvotes(count);
        if (user) {
          const voted = await hasUserUpvoted(postId, user.id);
          if (voted) setUserVote('up');
        }

        // Populate Edit State
        setEditTitle(postData.title);
        setEditDescription(postData.description);
        setEditGoalCount(postData.goal_count || 100);

        // Convert existing schema + example_row into array of ColumnItems
        const currentCols: ColumnItem[] = Object.entries(postData.schema || {}).map(([name, type]) => ({
          id: name,
          name,
          type: String(type),
          exampleValue: String(postData.example_row?.[name] ?? ''),
          isExisting: true, // Marked as permanent (no deletion)
        }));
        setColumnsList(currentCols);
      } catch (err: any) {
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    }
    loadPostData();
  }, [postId]);

  // Click outside to close 3-dots dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAuthor = Boolean(currentUser && post && currentUser.id === post.author_id);

  const handleVote = async (type: 'up' | 'down') => {
    if (!currentUser || !post) {
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
      const currentlyHasRecord = await hasUserUpvoted(post.id, currentUser.id);

      if (shouldHaveUpvoteRecord && !currentlyHasRecord) {
        await toggleUpvote(post.id, currentUser.id);
      } else if (!shouldHaveUpvoteRecord && currentlyHasRecord) {
        await toggleUpvote(post.id, currentUser.id);
      }
    } catch (err) {
      setUserVote(previousVote);
      setUpvotes(previousCount);
      console.error('Vote failed:', err);
    } finally {
      setIsVoting(false);
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

  const countAllComments = (commentList: any[]): number => {
    return commentList.reduce((total, comment) => {
      return total + 1 + (comment.replies ? countAllComments(comment.replies) : 0);
    }, 0);
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

  // Add a new column to the draft list
  const handleAddNewColumn = () => {
    const newCol: ColumnItem = {
      id: crypto.randomUUID(),
      name: '',
      type: 'string',
      exampleValue: '',
      isExisting: false, // newly added, can be discarded before save
    };
    setColumnsList((prev) => [...prev, newCol]);
  };

  // Update column attributes (for example value, name of new column, etc.)
  const handleUpdateColumn = (id: string, updates: Partial<ColumnItem>) => {
    setColumnsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Discard a newly added column before saving
  const handleRemoveDraftColumn = (id: string) => {
    setColumnsList((prev) => prev.filter((c) => c.id !== id));
  };

  // Author Save Edit (Handles Title, Description, Goal, and Schema/Columns)
  const handleSavePostEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !editTitle.trim()) return;

    // Validate that all columns have a non-empty name
    for (const col of columnsList) {
      if (!col.name.trim()) {
        alert('All columns must have a valid name.');
        return;
      }
    }

    // Build the updated schema and example_row
    const updatedSchema: Record<string, string> = {};
    const updatedExampleRow: Record<string, any> = {};

    columnsList.forEach((c) => {
      const cleanName = c.name.trim().toLowerCase().replace(/\s+/g, '_');
      updatedSchema[cleanName] = c.type;
      updatedExampleRow[cleanName] =
        c.type === 'number' ? Number(c.exampleValue) || 0 : c.exampleValue || '';
    });

    try {
      setSavingEdit(true);
      const updated = await updatePost(post.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        goal_count: editGoalCount,
        schema: updatedSchema,
        example_row: updatedExampleRow,
      });

      setPost({
        ...post,
        title: updated.title,
        description: updated.description,
        goal_count: updated.goal_count,
        schema: updated.schema,
        example_row: updated.example_row,
      });

      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update post');
    } finally {
      setSavingEdit(false);
    }
  };

  // Author Delete
  const handleDeletePost = async () => {
    if (!post) return;
    if (confirm('Are you sure you want to delete this dataset request? This action cannot be undone.')) {
      try {
        await deletePost(post.id);
        alert('Post deleted successfully.');
        onNavigate('home');
      } catch (err: any) {
        alert(err.message || 'Failed to delete post');
      }
    }
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

            {/* Header: Reddit-Style Back Button + Info + 3-Dots */}
            <div className="flex items-center justify-between text-xs text-[#818384] mb-4 pb-3 border-b border-[#343536]/50">
              <div className="flex items-center gap-3">
                {/* SOPHISTICATED REDDIT BACK BUTTON */}
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  aria-label="Back"
                  className="w-8 h-8 rounded-full bg-[#272729] hover:bg-[#343536] text-[#D7DADC] border border-[#343536] flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16">
                    <path d="M17.5 9.1H4.679l5.487-5.462a.898.898 0 00.003-1.272.898.898 0 00-1.272-.003l-7.032 7a.898.898 0 000 1.275l7.03 7a.896.896 0 001.273-.003.898.898 0 00-.002-1.272l-5.487-5.462h12.82a.9.9 0 000-1.8Z"></path>
                  </svg>
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    onClick={() => onNavigate('community', post.community?.slug)}
                    className="font-bold text-[#D7DADC] hover:underline cursor-pointer"
                  >
                    r/{post.community?.slug || 'general'}
                  </span>
                  <span>•</span>
                  <span>Posted by u/{post.author?.username || 'anonymous'}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* REDDIT 3-DOTS OVERFLOW BUTTON */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  aria-label="Open user actions"
                  className="w-8 h-8 rounded-full hover:bg-[#272729] text-[#818384] hover:text-[#D7DADC] flex items-center justify-center transition cursor-pointer"
                  aria-haspopup="menu"
                  aria-expanded={showMenu}
                >
                  <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16">
                    <path d="M16 11.75a1.75 1.75 0 11.001-3.501A1.75 1.75 0 0116 11.75ZM11.75 10a1.75 1.75 0 10-3.501.001A1.75 1.75 0 0011.75 10Zm-6 0a1.75 1.75 0 10-3.501.001A1.75 1.75 0 005.75 10Z"></path>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 top-9 z-30 w-48 rounded-xl border border-[#343536] bg-[#1A1A1B] p-1.5 shadow-2xl">
                    {isAuthor && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setIsEditModalOpen(true);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#D7DADC] hover:bg-[#272729] transition text-left cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#FF4500]" />
                          <span>Edit Post &amp; Columns</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            handleDeletePost();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-[#272729] transition text-left cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Post</span>
                        </button>

                        <div className="my-1 border-t border-[#343536]" />
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setShowMenu(false);
                        alert('Link copied to clipboard!');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#818384] hover:text-[#D7DADC] hover:bg-[#272729] transition text-left cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        alert('Post saved to your profile!');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#818384] hover:text-[#D7DADC] hover:bg-[#272729] transition text-left cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save Post</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Post Title & Description */}
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
                    className="flex items-center gap-1.5 rounded-full bg-[#FF4500] hover:bg-[#E03D00] px-4 py-1.5 text-xs font-semibold text-white transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <span>+</span> Contribute Data
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={rows.length === 0}
                    className="flex items-center gap-1.5 rounded-full border border-[#343536] bg-[#1A1A1B] hover:bg-[#272729] px-4 py-1.5 text-xs font-semibold text-[#D7DADC] transition disabled:opacity-40 cursor-pointer"
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
              <div className="flex items-center bg-[#272729] rounded-full px-2 py-1 gap-1 text-xs">
                {/* UPVOTE (ORANGE) */}
                <button
                  type="button"
                  onClick={() => handleVote('up')}
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

                {/* SCORE */}
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

                {/* DOWNVOTE (BLUE) */}
                <button
                  type="button"
                  onClick={() => handleVote('down')}
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

              <span className="text-xs text-[#818384]">
                💬 {countAllComments(comments)} Comments
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
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer ${isJoined
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

      {/* Contribute Row Modal */}
      <ContributeRowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schema={post.schema || {}}
        exampleRow={post.example_row || {}}
        onSubmit={handleContributeRow}
      />

      {/* AUTHOR EDIT POST & COLUMNS MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#343536] bg-[#1A1A1B] p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#343536] pb-3 mb-4 shrink-0">
              <h2 className="text-base font-bold text-[#D7DADC] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#FF4500]" />
                Edit Dataset Request &amp; Schema
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#818384] hover:text-[#D7DADC] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePostEdit} className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#D7DADC]">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="rounded-lg border border-[#343536] bg-[#272729] px-3.5 py-2 text-xs text-[#D7DADC] focus:border-[#FF4500] focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#D7DADC]">Description / Instructions</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="rounded-lg border border-[#343536] bg-[#272729] p-3 text-xs text-[#D7DADC] focus:border-[#FF4500] focus:outline-none resize-y"
                />
              </div>

              {/* Target Rows Goal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#D7DADC]">Target Rows Goal</label>
                <input
                  type="number"
                  min="1"
                  value={editGoalCount}
                  onChange={(e) => setEditGoalCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="rounded-lg border border-[#343536] bg-[#272729] px-3.5 py-2 text-xs text-[#D7DADC] focus:border-[#FF4500] focus:outline-none w-36"
                />
              </div>

              {/* ================= COLUMNS / SCHEMA SECTION ================= */}
              <div className="flex flex-col gap-2 border-t border-[#343536] pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#D7DADC]">
                      Dataset Columns (Schema)
                    </h3>
                    <p className="text-[11px] text-[#818384] mt-0.5">
                      Existing columns are locked to preserve contributors' data. You can edit their sample values or add new columns.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewColumn}
                    className="flex items-center gap-1 rounded-lg bg-[#272729] hover:bg-[#343536] border border-[#343536] px-3 py-1.5 text-xs font-semibold text-[#D7DADC] transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FF4500]" />
                    <span>Add Column</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 mt-2">
                  {columnsList.map((col) => (
                    <div
                      key={col.id}
                      className="p-3 bg-[#272729]/60 border border-[#343536] rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5"
                    >
                      {/* Column Name */}
                      <div className="flex-1 w-full">
                        <label className="text-[10px] text-[#818384] mb-1 flex items-center gap-1 font-semibold">
                          {col.isExisting && <Lock className="w-3 h-3 text-[#818384]" />}
                          <span>Column Name</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. price_usd"
                          value={col.name}
                          disabled={col.isExisting}
                          onChange={(e) =>
                            handleUpdateColumn(col.id, {
                              name: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                            })
                          }
                          className={`w-full rounded-md border border-[#343536] px-2.5 py-1.5 text-xs text-[#D7DADC] focus:border-[#FF4500] focus:outline-none ${col.isExisting ? 'bg-[#1A1A1B] opacity-75 cursor-not-allowed font-mono' : 'bg-[#1A1A1B]'
                            }`}
                          required
                        />
                      </div>

                      {/* Data Type */}
                      <div className="w-full sm:w-36">
                        <label className="text-[10px] text-[#818384] mb-1 block font-semibold">
                          Data Type
                        </label>
                        <select
                          value={col.type}
                          disabled={col.isExisting}
                          onChange={(e) => handleUpdateColumn(col.id, { type: e.target.value })}
                          className={`w-full rounded-md border border-[#343536] px-2.5 py-1.5 text-xs text-[#D7DADC] focus:border-[#FF4500] focus:outline-none ${col.isExisting ? 'bg-[#1A1A1B] opacity-75 cursor-not-allowed' : 'bg-[#1A1A1B] cursor-pointer'
                            }`}
                        >
                          <option value="string">Text (string)</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="date">Date</option>
                          <option value="image_url">Image URL</option>
                        </select>
                      </div>

                      {/* Example Row Value */}
                      <div className="flex-1 w-full">
                        <label className="text-[10px] text-[#818384] mb-1 block font-semibold">
                          Example Value
                        </label>
                        <input
                          type="text"
                          placeholder="Sample data value"
                          value={col.exampleValue}
                          onChange={(e) => handleUpdateColumn(col.id, { exampleValue: e.target.value })}
                          className="w-full rounded-md border border-[#343536] bg-[#1A1A1B] px-2.5 py-1.5 text-xs text-[#D7DADC] focus:border-[#FF4500] focus:outline-none"
                        />
                      </div>

                      {/* Status / Remove button (only newly added columns can be discarded) */}
                      <div className="sm:self-end pb-0.5">
                        {col.isExisting ? (
                          <span
                            title="Existing columns cannot be deleted to preserve contributor rows"
                            className="inline-flex items-center gap-1 text-[11px] text-[#818384] px-2 py-1.5 bg-[#1A1A1B] rounded-md border border-[#343536] select-none"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveDraftColumn(col.id)}
                            title="Remove newly added column"
                            className="p-1.5 text-[#818384] hover:text-red-400 hover:bg-[#1A1A1B] rounded-md transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex justify-end gap-2 border-t border-[#343536] pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-full border border-[#343536] px-4 py-1.5 text-xs font-semibold text-[#818384] hover:bg-[#272729] hover:text-[#D7DADC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !editTitle.trim()}
                  className="rounded-full bg-[#FF4500] px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#E03D00] disabled:opacity-50 cursor-pointer"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};