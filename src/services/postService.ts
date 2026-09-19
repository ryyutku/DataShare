// src/services/postService.ts
import { supabase } from './supabaseclient';

export interface Post {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  description: string;
  schema: Record<string, any>;
  example_row: Record<string, any>;
  goal_count: number;
  created_at: string;
  updated_at: string;
  submitted_rows_count?: number;
  author?: {
    username: string;
    avatar_url?: string;
  };
  community?: {
    id?: string;
    slug: string;
    name: string;
    description?: string;
  };
  upvotes_count?: number;
  comments_count?: number;
  has_upvoted?: boolean;
}

export interface SubmissionRow {
  id: string;
  post_id: string;
  contributor_id: string;
  data: Record<string, any>;
  created_at: string;
  contributor?: {
    username: string;
  };
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

// 1. Fetch communities for dropdowns
export async function getCommunities(): Promise<CommunityOption[]> {
  const { data, error } = await supabase
    .from('community')
    .select('id, name, slug')
    .order('name', { ascending: true });
  if (error) return [];
  return data || [];
}

// 2. Fetch tags
export async function getTags(): Promise<TagOption[]> {
  const { data, error } = await supabase
    .from('tag')
    .select('id, name, slug')
    .order('name', { ascending: true });
  if (error) return [];
  return data || [];
}

// 3. Fetch all posts
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
        id,
        slug,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (communityId) query = query.eq('community_id', communityId);

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as Post[]) || [];
}

// 4. Fetch single post by ID
export async function getPostById(postId: string, currentUserId?: string): Promise<Post | null> {
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
        id,
        slug,
        name,
        description
      )
    `)
    .eq('id', postId)
    .single();

  if (error || !data) return null;

  const { count: upvotesCount } = await supabase
    .from('upvote')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  let hasUpvoted = false;
  if (currentUserId) {
    const { data: vote } = await supabase
      .from('upvote')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', currentUserId)
      .maybeSingle();
    hasUpvoted = !!vote;
  }

  return {
    ...(data as unknown as Post),
    upvotes_count: upvotesCount || 0,
    has_upvoted: hasUpvoted,
  };
}

// 5. Create new post
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
    .select()
    .single();

  if (error) throw error;

  if (newPost.tag_ids && newPost.tag_ids.length > 0) {
    const postTagRecords = newPost.tag_ids.map((tag_id) => ({
      post_id: data.id,
      tag_id,
    }));
    await supabase.from('post_tag').upsert(postTagRecords, { onConflict: 'post_id,tag_id' });
  }

  return data as Post;
}

// 6. UPDATE POST (Required for author editing)
export async function updatePost(
  postId: string,
  updates: {
    title?: string;
    description?: string;
    schema?: Record<string, any>;
    example_row?: Record<string, any>;
    goal_count?: number;
  }
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

// 7. DELETE POST (Required for author deletion)
export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('post')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error.message);
    throw error;
  }
}

// 8. Upvote toggle
export async function togglePostUpvote(postId: string, userId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('upvote')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase.from('upvote').delete().eq('post_id', postId).eq('user_id', userId);
    return false;
  } else {
    await supabase.from('upvote').insert([{ post_id: postId, user_id: userId }]);
    return true;
  }
}

// 9. Fetch submitted rows
export async function getSubmissionRows(postId: string): Promise<SubmissionRow[]> {
  const { data, error } = await supabase
    .from('submission_row')
    .select(`
      id,
      post_id,
      contributor_id,
      data,
      created_at,
      contributor:user!submission_row_contributor_id_fkey (
        username
      )
    `)
    .eq('post_id', postId)
    .eq('is_current', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data as unknown as SubmissionRow[]) || [];
}

// 10. Submit a new data row
export async function submitRow(postId: string, contributorId: string, rowData: Record<string, any>) {
  const { data, error } = await supabase
    .from('submission_row')
    .insert([
      {
        post_id: postId,
        contributor_id: contributorId,
        data: rowData,
        is_current: true,
        is_deleted: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 11. Membership helpers
export async function checkCommunityMembership(communityId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export async function toggleCommunityMembership(communityId: string, userId: string): Promise<boolean> {
  const isMember = await checkCommunityMembership(communityId, userId);
  if (isMember) {
    await supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', userId);
    return false;
  } else {
    await supabase.from('community_members').insert([{ community_id: communityId, user_id: userId }]);
    return true;
  }
}