// src/components/navigation/RightSidebar.tsx
import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../../services/supabaseclient';
import { getHistoryPostIds, clearHistory } from '../../services/profileService';
import { getPosts, type Post } from '../../services/postService';
import type { PageType } from './Navbar';

interface RightSidebarProps {
  onOpenCreate?: () => void;
  onNavigate?: (page: PageType, targetIdOrSlug?: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onNavigate }) => {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  const loadRecentPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      setCurrentUserId(userId);

      const historyIds = getHistoryPostIds(userId).slice(0, 10); // Up to 10 recent posts
      if (historyIds.length === 0) {
        setRecentPosts([]);
        return;
      }

      const allPosts = await getPosts();
      
      const postMap = new Map(allPosts.map((p) => [p.id, p]));
      const orderedPosts = historyIds
        .map((id) => postMap.get(id))
        .filter(Boolean) as Post[];

      setRecentPosts(orderedPosts);
    } catch (err) {
      console.error('Error loading recent posts:', err);
    }
  };

  useEffect(() => {
    loadRecentPosts();

    window.addEventListener('history-updated', loadRecentPosts);
    return () => window.removeEventListener('history-updated', loadRecentPosts);
  }, []);

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearHistory(currentUserId);
    setRecentPosts([]);
  };

  return (
    <aside
      className="right-sidebar"
      style={{
        position: 'sticky',
        top: '72px',
        height: 'calc(100vh - 88px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '6px',
        paddingBottom: '32px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border-color) transparent',
      }}
    >
      {/* 1. RECENT POSTS WIDGET (Expands vertically with up to 10 posts) */}
      <div 
        className="sidebar-widget"
        style={{
          flexShrink: 0,
          height: 'auto',
          minHeight: 'fit-content',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            <Clock style={{ width: '15px', height: '15px', color: 'var(--accent-orange)' }} />
            <span>Recent Posts</span>
          </h3>

          {recentPosts.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
              title="Clear recent history"
            >
              <Trash2 style={{ width: '12px', height: '12px' }} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {recentPosts.length === 0 ? (
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '6px 0', lineHeight: 1.4 }}>
            No recently viewed posts yet. Click on any dataset to see it here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            {recentPosts.map((p) => (
              <div
                key={p.id}
                className="recent-item cursor-pointer"
                onClick={() => onNavigate?.('post-detail', p.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <span
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    lineHeight: '1.35',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  className="hover:underline"
                >
                  {p.title}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  r/{p.community?.slug || 'general'} • {p.upvotes_count ?? 0} upvotes • {p.comments_count ?? 0} comments
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🚀 PROMOTIONAL AD 1: SUPABASE (Expands vertically without shrinking) */}
      <div
        className="sidebar-widget"
        style={{
          flexShrink: 0,
          height: 'auto',
          minHeight: 'fit-content',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            Promoted
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ad</span>
        </div>

        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
          Supabase Cloud Database
        </h4>
        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: '1.35', marginBottom: '10px' }}>
          Build scalable apps in minutes with Postgres, Auth &amp; Realtime APIs.
        </p>

        <a
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}
        >
          <img
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80"
            alt="Supabase Ad"
            style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
          />
        </a>

        <a
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            backgroundColor: 'var(--card-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            padding: '7px 12px',
            borderRadius: '999px',
            fontSize: '0.775rem',
            fontWeight: 600,
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          <span>Get Started Free</span>
          <ExternalLink style={{ width: '13px', height: '13px' }} />
        </a>
      </div>

      {/* 🚀 PROMOTIONAL AD 2: NEON POSTGRES (Expands vertically without shrinking) */}
      <div
        className="sidebar-widget"
        style={{
          flexShrink: 0,
          height: 'auto',
          minHeight: 'fit-content',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            Promoted
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ad</span>
        </div>

        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
          Neon Serverless Postgres
        </h4>
        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: '1.35', marginBottom: '10px' }}>
          Ship reliable features faster with serverless PostgreSQL and branching.
        </p>

        <a
          href="https://neon.tech"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}
        >
          <img
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
            alt="Neon Ad"
            style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
          />
        </a>

        <a
          href="https://neon.tech"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            backgroundColor: 'var(--card-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            padding: '7px 12px',
            borderRadius: '999px',
            fontSize: '0.775rem',
            fontWeight: 600,
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          <span>Claim Free Database</span>
          <ExternalLink style={{ width: '13px', height: '13px' }} />
        </a>
      </div>

      {/* Footer / Copyright links */}
      <div 
        style={{ 
          flexShrink: 0,
          padding: '4px 8px 16px 8px', 
          fontSize: '0.7rem', 
          color: 'var(--text-muted)', 
          lineHeight: '1.4' 
        }}
      >
        <p style={{ margin: 0 }}>DataShare Inc. © {new Date().getFullYear()}. All rights reserved.</p>
      </div>
    </aside>
  );
};