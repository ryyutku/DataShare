import { useState, useEffect } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { LeftSidebar } from './components/navigation/LeftSidebar';
import { RightSidebar } from './components/navigation/RightSidebar';
import { PostCard } from './components/ui/PostCard';
import { getPosts, type Post } from './services/postService';

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<'Best' | 'Hot' | 'New' | 'Top'>('Best');
  const filterButtons: ('Best' | 'Hot' | 'New' | 'Top')[] = ['Best', 'Hot', 'New', 'Top'];

  // Call the Supabase API on page load
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getPosts();
        setPosts(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

          {/* Loading State */}
          {loading && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }}>
              Loading posts from Supabase...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{ color: '#ff4500', textAlign: 'center', padding: '32px' }}>
              Error: {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && posts.length === 0 && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }}>
              No posts found. Create one in Supabase!
            </div>
          )}

          {/* Text Post */}
          {/* Live Data from Supabase */}
          {!loading &&
            posts.map((post) => (
              <PostCard
                key={post.id}
                community={post.community_name}
                author={post.author_name}
                timeAgo={new Date(post.created_at).toLocaleDateString()}
                title={post.title}
                bodyText={post.body}
                imageUrl={post.image_url}
                initialVotes={post.upvotes}
                commentsCount={0}
              />
            ))}


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