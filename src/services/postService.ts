import { supabase } from './supabaseclient';

// 1. TypeScript Interface for a Post
export interface Post {
    id: string;
    title: string;
    body?: string;
    image_url?: string;
    community_name: string;
    author_name: string;
    upvotes: number;
    created_at: string;
}

// 2. API Call: Fetch all posts
export async function getPosts(): Promise<Post[]> {
    const { data, error } = await supabase
        .from('post')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error.message);
        throw error;
    }

    return data || [];
}

// 3. API Call: Create a new post
export async function createPost(newPost: {
    title: string;
    body?: string;
    image_url?: string;
    community_name: string;
    author_name?: string;
}) {
    const { data, error } = await supabase
        .from('post')
        .insert([newPost])
        .select();

    if (error) {
        console.error('Error creating post:', error.message);
        throw error;
    }

    return data;
}

// 4. API Call: Update upvotes
export async function updateVotes(postId: string, newVoteCount: number) {
    const { data, error } = await supabase
        .from('post')
        .update({ upvotes: newVoteCount })
        .eq('id', postId);

    if (error) {
        console.error('Error updating vote:', error.message);
        throw error;
    }

    return data;
}