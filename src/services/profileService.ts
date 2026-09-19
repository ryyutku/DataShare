// src/services/profileService.ts
import { supabase } from './supabaseclient';
import { getPosts, type Post } from './postService';

export interface UserCommentItem {
  id: string;
  body: string;
  created_at: string;
  post: {
    id: string;
    title: string;
    community?: {
      slug: string;
      name: string;
    };
  };
}

// 1. Fetch posts authored by user
export async function getUserPosts(userId: string, username?: string): Promise<Post[]> {
  const allPosts = await getPosts();
  return allPosts.filter(
    (p) => p.author_id === userId || (username && p.author?.username?.toLowerCase() === username.toLowerCase())
  );
}

// 2. Fetch posts where user contributed data (rows) or commented
export async function getUserContributions(userId: string): Promise<Post[]> {
  const [{ data: rows }, { data: comments }, allPosts] = await Promise.all([
    supabase.from('submission_row').select('post_id').eq('contributor_id', userId),
    supabase.from('comment').select('post_id').eq('user_id', userId),
    getPosts(),
  ]);

  const contributedIds = new Set([
    ...(rows || []).map((r) => r.post_id),
    ...(comments || []).map((c) => c.post_id),
  ]);

  return allPosts.filter((p) => contributedIds.has(p.id));
}

// 3. Fetch comments written by user with post context
export async function getUserComments(userId: string): Promise<UserCommentItem[]> {
  const { data, error } = await supabase
    .from('comment')
    .select(`
      id,
      body,
      created_at,
      post:post!comment_post_id_fkey (
        id,
        title,
        community:community!post_community_id_fkey (
          slug,
          name
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user comments:', error.message);
    return [];
  }

  return (data as unknown as UserCommentItem[]) || [];
}

// 4. Fetch posts user interacted with (Upvoted + Viewed)
export async function getUserInteractedPosts(userId: string): Promise<Post[]> {
  const [{ data: upvotes }, allPosts] = await Promise.all([
    supabase.from('upvote').select('post_id').eq('user_id', userId),
    getPosts(),
  ]);

  const historyIds: string[] = JSON.parse(localStorage.getItem(`history_posts_${userId}`) || '[]');
  const allInteractedIds = new Set([
    ...(upvotes || []).map((u) => u.post_id),
    ...historyIds,
  ]);

  return allPosts.filter((p) => allInteractedIds.has(p.id));
}

// 5. Fetch saved posts
export async function getUserSavedPosts(userId: string): Promise<Post[]> {
  const savedIds: string[] = JSON.parse(localStorage.getItem(`saved_posts_${userId}`) || '[]');
  if (savedIds.length === 0) return [];

  const allPosts = await getPosts();
  const savedSet = new Set(savedIds);
  return allPosts.filter((p) => savedSet.has(p.id));
}

// 6. Helpers to Save / Unsave a post
export function toggleSavePost(postId: string, userId: string): boolean {
  const key = `saved_posts_${userId}`;
  const saved: string[] = JSON.parse(localStorage.getItem(key) || '[]');
  const index = saved.indexOf(postId);

  if (index > -1) {
    saved.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(saved));
    return false; // removed
  } else {
    saved.push(postId);
    localStorage.setItem(key, JSON.stringify(saved));
    return true; // saved
  }
}

export function isPostSaved(postId: string, userId: string): boolean {
  const key = `saved_posts_${userId}`;
  const saved: string[] = JSON.parse(localStorage.getItem(key) || '[]');
  return saved.includes(postId);
}

export function addToHistory(postId: string, userId?: string): void {
  const key = userId ? `history_posts_${userId}` : 'history_posts_guest';
  const existing: string[] = JSON.parse(localStorage.getItem(key) || '[]');
  
  // Place newly visited post at the top, max 50 in history
  const updated = [postId, ...existing.filter((id) => id !== postId)].slice(0, 50);
  localStorage.setItem(key, JSON.stringify(updated));

  // Dispatch event so RightSidebar updates without requiring a page refresh
  window.dispatchEvent(new Event('history-updated'));
}

export function getHistoryPostIds(userId?: string): string[] {
  const key = userId ? `history_posts_${userId}` : 'history_posts_guest';
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function clearHistory(userId?: string): void {
  const key = userId ? `history_posts_${userId}` : 'history_posts_guest';
  localStorage.removeItem(key);
  window.dispatchEvent(new Event('history-updated'));
}