// src/App.tsx
import { useState } from 'react';
import { Navbar, type PageType } from './components/navigation/Navbar';
import { HomePage } from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CommunityPage } from './pages/CommunityPage';
import { PostPage } from './pages/PostPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedCommunitySlug, setSelectedCommunitySlug] = useState<string | null>(null);
  const [preselectedCommunity, setPreselectedCommunity] = useState<string | null>(null);

  const handleNavigate = (page: PageType, targetIdOrSlug?: string) => {
    if (page === 'post-detail' && targetIdOrSlug) {
      setSelectedPostId(targetIdOrSlug);
    } else if (page === 'community' && targetIdOrSlug) {
      setSelectedCommunitySlug(targetIdOrSlug);
    } else if (page === 'create-post') {
      // Store the community passed from CommunityPage (or null if from Navbar)
      setPreselectedCommunity(targetIdOrSlug || null);
    }
    setCurrentPage(page);
  };

  return (
    <>
      <Navbar
        onNavigate={handleNavigate}
        onSearch={(query) => setSearchFilter(query)}
      />

      {currentPage === 'home' && (
        <HomePage
          searchFilter={searchFilter}
          onClearSearch={() => setSearchFilter('')}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'profile' && <ProfilePage onNavigate={handleNavigate}/>}

      {currentPage === 'create-post' && (
        <CreatePostPage 
          preselectedCommunityId={preselectedCommunity} 
          onNavigate={handleNavigate} 
        />
      )}

      {currentPage === 'community' && selectedCommunitySlug && (
        <CommunityPage slug={selectedCommunitySlug} onNavigate={handleNavigate} />
      )}

      {currentPage === 'post-detail' && selectedPostId && (
        <PostPage postId={selectedPostId} onNavigate={handleNavigate} />
      )}
    </>
  );
}