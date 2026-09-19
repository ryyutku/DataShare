// profileHeader.tsx
import React from 'react';
import { Camera } from 'lucide-react';

interface ProfileHeaderProps {
  displayName: string;
  username: string;
  avatarUrl?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  displayName,
  username,
  avatarUrl
}) => {
  return (
    <section className="profile-banner-card">
      <div style={{ position: 'relative' }}>
        <div className="profile-avatar-large">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
            />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
        <button 
          className="btn-action" 
          style={{ 
            position: 'absolute', 
            bottom: '-4px', 
            right: '-4px', 
            padding: '4px', 
            borderRadius: '50%' 
          }}
          title="Edit Avatar"
        >
          <Camera style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

      <div className="profile-names">
        <h1>{displayName}</h1>
        <p>u/{username}</p>
      </div>
    </section>
  );
};