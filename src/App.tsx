// src/App.tsx
import { useState } from 'react';
import { Navbar, type PageType } from './components/navigation/Navbar';
import { HomePage } from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import { CreatePostPage } from './pages/CreatePostPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  return (
    <>
      <Navbar onNavigate={(page) => setCurrentPage(page)} />
      {currentPage === 'home' && (
        <HomePage onNavigate={(page) => setCurrentPage(page)} />
      )}
      {currentPage === 'profile' && <ProfilePage />}
      {currentPage === 'create-post' && (
        <CreatePostPage onNavigate={(page) => setCurrentPage(page)} />
      )}
    </>
  );
}