// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseclient';
import { LeftSidebar } from '../components/navigation/LeftSidebar';
import { PostCard } from '../components/ui/PostCard';
import { ProfileRightSidebar } from '../components/profile/profileRightSide';
import {
  getUserPosts,
  getUserContributions,
  getUserComments,
  getUserInteractedPosts,
  getUserSavedPosts,
  type UserCommentItem,
} from '../services/profileService';
import { type Post } from '../services/postService';
import { type PageType } from '../components/navigation/Navbar';
import {
  FileText,
  Database,
  MessageSquare,
  Bookmark,
  Clock
} from 'lucide-react';

export type ProfileTab = 'posts' | 'contributions' | 'comments' | 'saved' | 'history';

interface ProfilePageProps {
  onNavigate?: (page: PageType, targetIdOrSlug?: string) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tab Arrays
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [contributedPosts, setContributedPosts] = useState<Post[]>([]);
  const [userComments, setUserComments] = useState<UserCommentItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [historyPosts, setHistoryPosts] = useState<Post[]>([]);

  // Stats
  const [stats, setStats] = useState({
    karma: 0,
    contributionsCount: 0,
    postsCount: 0,
    createdDate: 'Recently',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        setCurrentUser(user);

        // Fetch username from metadata or public.user table
        const { data: userData } = await supabase
          .from('user')
          .select('username, created_at')
          .eq('id', user.id)
          .maybeSingle();

        const currentUsername =
          userData?.username || user.user_metadata?.username || user.email?.split('@')[0] || 'User';

        // Load all profile categories in parallel
        const [postsData, contribsData, commentsData, historyData, savedData] = await Promise.all([
          getUserPosts(user.id, currentUsername),
          getUserContributions(user.id),
          getUserComments(user.id),
          getUserInteractedPosts(user.id),
          getUserSavedPosts(user.id),
        ]);

        setUserPosts(postsData);
        setContributedPosts(contribsData);
        setUserComments(commentsData);
        setHistoryPosts(historyData);
        setSavedPosts(savedData);

        // Dynamic Karma calculation: (Upvotes on your posts) + (Data Contributions * 2)
        const totalUpvotes = postsData.reduce((acc, p) => acc + (p.upvotes_count || 0), 0);
        const userDate = userData?.created_at || user.created_at;
        const dateFormatted = userDate
          ? new Date(userDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
          : 'Recently';

        setStats({
          karma: totalUpvotes + contribsData.length * 2,
          contributionsCount: contribsData.length,
          postsCount: postsData.length,
          createdDate: dateFormatted,
        });
      } catch (err) {
        console.error('Error loading profile page:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (onNavigate) onNavigate('home');
  };

  const username = currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="app-layout">
      {/* Left Navigation */}
      <LeftSidebar onNavigate={onNavigate} />

      {/* Main Profile Feed */}
      <main className="main-feed">
        {/* Banner Card Header */}
        <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ height: '110px', width: '100%', background: 'linear-gradient(90deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%)' }} />

          <div style={{ padding: '0 20px 16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-36px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  backgroundColor: '#FF4500',
                  border: '4px solid #1A1A1B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '2rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                }}
              >
                {username[0]?.toUpperCase() || 'U'}
              </div>

              <div style={{ paddingBottom: '4px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {username}
                </h1>
                <span style={{ fontSize: '0.8rem', color: '#818384' }}>u/{username}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate?.('create-post')}
              className="btn-action"
              style={{ backgroundColor: '#FF4500', color: '#fff', padding: '6px 16px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              + Create Post
            </button>
          </div>

          {/* Reddit-Style Profile Tabs */}
          <div style={{ display: 'flex', borderTop: '1px solid #343536', padding: '0 12px', overflowX: 'auto' }}>
            {[
              { id: 'posts', label: 'Posts', icon: FileText, count: userPosts.length },
              { id: 'contributions', label: 'Contributions', icon: Database, count: contributedPosts.length },
              { id: 'comments', label: 'Comments', icon: MessageSquare, count: userComments.length },
              { id: 'saved', label: 'Saved', icon: Bookmark, count: savedPosts.length },
              { id: 'history', label: 'History', icon: Clock, count: historyPosts.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ProfileTab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #FF4500' : '3px solid transparent',
                    color: isActive ? '#D7DADC' : '#818384',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s ease',
                  }}
                >
                  <Icon style={{ width: '15px', height: '15px' }} />
                  <span>{tab.label}</span>
                  <span style={{ fontSize: '0.7rem', backgroundColor: '#272729', padding: '2px 6px', borderRadius: '999px', color: '#818384' }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FEED CONTENT - All rendered as PostCard */}
        {loading ? (
          <div style={{ color: '#818384', textAlign: 'center', padding: '48px' }}>
            Loading {activeTab}...
          </div>
        ) : (
          <div>
            {/* TAB 1: Posts (Created by User) */}
            {activeTab === 'posts' && (
              userPosts.length === 0 ? (
                <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: '#818384', margin: 0, fontSize: '0.9rem' }}>You haven't posted any data requests yet.</p>
                </div>
              ) : (
                userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    community={post.community?.slug || 'general'}
                    author={username}
                    timeAgo={new Date(post.created_at).toLocaleDateString()}
                    title={post.title}
                    bodyText={post.description}
                    imageUrl={undefined}
                    initialVotes={post.upvotes_count ?? 0}
                    commentsCount={post.comments_count ?? 0}
                    onOpen={(id) => onNavigate?.('post-detail', id)}
                  />
                ))
              )
            )}

            {/* TAB 2: Contributions (Data rows + Discussions contributed) */}
            {activeTab === 'contributions' && (
              contributedPosts.length === 0 ? (
                <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: '#818384', margin: 0, fontSize: '0.9rem' }}>No data points or contributions submitted yet.</p>
                </div>
              ) : (
                contributedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    community={post.community?.slug || 'general'}
                    author={post.author?.username || 'user'}
                    timeAgo={new Date(post.created_at).toLocaleDateString()}
                    title={post.title}
                    bodyText={post.description}
                    imageUrl={undefined}
                    initialVotes={post.upvotes_count ?? 0}
                    commentsCount={post.comments_count ?? 0}
                    onOpen={(id) => onNavigate?.('post-detail', id)}
                  />
                ))
              )
            )}

            {/* TAB 3: Comments */}
            {activeTab === 'comments' && (
              userComments.length === 0 ? (
                <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: '#818384', margin: 0, fontSize: '0.9rem' }}>You haven't commented on any posts yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {userComments.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onNavigate?.('post-detail', c.post?.id)}
                      style={{
                        backgroundColor: '#1A1A1B',
                        border: '1px solid #343536',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#818384')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#343536')}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#818384', marginBottom: '6px' }}>
                        Commented on <strong style={{ color: '#D7DADC' }}>{c.post?.title || 'Post'}</strong> in r/{c.post?.community?.slug || 'general'} • {new Date(c.created_at).toLocaleDateString()}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#D7DADC', margin: 0, lineHeight: 1.4 }}>
                        {c.body}
                      </p>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB 4: Saved Posts */}
            {activeTab === 'saved' && (
              savedPosts.length === 0 ? (
                <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: '#818384', margin: 0, fontSize: '0.9rem' }}>No saved posts yet. Click the 3-dots menu on any post to save it.</p>
                </div>
              ) : (
                savedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    community={post.community?.slug || 'general'}
                    author={post.author?.username || 'user'}
                    timeAgo={new Date(post.created_at).toLocaleDateString()}
                    title={post.title}
                    bodyText={post.description}
                    imageUrl={undefined}
                    initialVotes={post.upvotes_count ?? 0}
                    commentsCount={post.comments_count ?? 0}
                    onOpen={(id) => onNavigate?.('post-detail', id)}
                  />
                ))
              )
            )}

            {/* TAB 5: History (Viewed & Interacted Posts) */}
            {activeTab === 'history' && (
              historyPosts.length === 0 ? (
                <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: '#818384', margin: 0, fontSize: '0.9rem' }}>No voting or viewing history found.</p>
                </div>
              ) : (
                historyPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    community={post.community?.slug || 'general'}
                    author={post.author?.username || 'user'}
                    timeAgo={new Date(post.created_at).toLocaleDateString()}
                    title={post.title}
                    bodyText={post.description}
                    imageUrl={undefined}
                    initialVotes={post.upvotes_count ?? 0}
                    commentsCount={post.comments_count ?? 0}
                    onOpen={(id) => onNavigate?.('post-detail', id)}
                  />
                ))
              )
            )}
          </div>
        )}
      </main>

      {/* Profile Right Sidebar Component */}
      <ProfileRightSidebar
        username={username}
        email={currentUser?.email}
        stats={stats}
        onSignOut={handleSignOut}
      />
    </div>
  );
}