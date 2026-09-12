import { supabase } from './supabaseclient';

// 1. Exact TypeScript Interface matching your table columns
export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    parent_comment_id: string | null; // null = top-level comment, string = reply to a comment
    body: string;
    created_at: string;

    // Joined from public.profiles table (optional display data)
    author?: {
        username: string;
        avatar_url?: string;
    };

    // For building the nested comment tree in React
    replies?: Comment[];
}

// 2. API: Fetch all comments for a post (with author usernames & avatars)
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
        .from('comment')
        .select(`
      id,
      post_id,
      user_id,
      parent_comment_id,
      body,
      created_at,
      author:profiles!comments_user_id_fkey (
        username,
        avatar_url
      )
    `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true }); // Oldest first

    if (error) {
        console.error(`Error fetching comments for post ${postId}:`, error.message);
        throw error;
    }

    return (data as unknown as Comment[]) || [];
}

// 3. Helper Function: Convert flat comment list into a Reddit-style Nested Tree!
export function nestComments(comments: Comment[]): Comment[] {
    const commentMap = new Map<string, Comment>();
    const topLevelComments: Comment[] = [];

    // Initialize map with empty replies array
    comments.forEach((c) => {
        commentMap.set(c.id, { ...c, replies: [] });
    });

    // Organize parent/child relationship
    comments.forEach((c) => {
        const mappedComment = commentMap.get(c.id)!;
        if (c.parent_comment_id && commentMap.has(c.parent_comment_id)) {
            // It's a reply! Add to the parent's replies list
            commentMap.get(c.parent_comment_id)!.replies!.push(mappedComment);
        } else {
            // It's a top-level comment
            topLevelComments.push(mappedComment);
        }
    });

    return topLevelComments;
}

// 4. API: Add a new comment (Can be Top-level OR a Reply!)
export async function addComment(newComment: {
    post_id: string;
    user_id: string;
    body: string;
    parent_comment_id?: string | null; // Pass parent id if this is a reply!
}): Promise<Comment> {
    const { data, error } = await supabase
        .from('comment')
        .insert([
            {
                post_id: newComment.post_id,
                user_id: newComment.user_id,
                body: newComment.body,
                parent_comment_id: newComment.parent_comment_id || null,
            },
        ])
        .select(`
      id,
      post_id,
      user_id,
      parent_comment_id,
      body,
      created_at,
      author:profiles!comments_user_id_fkey (
        username,
        avatar_url
      )
    `)
        .single();

    if (error) {
        console.error('Error adding comment:', error.message);
        throw error;
    }

    return data as unknown as Comment;
}

// 5. API: Delete a comment
export async function deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
        .from('comment')
        .delete()
        .eq('id', commentId);

    if (error) {
        console.error('Error deleting comment:', error.message);
        throw error;
    }
}

// 6. API: Get total comment count for a post
export async function getCommentCount(postId: string): Promise<number> {
    const { count, error } = await supabase
        .from('comment')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

    if (error) {
        console.error('Error counting comments:', error.message);
        return 0;
    }

    return count || 0;
}