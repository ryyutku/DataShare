// src/services/postService.ts
import { supabase } from './supabaseclient';

// 1. Exact TypeScript Interface matching your table columns
export interface Post {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  description: string;
  schema: Record<string, any>;      // JSONB definition of columns
  example_row: Record<string, any>; // JSONB preview row
  goal_count: number;               // Target rows to collect
  created_at: string;
  updated_at: string;

  // Joined display properties from relations
  author?: {
    username: string;
    avatar_url?: string;
  };
  community?: {
    slug: string;
    name: string;
  };
  upvotes_count?: number;
  comments_count?: number;
  submitted_rows_count?: number;
}

export interface CommunityOption {
  id: string;
  name: string;
  slug: string;
}

export interface TagOption {
  id: string;
  name: string;
  slug: string;
}

// 2. Fetch communities for dropdown selection
export async function getCommunities(): Promise<CommunityOption[]> {
  const { data, error } = await supabase
    .from('community')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching communities:', error.message);
    return [];
  }
  return data || [];
}

// 3. Fetch tags for selection
export async function getTags(): Promise<TagOption[]> {
  const { data, error } = await supabase
    .from('tag')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tags:', error.message);
    return [];
  }
  return data || [];
}

// 4. API: Fetch all posts with author and community details
export async function getPosts(communityId?: string): Promise<Post[]> {
  let query = supabase
    .from('post')
    .select(`
      id,
      community_id,
      author_id,
      title,
      description,
      schema,
      example_row,
      goal_count,
      created_at,
      updated_at,
      author:user!post_author_id_fkey (
        username
      ),
      community:community!post_community_id_fkey (
        slug,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (communityId) {
    query = query.eq('community_id', communityId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error.message);
    throw error;
  }

  return (data as unknown as Post[]) || [];
}

// 5. API: Fetch a single post by its ID
export async function getPostById(postId: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('post')
    .select(`
      id,
      community_id,
      author_id,
      title,
      description,
      schema,
      example_row,
      goal_count,
      created_at,
      updated_at,
      author:user!post_author_id_fkey (
        username
      ),
      community:community!post_community_id_fkey (
        slug,
        name
      )
    `)
    .eq('id', postId)
    .single();

  if (error) {
    console.error(`Error fetching post ${postId}:`, error.message);
    return null;
  }

  return data as unknown as Post;
}

// 6. API: Create a new dataset collection post (with optional tags)
export async function createPost(newPost: {
  community_id: string;
  author_id: string;
  title: string;
  description: string;
  schema: Record<string, any>;
  example_row: Record<string, any>;
  goal_count: number;
  tag_ids?: string[];
}): Promise<Post> {
  // 1. Insert post
  const { data, error } = await supabase
    .from('post')
    .insert([
      {
        community_id: newPost.community_id,
        author_id: newPost.author_id,
        title: newPost.title.trim(),
        description: newPost.description.trim(),
        schema: newPost.schema,
        example_row: newPost.example_row,
        goal_count: newPost.goal_count || 100,
        updated_at: new Date().toISOString(),
      },
    ])
    .select(`
      id,
      community_id,
      author_id,
      title,
      description,
      schema,
      example_row,
      goal_count,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    console.error('Error creating post:', error.message);
    throw error;
  }

  // 2. Attach tags if provided
  if (newPost.tag_ids && newPost.tag_ids.length > 0) {
    const postTagRecords = newPost.tag_ids.map((tag_id) => ({
      post_id: data.id,
      tag_id,
    }));

    const { error: tagError } = await supabase
      .from('post_tag')
      .upsert(postTagRecords, { onConflict: 'post_id,tag_id' });

    if (tagError) {
      console.warn('Warning: Post created, but tags failed to link:', tagError.message);
    }
  }

  return data as Post;
}

// 7. API: Update an existing post
export async function updatePost(
  postId: string,
  updates: Partial<Pick<Post, 'title' | 'description' | 'schema' | 'example_row' | 'goal_count'>>
): Promise<Post> {
  const { data, error } = await supabase
    .from('post')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error.message);
    throw error;
  }

  return data as Post;
}

// 8. API: Delete a post
export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('post').delete().eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error.message);
    throw error;
  }
}