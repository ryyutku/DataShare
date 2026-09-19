// profileTabs.tsx
import React from 'react';

export type ProfileTab = 
  | 'Overview' 
  | 'Posts' 
  | 'Comments' 
  | 'Saved' 
  | 'History' 
  | 'Upvoted' 
  | 'Downvoted';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onSelectTab: (tab: ProfileTab) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onSelectTab }) => {
  const tabs: ProfileTab[] = [
    'Overview',
    'Posts',
    'Comments',
    'Saved',
    'History',
    'Upvoted',
    'Downvoted'
  ];

  return (
    <nav className="profile-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab-item ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onSelectTab(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};