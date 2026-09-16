// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { LeftSidebar } from '../components/navigation/LeftSidebar';
import { ProfileHeader } from '../components/profile/profileHeader';
import { ProfileTabs, type ProfileTab } from '../components/profile/profileTabs';
import { ProfileRightSidebar } from '../components/profile/profileRightSide';
import { PostCard } from '../components/ui/PostCard';
import { getPosts, type Post } from '../services/postService';
import type { UserProfile } from '../types/profile';
import { Plus } from 'lucide-react';

interface ProfilePageProps {
  onNavigate?: (page: 'home' | 'profile' | 'create-post') => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('Overview');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileData: UserProfile = {
    username: 'Ryutku',
    displayName: 'Ryutku',
    karma: 3,
    contributionsCount: 3,
    cakeDay: '3 years',
    followersCount: 0,
    activeCommunitiesCount: 3,
    achievementsCount: 9,
    trophies: ['Three-Year Club']
  };

  useEffect(() => {
    async function loadUserPosts() {
      try {
        setLoading(true);
        const data = await getPosts();
        setPosts(data.filter((p) => p.author?.username === profileData.username));
      } catch (err: any) {
        setError(err.message || 'Failed to load user posts');
      } finally {
        setLoading(false);
      }
    }

    loadUserPosts();
  }, []);

  return (
    <div className="app-layout">
      {/* Left Navigation */}
      <LeftSidebar />

      {/* Profile Content Feed */}
      <main className="main-feed">
        <ProfileHeader 
          displayName={profileData.displayName} 
          username={profileData.username} 
        />

        <ProfileTabs 
          activeTab={activeTab} 
          onSelectTab={setActiveTab} 
        />

        <div className="feed-controls">
          <button 
            className="btn-action" 
            onClick={() => onNavigate?.('create-post')}
            style={{ backgroundColor: 'var(--accent-orange)', color: '#fff' }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>Create Post</span>
          </button>
        </div>

        {loading && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }}>
            Loading posts by u/{profileData.username}...
          </div>
        )}

        {error && (
          <div style={{ color: '#ff4500', textAlign: 'center', padding: '32px' }}>
            Error: {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }}>
            u/{profileData.username} hasn't posted anything yet.
          </div>
        )}

        {!loading &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              community={post.community?.name || post.community?.slug || 'r/general'}
              author={post.author?.username || 'anonymous'}
              timeAgo={new Date(post.created_at).toLocaleDateString()}
              title={post.title}
              bodyText={post.description}
              imageUrl={undefined}
              initialVotes={post.upvotes_count ?? 0}
              commentsCount={post.comments_count ?? 0}
            />
          ))}
      </main>

      {/* Right Sidebar with working Sign Out callback */}
      <ProfileRightSidebar 
        profile={profileData} 
        onSignOut={() => onNavigate?.('home')} 
      />
    </div>
  );
}