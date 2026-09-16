// src/App.tsx
import { useState } from 'react';
import { Navbar, type PageType } from './components/navigation/Navbar';
import { HomePage } from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import { CreatePostPage } from './pages/CreatePostPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [searchFilter, setSearchFilter] = useState<string>('');

  return (
    <>
      <Navbar
        onNavigate={(page) => setCurrentPage(page)}
        onSearch={(query) => setSearchFilter(query)}
      />
      {currentPage === 'home' && (
        <HomePage searchFilter={searchFilter} onClearSearch={() => setSearchFilter('')} onNavigate={(page) => setCurrentPage(page)} />
      )}
      {currentPage === 'profile' && <ProfilePage />}
      {currentPage === 'create-post' && (
        <CreatePostPage onNavigate={(page) => setCurrentPage(page)} />
      )}
    </>
  );
}