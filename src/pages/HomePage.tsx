// src/pages/HomePage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { type PageType } from '../components/navigation/Navbar';
import { LeftSidebar } from '../components/navigation/LeftSidebar';
import { RightSidebar } from '../components/navigation/RightSidebar';
import { PostCard } from '../components/ui/PostCard';
import { getPosts, type Post } from '../services/postService';
import { getRecommendedPosts } from '../services/recommendationService';
import { supabase } from '../services/supabaseclient';
import { Sparkles, Flame, Clock, TrendingUp } from 'lucide-react';

interface HomePageProps {
  searchFilter: string;
  onClearSearch?: () => void;
  onNavigate: (page: PageType, slug?: string) => void;
}

export type FeedFilterType = 'For You' | 'Hot' | 'New' | 'Top';

export const HomePage: React.FC<HomePageProps> = ({ searchFilter, onNavigate }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FeedFilterType>('For You');

  const filterTabs: { name: FeedFilterType; icon: any }[] = [
    { name: 'For You', icon: Sparkles },
    { name: 'Hot', icon: Flame },
    { name: 'New', icon: Clock },
    { name: 'Top', icon: TrendingUp },
  ];

  useEffect(() => {
    async function loadFeed() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Fetch all posts
        let allPosts = await getPosts();

        // 2. Fetch personalized recommendations
        const recommended = await getRecommendedPosts(user?.id);
        setRecommendedPosts(recommended);

        // 3. Search filter support
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase();
          allPosts = allPosts.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q)
          );
        }

        setPosts(allPosts);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch feed');
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [searchFilter]);

  // Feed Sorting Logic
  const displayPosts = useMemo(() => {
    // If user is searching, filter the active set
    if (searchFilter.trim()) {
      return posts;
    }

    // Tab 1: Recommendation Engine ("For You")
    if (activeFilter === 'For You') {
      return recommendedPosts.length > 0 ? recommendedPosts : posts;
    }

    const list = [...posts];

    // Tab 2: New
    if (activeFilter === 'New') {
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Tab 3: Top
    if (activeFilter === 'Top') {
      return list.sort((a, b) => (b.upvotes_count || 0) - (a.upvotes_count || 0));
    }

    // Tab 4: Hot
    if (activeFilter === 'Hot') {
      return list.sort((a, b) => {
        const ageA = Math.max(1, (Date.now() - new Date(a.created_at).getTime()) / 36e5);
        const ageB = Math.max(1, (Date.now() - new Date(b.created_at).getTime()) / 36e5);
        const hotA = (a.upvotes_count || 0) / Math.pow(ageA + 2, 1.25);
        const hotB = (b.upvotes_count || 0) / Math.pow(ageB + 2, 1.25);
        return hotB - hotA;
      });
    }

    return list;
  }, [posts, recommendedPosts, activeFilter, searchFilter]);

  return (
    <div className="app-layout">
      <LeftSidebar onNavigate={onNavigate} />

      <main className="main-feed">
        {/* Feed Controls (Reddit-style tabs) */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '8px', 
            backgroundColor: '#1A1A1B', 
            border: '1px solid #343536', 
            borderRadius: '12px', 
            padding: '8px', 
            marginBottom: '16px' 
          }}
        >
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveFilter(tab.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#272729' : 'transparent',
                  color: isActive ? '#FF4500' : '#818384',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon style={{ width: '14px', height: '14px' }} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {loading && (
          <div style={{ color: 'var(--text-muted)', padding: '32px', textAlign: 'center' }}>
            Loading recommended datasets...
          </div>
        )}

        {error && (
          <div style={{ color: '#ff4500', padding: '24px', textAlign: 'center' }}>
            Error: {error}
          </div>
        )}

        {!loading && !error && displayPosts.length === 0 && (
          <div style={{ color: 'var(--text-muted)', padding: '32px', textAlign: 'center' }}>
            No posts found for "{searchFilter}".
          </div>
        )}

        {!loading &&
          displayPosts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              community={post.community?.name || post.community?.slug || 'r/general'}
              author={post.author?.username || 'anonymous'}
              timeAgo={new Date(post.created_at).toLocaleDateString()}
              title={post.title}
              bodyText={post.description}
              imageUrl={undefined}
              initialVotes={post.upvotes_count ?? 0}
              commentsCount={post.comments_count ?? 0}
              onOpen={(postId) => onNavigate && onNavigate('post-detail', postId)}
            />
          ))}
      </main>

      <RightSidebar onNavigate={onNavigate} />
    </div>
  );
};