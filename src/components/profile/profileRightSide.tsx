// src/components/profile/profileRightSide.tsx
import React from 'react';
import { Award, Calendar, LogOut, ShieldCheck, ExternalLink } from 'lucide-react';

export interface ProfileStats {
  karma: number;
  contributionsCount: number;
  postsCount: number;
  createdDate: string;
}

interface ProfileRightSidebarProps {
  username: string;
  email?: string;
  stats: ProfileStats;
  onSignOut: () => void;
}

export const ProfileRightSidebar: React.FC<ProfileRightSidebarProps> = ({
  username,
  email,
  stats,
  onSignOut,
}) => {
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
      {/* 1. Main Profile Card */}
      <div
        className="sidebar-widget"
        style={{
          flexShrink: 0,
          backgroundColor: '#1A1A1B',
          border: '1px solid #343536',
          borderRadius: '16px',
          padding: '16px',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* User Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#FF4500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.35rem',
              fontWeight: 800,
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
              flexShrink: 0,
            }}
          >
            {username[0]?.toUpperCase() || 'U'}
          </div>

          <div style={{ overflow: 'hidden' }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#fff',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              u/{username}
            </h3>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#818384',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {email}
            </span>
          </div>
        </div>

        {/* Karma & Cake Day Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            borderTop: '1px solid #343536',
            paddingTop: '14px',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#818384', marginBottom: '2px' }}>
              <Award style={{ width: '14px', height: '14px', color: '#FF4500' }} />
              <span>Karma</span>
            </div>
            <strong style={{ fontSize: '1rem', color: '#fff' }}>{stats.karma}</strong>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#818384', marginBottom: '2px' }}>
              <Calendar style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
              <span>Cake day</span>
            </div>
            <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{stats.createdDate}</strong>
          </div>
        </div>

        {/* Dynamic Activity Breakdown */}
        <div style={{ borderTop: '1px solid #343536', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#818384' }}>
            <span>Created Requests</span>
            <strong style={{ color: '#D7DADC' }}>{stats.postsCount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#818384' }}>
            <span>Contributed Datasets</span>
            <strong style={{ color: '#D7DADC' }}>{stats.contributionsCount}</strong>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={onSignOut}
          className="btn-action"
          style={{
            width: '100%',
            marginTop: '16px',
            justifyContent: 'center',
            color: '#ef4444',
            backgroundColor: '#272729',
            border: '1px solid #343536',
            borderRadius: '999px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.15s ease',
          }}
        >
          <LogOut style={{ width: '14px', height: '14px' }} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 2. Platform Trust & Safety / Profile Guidelines */}
      <div
        className="sidebar-widget"
        style={{
          flexShrink: 0,
          backgroundColor: '#1A1A1B',
          border: '1px solid #343536',
          borderRadius: '16px',
          padding: '16px',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <h4
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#818384',
            margin: '0 0 10px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck style={{ width: '14px', height: '14px', color: '#34d399' }} />
          <span>Contributor Profile</span>
        </h4>
        <p style={{ fontSize: '0.775rem', color: '#818384', lineHeight: 1.4, margin: '0' }}>
          Your profile showcases all open datasets you have authored and research data points contributed across the platform.
        </p>
      </div>

      {/* 🚀 PROMOTIONAL AD 1: SUPABASE */}
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
          backgroundColor: '#1A1A1B',
          border: '1px solid #343536',
          borderRadius: '16px',
          padding: '16px',
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

      {/* 🚀 PROMOTIONAL AD 2: NEON POSTGRES */}
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
          backgroundColor: '#1A1A1B',
          border: '1px solid #343536',
          borderRadius: '16px',
          padding: '16px',
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
      <div style={{ flexShrink: 0, padding: '4px 8px 16px 8px', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
        <p style={{ margin: 0 }}>DataShare Platform © {new Date().getFullYear()}. All rights reserved.</p>
      </div>
    </aside>
  );
};