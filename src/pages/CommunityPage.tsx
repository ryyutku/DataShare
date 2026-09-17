// src/pages/CommunityPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Globe, 
  Mail, 
  Users,
  Check
} from 'lucide-react';
import { 
  getCommunityBySlug, 
  getCommunityUserStatus, 
  getCommunityModerators,
  joinCommunity, 
  leaveCommunity, 
  type Community 
} from '../services/communityService';
import { getPosts, type Post } from '../services/postService';
import { LeftSidebar } from '../components/navigation/LeftSidebar';
import { PostCard } from '../components/ui/PostCard';
import { type PageType } from '../components/navigation/Navbar';

interface CommunityPageProps {
  slug: string;
  onNavigate: (page: PageType, targetIdOrSlug?: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ slug, onNavigate }) => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [moderators, setModerators] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState<'best' | 'hot' | 'new' | 'top'>('best');

  useEffect(() => {
    async function loadCommunityData() {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getCommunityBySlug(slug);

        if (!data) {
          setCommunity(null);
          return;
        }

        setCommunity(data);

        // Fetch User Membership and Ownership status
        const status = await getCommunityUserStatus(data.id, data.created_by);
        setIsMember(status.isMember);
        setIsOwner(status.isOwner);

        // Fetch Moderators
        const mods = await getCommunityModerators(data.id);
        setModerators(mods);

        // Fetch Community Posts with author & relations
        const communityPosts = await getPosts(data.id);
        setPosts(communityPosts || []);
      } catch (err) {
        console.error('Error loading community:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCommunityData();
  }, [slug]);

  // Handle Join / Leave Community Toggle (for non-owners only)
  const handleToggleJoin = async () => {
    if (!community) return;
    try {
      if (isMember) {
        await leaveCommunity(community.id);
        setIsMember(false);
      } else {
        await joinCommunity(community.id);
        setIsMember(true);
      }
      // Broadcast event so LeftSidebar updates "Joined Communities" in real-time
      window.dispatchEvent(new Event('community-updated'));
    } catch (err: any) {
      alert(err.message || 'Failed to update membership. Make sure you are logged in.');
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <LeftSidebar onNavigate={onNavigate} />
        <main className="main-feed" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Loading community...
        </main>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="app-layout">
        <LeftSidebar onNavigate={onNavigate} />
        <main className="main-feed" style={{ textAlign: 'center', padding: '48px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>Community not found</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            We could not find r/{slug}.
          </p>
          <button 
            onClick={() => onNavigate('home')} 
            className="btn-action"
            style={{ marginTop: '16px', backgroundColor: '#FF4500', color: '#fff', padding: '8px 20px', borderRadius: '999px', cursor: 'pointer' }}
          >
            Return Home
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Left Navigation */}
      <LeftSidebar onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="main-feed">
        {/* Banner & Header */}
        <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          {/* Banner Graphic */}
          <div style={{ height: '120px', width: '100%', background: 'linear-gradient(90deg, #064e3b 0%, #042f2e 100%)' }} />

          {/* Subreddit Info Row */}
          <div style={{ padding: '0 20px 16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-40px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FF4500', border: '4px solid #1A1A1B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                <Users style={{ width: '40px', height: '40px' }} />
              </div>
              <div style={{ paddingBottom: '4px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                  r/{community.name}
                </h1>
                <span style={{ fontSize: '0.8rem', color: '#818384' }}>r/{community.slug}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onNavigate('create-post')}
                className="btn-action"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>Create Post</span>
              </button>

              {/* ONLY NON-OWNERS CAN SEE AND CLICK THE JOIN / JOINED BUTTON */}
              {!isOwner && (
                <button
                  type="button"
                  onClick={handleToggleJoin}
                  className="btn-action"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: isMember ? '#272729' : '#FF4500',
                    color: isMember ? '#D7DADC' : '#fff',
                    border: isMember ? '1px solid #343536' : 'none',
                    fontWeight: 600,
                  }}
                >
                  {isMember ? (
                    <>
                      <Check style={{ width: '14px', height: '14px', color: '#34d399' }} />
                      <span>Joined</span>
                    </>
                  ) : (
                    <span>+ Join</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feed Sorter */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '12px', padding: '8px', marginBottom: '16px' }}>
          {(['best', 'hot', 'new', 'top'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setActiveSort(sort)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                background: activeSort === sort ? '#272729' : 'none',
                color: activeSort === sort ? '#fff' : '#818384',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {sort}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0' }}>
              This community doesn't have any posts yet
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#818384', margin: '0 0 20px 0' }}>
              Make one and get this dataset feed started.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('create-post')}
              className="btn-action"
              style={{ backgroundColor: '#FF4500', color: '#fff', padding: '10px 24px', borderRadius: '999px' }}
            >
              Create Post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              community={community.slug}
              author={post.author?.username || 'anonymous'}
              timeAgo={new Date(post.created_at).toLocaleDateString()}
              title={post.title}
              bodyText={post.description}
              imageUrl={undefined}
              initialVotes={post.upvotes_count ?? 0}
              commentsCount={post.comments_count ?? 0}
              onOpen={(postId) => onNavigate('post-detail', postId)}
            />
          ))
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="right-sidebar">
        <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#818384', margin: '0 0 10px 0' }}>
            About Community
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#D7DADC', lineHeight: 1.5, margin: '0 0 16px 0' }}>
            {community.description || 'Welcome to this community! Follow the rules and participate in datasets.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid #343536', fontSize: '0.8rem', color: '#818384' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar style={{ width: '16px', height: '16px' }} />
              <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe style={{ width: '16px', height: '16px' }} />
              <span>Public Community</span>
            </div>
          </div>
        </div>

        {/* Community Rules */}
        <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#818384', margin: '0 0 10px 0' }}>
            r/{community.name} Rules
          </h2>
          <ol style={{ fontSize: '0.8rem', color: '#D7DADC', paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Respect others and be civil</li>
            <li>Submit genuine, verifiable data</li>
            <li>No spam or self-promotion</li>
            <li>Follow platform dataset standards</li>
          </ol>
        </div>

        {/* Moderators */}
        <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '16px' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#818384', margin: '0 0 10px 0' }}>
            Moderators
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#D7DADC', fontWeight: 600, marginBottom: '12px' }}>
            u/{community.creator?.username || 'Moderator'}
          </div>
          <button
            type="button"
            className="btn-action"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => alert(`Messaging u/${community.creator?.username || 'Moderator'}`)}
          >
            <Mail style={{ width: '14px', height: '14px' }} />
            <span>Message Mods</span>
          </button>
        </div>
      </aside>
    </div>
  );
};