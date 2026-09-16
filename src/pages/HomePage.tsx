// src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import { type PageType } from '../components/navigation/Navbar';
import { LeftSidebar } from '../components/navigation/LeftSidebar';
import { RightSidebar } from '../components/navigation/RightSidebar';
import { PostCard } from '../components/ui/PostCard';
import { getPosts, type Post } from '../services/postService';

interface HomePageProps {
  onNavigate: (page: PageType, slug?: string) => void; 
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


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
    <div className="app-layout">
      <LeftSidebar onNavigate={onNavigate}/>

      <main className="main-feed">

        {loading && <div style={{ color: 'var(--text-muted)', padding: '24px', textAlign: 'center' }}>Loading posts...</div>}
        {error && <div style={{ color: '#ff4500', padding: '24px', textAlign: 'center' }}>Error: {error}</div>}

        {!loading && !error && posts.length === 0 && (
          <div style={{ color: 'var(--text-muted)', padding: '24px', textAlign: 'center' }}>
            No posts found.
          </div>
        )}

        {!loading &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              community={post.community?.name || post.community?.slug || 'r/general'}
              author={post.author?.username || 'anonymous'}
              timeAgo={new Date(post.created_at).toLocaleDateString()}
              title={post.title}
              bodyText={post.description}
              imageUrl={undefined}
              initialVotes={post.upvotes_count ?? 0}
              commentsCount={post.comments_count ?? 0}
            />
          ))}
      </main>

      <RightSidebar />
    </div>
  );
};

