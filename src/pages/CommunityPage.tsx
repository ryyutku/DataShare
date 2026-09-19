// src/pages/CommunityPage.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Calendar, 
  Globe, 
  Mail, 
  Users, 
  Check, 
  MoreHorizontal, 
  ImageIcon 
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

  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [iconUrlInput, setIconUrlInput] = useState('');
  const [communityIcon, setCommunityIcon] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

        const savedIcon = localStorage.getItem(`community_icon_${data.id}`);
        if (savedIcon) setCommunityIcon(savedIcon);

        const status = await getCommunityUserStatus(data.id, data.created_by);
        setIsMember(status.isMember);
        setIsOwner(status.isOwner);

        const mods = await getCommunityModerators(data.id);
        setModerators(mods);

        // Load posts for this community
        let communityPosts = await getPosts(data.id);

        // Fallback filter
        if (!communityPosts || communityPosts.length === 0) {
          const allPosts = await getPosts();
          communityPosts = allPosts.filter(
            (p) =>
              p.community_id === data.id ||
              p.community?.slug?.toLowerCase() === data.slug.toLowerCase() ||
              p.community?.name?.toLowerCase() === data.name.toLowerCase()
          );
        }

        setPosts(communityPosts);
      } catch (err) {
        console.error('Error loading community:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCommunityData();
  }, [slug]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowOwnerMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      window.dispatchEvent(new Event('community-updated'));
    } catch (err: any) {
      alert(err.message || 'Failed to update membership.');
    }
  };

  const handleSaveCommunityIcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!community || !iconUrlInput.trim()) return;

    const url = iconUrlInput.trim();
    setCommunityIcon(url);
    localStorage.setItem(`community_icon_${community.id}`, url);
    setIsIconModalOpen(false);
    setIconUrlInput('');
  };

  // Complete real-time Reddit sorting algorithm
  const sortedPosts = useMemo(() => {
    const list = [...posts];
    switch (activeSort) {
      case 'new':
        // Newest timestamp first
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      case 'top':
        // Pure highest votes first
        return list.sort((a, b) => (b.upvotes_count || 0) - (a.upvotes_count || 0));
      
      case 'hot':
        // Reddit Hot algorithm: scores decayed by hours passed
        return list.sort((a, b) => {
          const ageA = Math.max(1, (Date.now() - new Date(a.created_at).getTime()) / 36e5);
          const ageB = Math.max(1, (Date.now() - new Date(b.created_at).getTime()) / 36e5);
          const hotA = (a.upvotes_count || 0) / Math.pow(ageA + 2, 1.25);
          const hotB = (b.upvotes_count || 0) / Math.pow(ageB + 2, 1.25);
          return hotB - hotA;
        });
      
      case 'best':
      default:
        // Highest total engagement
        return list.sort((a, b) => {
          const scoreA = (a.upvotes_count || 0) * 2 + (a.comments_count || 0);
          const scoreB = (b.upvotes_count || 0) * 2 + (b.comments_count || 0);
          return scoreB - scoreA;
        });
    }
  }, [posts, activeSort]);

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
      <LeftSidebar onNavigate={onNavigate} />

      <main className="main-feed">
        <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', marginBottom: '16px', position: 'relative' }}>
          <div style={{ height: '120px', width: '100%', borderTopLeftRadius: '15px', borderTopRightRadius: '15px', overflow: 'hidden', background: 'linear-gradient(90deg, #064e3b 0%, #042f2e 100%)' }} />

          <div style={{ padding: '0 20px 16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-40px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
              <div 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  backgroundColor: '#FF4500', 
                  border: '4px solid #1A1A1B', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  overflow: 'hidden'
                }}
              >
                {communityIcon ? (
                  <img src={communityIcon} alt={community.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Users style={{ width: '40px', height: '40px' }} />
                )}
              </div>

              <div style={{ paddingBottom: '4px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                  c/{community.name}
                </h1>
                <span style={{ fontSize: '0.8rem', color: '#818384' }}>c/{community.slug}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* PASSES COMMUNITY ID SO CREATE POST IS PRE-SELECTED */}
              <button
                type="button"
                onClick={() => onNavigate('create-post', community.id)}
                className="btn-action"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>Create Post</span>
              </button>

              {isOwner ? (
                <div style={{ position: 'relative' }} ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setShowOwnerMenu(!showOwnerMenu)}
                    className="btn-action"
                    style={{ padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Community Options"
                  >
                    <MoreHorizontal style={{ width: '16px', height: '16px' }} />
                  </button>

                  {showOwnerMenu && (
                    <div 
                      style={{ 
                        position: 'absolute', 
                        right: 0, 
                        top: '42px', 
                        zIndex: 1000, 
                        backgroundColor: '#1A1A1B', 
                        border: '1px solid #343536', 
                        borderRadius: '12px', 
                        padding: '6px', 
                        width: '210px', 
                        boxShadow: '0 16px 36px rgba(0,0,0,0.85)' 
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowOwnerMenu(false);
                          setIsIconModalOpen(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'none',
                          border: 'none',
                          color: '#D7DADC',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#272729')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <ImageIcon style={{ width: '15px', height: '15px', color: '#FF4500' }} />
                        <span>Change Community Icon</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
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

        {/* FEED SORTERS */}
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

        {/* POST FEED */}
        {sortedPosts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0' }}>
              This community doesn't have any posts yet
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#818384', margin: 0 }}>
              Make one and get this dataset feed started.
            </p>
          </div>
        ) : (
          sortedPosts.map((post) => (
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

        <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#818384', margin: '0 0 10px 0' }}>
            c/{community.name} Rules
          </h2>
          <ol style={{ fontSize: '0.8rem', color: '#D7DADC', paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Respect others and be civil</li>
            <li>Submit genuine, verifiable data</li>
            <li>No spam or self-promotion</li>
            <li>Follow platform dataset standards</li>
          </ol>
        </div>

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

      {/* ICON UPLOAD MODAL */}
      {isIconModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '24px', maxWidth: '420px', width: '100%', color: '#D7DADC' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon style={{ width: '18px', height: '18px', color: '#FF4500' }} />
                <span>Update Community Icon</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsIconModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#818384', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCommunityIcon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={iconUrlInput}
                  onChange={(e) => setIconUrlInput(e.target.value)}
                  required
                  style={{
                    backgroundColor: '#272729',
                    border: '1px solid #343536',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.8rem',
                    outline: 'none',
                  }}
                />
              </div>

              {iconUrlInput && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', backgroundColor: '#272729', borderRadius: '8px' }}>
                  <img
                    src={iconUrlInput}
                    alt="Preview"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#818384' }}>Image preview</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsIconModalOpen(false)}
                  className="btn-action"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-action"
                  style={{ backgroundColor: '#FF4500', color: '#fff', fontWeight: 600 }}
                >
                  Save Icon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};