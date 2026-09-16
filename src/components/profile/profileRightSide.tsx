// src/components/profile/profileRightSide.tsx
import React, { useState } from 'react';
import { Share2, LogOut, Trophy, Settings, Shield, Plus, Sparkles } from 'lucide-react';
import type { UserProfile } from '../../types/profile';
import { signOut } from '../../services/authService';

interface ProfileRightSidebarProps {
  profile: UserProfile;
  onSignOut?: () => void; // Optional callback to change page/view
}

export const ProfileRightSidebar: React.FC<ProfileRightSidebarProps> = ({ profile, onSignOut }) => {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();

      if (onSignOut) {
        onSignOut();
      } else {
        // Fallback: Redirect to home page
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Failed to sign out:', err);
      alert('Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <aside className="right-sidebar">
      <div className="profile-card">
        {/* Banner Graphic */}
        <div 
          className="profile-banner-img"
          style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: 'cover' } : {}}
        />

        <div className="profile-card-content">
          <h2>{profile.displayName}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>u/{profile.username}</p>

          {/* Share Profile Button */}
          <button 
            className="btn-action" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Profile link copied to clipboard!');
            }}
          >
            <Share2 style={{ width: '14px', height: '14px' }} />
            <span>Share Profile</span>
          </button>

          {/* Sign Out Button (Duplicate placed right below) */}
          <button 
            className="btn-action" 
            onClick={handleSignOut}
            disabled={signingOut}
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              marginTop: '8px',
              cursor: signingOut ? 'not-allowed' : 'pointer',
              opacity: signingOut ? 0.6 : 1
            }}
          >
            <LogOut style={{ width: '14px', height: '14px' }} />
            <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>

          {/* Followers */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px', fontWeight: 600 }}>
            {profile.followersCount} followers
          </div>

          {/* Stats Grid */}
          <div className="profile-stats-grid">
            <div className="stat-box">
              <strong>{profile.karma.toLocaleString()}</strong>
              <span> Karma</span>
            </div>
            <div className="stat-box">
              <strong>{profile.contributionsCount}</strong>
              <span> Contributions</span>
            </div>
            <div className="stat-box">
              <strong>{profile.cakeDay}</strong>
              <span> Reddit Age</span>
            </div>
            <div className="stat-box">
              <strong>{profile.activeCommunitiesCount}</strong>
              <span>Active Communities</span>
            </div>
          </div>

          {/* Achievements / Badges */}
          <div className="badge-shelf">
            <div className="badge-shelf-title">
              <Sparkles style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
              Achievements ({profile.achievementsCount} unlocked)
            </div>
            <div className="badge-list">
              <span className="badge-item">🍌 Banana Enthusiast</span>
              <span className="badge-item">👶 Banana Baby</span>
              <span className="badge-item">🌱 Banana Beginner</span>
            </div>
          </div>

          {/* Trophy Case */}
          <div className="badge-shelf">
            <div className="badge-shelf-title">
              <Trophy style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
              Trophy Case
            </div>
            <div className="badge-list">
              {profile.trophies.map((trophy, idx) => (
                <span key={idx} className="badge-item">🏆 {trophy}</span>
              ))}
            </div>
          </div>

          {/* Settings / Actions */}
          <div className="badge-shelf">
            <div className="badge-shelf-title">Settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <a href="#settings" className="menu-item" style={{ padding: '6px 8px', fontSize: '0.8rem' }}>
                <Settings style={{ width: '14px', height: '14px' }} />
                <span>Profile Settings</span>
              </a>
              <a href="#mod" className="menu-item" style={{ padding: '6px 8px', fontSize: '0.8rem' }}>
                <Shield style={{ width: '14px', height: '14px' }} />
                <span>Mod Tools</span>
              </a>
              <a href="#social" className="menu-item" style={{ padding: '6px 8px', fontSize: '0.8rem' }}>
                <Plus style={{ width: '14px', height: '14px' }} />
                <span>Add Social Link</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </aside>
  );
};