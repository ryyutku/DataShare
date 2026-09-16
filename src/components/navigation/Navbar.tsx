// src/components/navigation/Navbar.tsx
import React, { useState } from 'react';
import { Search, Plus, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoginModal } from '../auth/LoginModal';

export type PageType = 'home' | 'profile' | 'create-post';

interface NavbarProps {
  onNavigate: (page: PageType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <header className="navbar">
      <div className="nav-left">
        <button 
          onClick={() => onNavigate('home')} 
          className="brand-logo" 
          style={{ cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Compass className="w-8 h-8 text-[#ff4500]" />
          <span>DataShare</span>
        </button>
      </div>

      <div className="search-container">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search style={{ position: 'absolute', left: '12px', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="search-bar" 
            placeholder="Search communities, posts, topics..." 
            style={{ paddingLeft: '36px' }} 
          />
        </div>
      </div>

      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="btn-action" onClick={() => onNavigate('create-post')} style={{ cursor: 'pointer' }}>
          <Plus style={{ width: '16px', height: '16px' }} />
          <span>Create</span>
        </button>

        {loading ? null : user ? (
          <div 
            className="avatar" 
            onClick={() => onNavigate('profile')} 
            style={{ cursor: 'pointer' }} 
            title="Go to Profile"
          >
            {user.email?.[0].toUpperCase() ?? 'U'}
          </div>
        ) : (
          <button className="btn-action" onClick={() => setShowLogin(true)} style={{ cursor: 'pointer' }}>
            Log In
          </button>
        )}
      </div>

      {/* Passes isOpen explicitly */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </header>
  );
};