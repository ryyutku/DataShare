// src/services/recommendationService.ts
import { supabase } from './supabaseclient';
import { getPosts, type Post } from './postService';

export interface PostScore {
  post: Post;
  score: number;
  reason: string; // Helpful for debugging why a post was recommended
}

/**
 * Calculates a personalized recommendation score for all posts
 * based on user joined communities, past contributions, and engagement.
 */
export async function getRecommendedPosts(userId?: string): Promise<Post[]> {
  const allPosts = await getPosts();
  if (allPosts.length === 0) return [];

  // COLD START / GUEST: If not logged in, return trending engagement
  if (!userId) {
    return rankColdStartPosts(allPosts);
  }

  try {
    // 1. Fetch user's signals in parallel
    const [
      { data: joinedCommunities },
      { data: userSubmissions },
      { data: userUpvotes },
    ] = await Promise.all([
      supabase.from('community_members').select('community_id').eq('user_id', userId),
      supabase.from('submission_row').select('post_id').eq('contributor_id', userId),
      supabase.from('upvote').select('post_id').eq('user_id', userId),
    ]);

    const joinedCommSet = new Set((joinedCommunities || []).map((c) => c.community_id));
    const submittedPostSet = new Set((userSubmissions || []).map((s) => s.post_id));
    const upvotedPostSet = new Set((userUpvotes || []).map((u) => u.post_id));

    // 2. Score each post
    const scoredPosts: PostScore[] = allPosts.map((post) => {
      let score = 0;
      let reason = 'General';

      // Factor A: Joined Community Boost (+50)
      if (joinedCommSet.has(post.community_id)) {
        score += 50;
        reason = 'From your communities';
      }

      // Factor B: Interaction History Boost (+30)
      if (submittedPostSet.has(post.id) || upvotedPostSet.has(post.id)) {
        score += 20;
        reason = 'Related to your activity';
      }

      // Factor C: Data Collection Urgency (+25)
      // Datasets close to completion (50% - 90% goal) get boosted
      const progress = (post.submitted_rows_count || 0) / (post.goal_count || 100);
      if (progress >= 0.5 && progress < 1.0) {
        score += 25;
        reason = 'Goal almost reached';
      }

      // Factor D: Social Engagement (+2 per upvote, +3 per comment)
      const engagement = (post.upvotes_count || 0) * 2 + (post.comments_count || 0) * 3;
      score += engagement;

      // Factor E: Freshness / Time Decay
      // Exponential decay: newer posts stay high, older posts fade
      const hoursOld = Math.max(1, (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60));
      const decayedScore = score / Math.pow(hoursOld + 2, 1.25);

      return {
        post,
        score: decayedScore,
        reason,
      };
    });

    // 3. Sort by computed score descending
    scoredPosts.sort((a, b) => b.score - a.score);

    return scoredPosts.map((sp) => sp.post);
  } catch (err) {
    console.error('Error computing recommendations, falling back to default:', err);
    return rankColdStartPosts(allPosts);
  }
}

/**
 * Fallback algorithm for guests and users with no history yet.
 * Combines engagement score and time decay.
 */
function rankColdStartPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const ageA = Math.max(1, (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60));
    const ageB = Math.max(1, (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60));

    const scoreA = ((a.upvotes_count || 0) * 2 + (a.comments_count || 0) * 3 + 5) / Math.pow(ageA + 2, 1.2);
    const scoreB = ((b.upvotes_count || 0) * 2 + (b.comments_count || 0) * 3 + 5) / Math.pow(ageB + 2, 1.2);

    return scoreB - scoreA;
  });
}