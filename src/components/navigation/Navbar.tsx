// src/components/navigation/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Compass, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoginModal } from '../auth/LoginModal';
import { searchAll, type SearchResults } from '../../services/searchService';

export type PageType = 'home' | 'profile' | 'create-post' | 'community';

interface NavbarProps {
  onNavigate: (page: PageType, slug?: string) => void;
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onSearch }) => {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const delayDebounce = setTimeout(async () => {
        const data = await searchAll(searchTerm);
        setResults(data);
        setIsOpen(true);
      }, 150);

      return () => clearTimeout(delayDebounce);
    } else {
      setResults(null);
      setIsOpen(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsOpen(false);
    if (onSearch) {
      onSearch(searchTerm.trim());
    }
    onNavigate('home');
  };

  const isExpanded = isOpen && results && (results.communities.length > 0 || results.posts.length > 0 || searchTerm.trim().length >= 2);

  return (
    <header className="navbar">
      <div className="nav-left">
        <button
          onClick={() => {
            if (onSearch) onSearch('');
            setSearchTerm('');
            onNavigate('home');
          }}
          className="brand-logo"
          style={{ cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Compass className="w-8 h-8 text-[#ff4500]" />
          <span>DataShare</span>
        </button>
      </div>

      <div
        className="search-container"
        ref={searchWrapperRef}
        style={{
          position: 'relative',
          maxWidth: '600px',
          width: '100%',
          height: '40px'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: isExpanded ? '16px' : '999px',
            boxShadow: isExpanded ? '0 16px 36px rgba(0,0,0,0.75)' : 'none',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px 0 14px',
              height: '40px',
              borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none'
            }}
          >
            <Search
              style={{
                width: '18px',
                height: '18px',
                color: 'var(--text-muted)',
                marginRight: '10px',
                flexShrink: 0
              }}
            />

            <input
              type="text"
              placeholder="Search communities, posts, topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => results && setIsOpen(true)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                height: '100%'
              }}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setResults(null);
                  setIsOpen(false);
                  if (onSearch) onSearch('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '4px'
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            )}

            {searchTerm.trim().length > 0 && (
              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--accent-orange)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <span>Search</span>
                <ArrowRight style={{ width: '13px', height: '13px' }} />
              </button>
            )}
          </form>

          {isExpanded && (
            <div
              style={{
                maxHeight: '340px',
                overflowY: 'auto',
                padding: '6px 4px 10px 4px',
              }}
            >
              {results.communities.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 12px', letterSpacing: '0.5px' }}>
                    Communities
                  </div>
                  {results.communities.map((c) => (
                    <a
                      key={c.id}
                      href={`/r/${c.slug}`}
                      className="menu-item"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.875rem'
                      }}
                    >
                      <span style={{ fontWeight: '600' }}>r/{c.slug}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                        {c.name}
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {results.posts.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 12px', letterSpacing: '0.5px', borderTop: results.communities.length > 0 ? '1px solid var(--border-color)' : 'none', marginTop: results.communities.length > 0 ? '6px' : 0 }}>
                    Posts & Datasets
                  </div>
                  {results.posts.map((p) => (
                    <a
                      key={p.id}
                      href={`/post/${p.id}`}
                      className="menu-item"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '2px'
                      }}
                    >
                      <span style={{ fontWeight: '500', fontSize: '0.875rem', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        in r/{p.community?.slug || 'general'}
                      </span>
                    </a>
                  ))}
                </div>
              )}

              <div
                onClick={() => handleSearchSubmit()}
                className="menu-item"
                style={{
                  margin: '4px 6px 0 6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  borderTop: '1px solid var(--border-color)',
                  color: 'var(--accent-orange)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Search style={{ width: '14px', height: '14px' }} />
                <span>Search all posts for "{searchTerm}"</span>
              </div>
            </div>
          )}
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