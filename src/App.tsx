import { useState } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { LeftSidebar } from './components/navigation/LeftSidebar';
import { RightSidebar } from './components/navigation/RightSidebar';
import { PostCard } from './components/ui/PostCard';

export default function App() {
  const [activeFilter, setActiveFilter] = useState<'Best' | 'Hot' | 'New' | 'Top'>('Best');
  const filterButtons: ('Best' | 'Hot' | 'New' | 'Top')[] = ['Best', 'Hot', 'New', 'Top'];

  return (
    <>
      {/* Top Navbar */}
      <Navbar />

      {/* 3-Column Community Grid Layout */}
      <div className="app-layout">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Feed Content */}
        <main className="main-feed">
          {/* Feed Controls (Best, Hot, New, Top) */}
          <div className="feed-controls">
            {filterButtons.map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Text Post */}
          <PostCard
            community="r/MakeMoneyHacks"
            author="developer"
            timeAgo="2 hours ago"
            title="What high-income skill would you learn from scratch in 2026?"
            bodyText="Looking for recommendations on what digital skills have the highest demand right now. Let's discuss backend, AI integration, design, and marketing."
            initialVotes={184}
            commentsCount={42}
          />

          {/* Image Post */}
          <PostCard
            community="r/webdev"
            author="designer"
            timeAgo="5 hours ago"
            title="Modern CSS Grid vs. Flexbox: Visual cheat sheet"
            imageUrl="https://picsum.photos/800/450"
            initialVotes={512}
            commentsCount={89}
          />
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </>
  );
}