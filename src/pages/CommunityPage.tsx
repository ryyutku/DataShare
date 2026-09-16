// src/pages/CommunityPage.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Shield, MoreHorizontal, Bell, Trash2, Calendar, Globe, Mail, Users } from 'lucide-react';
import { 
  getCommunityBySlug, 
  getCommunityUserStatus, 
  getCommunityModerators,
  joinCommunity, 
  leaveCommunity, 
  deleteCommunity, 
  type Community 
} from '../services/communityService';
import { supabase } from '../services/supabaseclient';
import { LeftSidebar } from '../components/navigation/LeftSidebar';
import { type PageType } from '../components/navigation/Navbar';

interface CommunityPageProps {
  slug: string;
  onNavigate: (page: PageType, slug?: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ slug, onNavigate }) => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [isModerator, setIsModerator] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [moderators, setModerators] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOverflow, setShowOverflow] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

        // Fetch User Membership and Roles
        const status = await getCommunityUserStatus(data.id, data.created_by);
        setIsMember(status.isMember);
        setIsModerator(status.isModerator);
        setIsOwner(status.isOwner);

        // Fetch Moderators
        const mods = await getCommunityModerators(data.id);
        setModerators(mods);

        // Fetch Community Posts
        const { data: communityPosts } = await supabase
          .from('post')
          .select('id, title, description, created_at, author_id')
          .eq('community_id', data.id)
          .order('created_at', { ascending: false });

        setPosts(communityPosts || []);
      } catch (err) {
        console.error('Error loading community:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCommunityData();
  }, [slug]);

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
      alert(err.message || 'Failed to update membership');
    }
  };

  const handleDelete = async () => {
    if (!community) return;
    try {
      setDeleting(true);
      await deleteCommunity(community.id);
      window.dispatchEvent(new Event('community-updated'));
      alert(`r/${community.name} has been deleted.`);
      onNavigate('home');
    } catch (err: any) {
      alert(err.message || 'Failed to delete community');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
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
            We could not find r/{slug}. It may have been deleted.
          </p>
          <button 
            onClick={() => onNavigate('home')} 
            className="btn-action"
            style={{ marginTop: '16px', backgroundColor: '#FF4500', color: '#fff' }}
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
                style={{ cursor: 'pointer' }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>Create Post</span>
              </button>

              {/* Mod Tools (Owner/Mod) vs Join (Regular user) */}
              {isModerator ? (
                <button
                  type="button"
                  className="btn-action"
                  style={{ cursor: 'pointer', backgroundColor: '#272729', color: '#34d399' }}
                >
                  <Shield style={{ width: '16px', height: '16px' }} />
                  <span>Mod Tools</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleJoin}
                  className="btn-action"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isMember ? '#272729' : '#fff',
                    color: isMember ? '#D7DADC' : '#000',
                  }}
                >
                  {isMember ? 'Joined' : 'Join'}
                </button>
              )}

              {/* Overflow Menu with Delete */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowOverflow(!showOverflow)}
                  className="btn-action"
                  style={{ padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
                >
                  <MoreHorizontal style={{ width: '16px', height: '16px' }} />
                </button>

                {showOverflow && (
                  <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '180px', backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '12px', padding: '6px 0', zIndex: 30, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowOverflow(false);
                          setShowDeleteConfirm(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                        <span>Delete Community</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowOverflow(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: '#D7DADC', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <Bell style={{ width: '14px', height: '14px' }} />
                        <span>Mute Community</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
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

        {/* Empty Posts State */}
        {posts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0' }}>
              This community doesn't have any posts yet
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#818384', margin: '0 0 20px 0' }}>
              Make one and get this feed started.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('create-post')}
              className="btn-action"
              style={{ backgroundColor: '#FF4500', color: '#fff', padding: '10px 24px' }}
            >
              Create Post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={{ padding: '16px', backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0' }}>{post.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#D7DADC', margin: 0 }}>{post.description}</p>
            </div>
          ))
        )}
      </main>

      {/* Right Sidebar: About, Rules, Moderators */}
      <aside className="right-sidebar">
        <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#818384', margin: '0 0 10px 0' }}>
            About Community
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#D7DADC', lineHeight: 1.5, margin: '0 0 16px 0' }}>
            {community.description || 'Welcome to this community! Follow the rules and join discussions.'}
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
          >
            <Mail style={{ width: '14px', height: '14px' }} />
            <span>Message Mods</span>
          </button>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 60 }}>
          <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '16px', padding: '24px', maxWidth: '380px', width: '100%', color: '#D7DADC' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>Delete Community?</h3>
            <p style={{ fontSize: '0.85rem', color: '#818384', lineHeight: 1.4, margin: '0 0 20px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#fff' }}>r/{community.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-action"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn-action"
                style={{ backgroundColor: '#ef4444', color: '#fff' }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};