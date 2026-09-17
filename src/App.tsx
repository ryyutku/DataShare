// src/App.tsx
import { useState, useEffect } from 'react';
import { Navbar, type PageType } from './components/navigation/Navbar';
import { HomePage } from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CommunityPage } from './pages/CommunityPage';

export default function App() {
  // Read initial values from localStorage so page stays after refresh
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    return (localStorage.getItem('reddit_current_page') as PageType) || 'home';
  });

  const [searchFilter, setSearchFilter] = useState<string>('');


  const [currentCommunitySlug, setCurrentCommunitySlug] = useState<string>(() => {
    return localStorage.getItem('reddit_current_slug') || '';
  });

  const handleNavigate = (page: PageType, slug?: string) => {
    setCurrentPage(page);
    localStorage.setItem('reddit_current_page', page);

    if (slug) {
      setCurrentCommunitySlug(slug);
      localStorage.setItem('reddit_current_slug', slug);
    }
    window.scrollTo(0, 0);
  };
  const [searchFilter, setSearchFilter] = useState<string>('');

  return (
    <>
      <Navbar
        onNavigate={handleNavigate}
        onSearch={(query) => setSearchFilter(query)}
      />

      {currentPage === 'home' && (
        <HomePage searchFilter={searchFilter} onClearSearch={() => setSearchFilter('')} onNavigate={handleNavigate} />
      )}

      {currentPage === 'profile' && (
        <ProfilePage onNavigate={handleNavigate} />
      )}

      {currentPage === 'create-post' && (
        <CreatePostPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'community' && (
        <CommunityPage 
          slug={currentCommunitySlug} 
          onNavigate={handleNavigate} 
        />
      )}
    </>
  );
}