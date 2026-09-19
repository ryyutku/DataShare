import { supabase } from './supabaseclient';

// 1. Exact TypeScript Interface matching your table columns
export interface UpvoteRecord {
    post_id: string;
    user_id: string;
    created_at: string;
}

// 2. API: Check if a user has already upvoted a specific post
export async function hasUserUpvoted(postId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('upvote')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error checking upvote status:', error.message);
        return false;
    }

    return !!data; // true if upvoted, false if not
}

// 3. API: Get total upvote count for a post
export async function getPostUpvoteCount(postId: string): Promise<number> {
    const { count, error } = await supabase
        .from('upvote')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

    if (error) {
        console.error(`Error counting upvotes for post ${postId}:`, error.message);
        return 0;
    }

    return count || 0;
}

// 4. API: Toggle Upvote (Add if not voted, Remove if already voted)
export async function toggleUpvote(
    postId: string,
    userId: string
): Promise<{ hasUpvoted: boolean }> {
    // Check current status
    const isUpvoted = await hasUserUpvoted(postId, userId);

    if (isUpvoted) {
        // 1. REMOVE UPVOTE
        const { error } = await supabase
            .from('upvote')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error removing upvote:', error.message);
            throw error;
        }

        return { hasUpvoted: false };
    } else {
        // 2. ADD UPVOTE
        const { error } = await supabase
            .from('upvote')
            .insert([
                {
                    post_id: postId,
                    user_id: userId,
                },
            ]);

        if (error) {
            console.error('Error adding upvote:', error.message);
            throw error;
        }

        return { hasUpvoted: true };
    }
}

// 5. API: Get all post IDs upvoted by a specific user (For User Profile / Upvoted Tab)
export async function getUserUpvotedPostIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('upvote')
        .select('post_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user upvotes:', error.message);
        return [];
    }

    return data ? data.map((item) => item.post_id) : [];
}