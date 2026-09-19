import { supabase } from './supabaseclient';
import { type Tag } from './globalTagService';
import { type Post } from './postService';

// 1. Exact TypeScript Interface matching your table columns
export interface PostTagRecord {
    post_id: string;
    tag_id: string;
}

// 2. API: Get all tags attached to a specific post
// (e.g., displaying the tag badges on a PostCard)
export async function getTagsForPost(postId: string): Promise<Tag[]> {
    const { data, error } = await supabase
        .from('post_tag')
        .select(`
      tag:tag (
        id,
        name,
        description,
        usage_count,
        created_at
      )
    `)
        .eq('post_id', postId);

    if (error) {
        console.error(`Error fetching tags for post ${postId}:`, error.message);
        throw error;
    }

    // Flatten joined tag records
    return (data?.map((item: any) => item.tag).filter(Boolean) as Tag[]) || [];
}

// 3. API: Get all posts tagged with a specific tag
// (e.g., clicking on #machine-learning to view all datasets with that tag)
export async function getPostsByTag(tagId: string): Promise<Post[]> {
    const { data, error } = await supabase
        .from('post_tag')
        .select(`
      post:post (
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
        author:profiles!post_author_id_fkey (
          username,
          avatar_url
        ),
        community:community!post_community_id_fkey (
          slug,
          name
        )
      )
    `)
        .eq('tag_id', tagId);

    if (error) {
        console.error(`Error fetching posts for tag ${tagId}:`, error.message);
        throw error;
    }

    // Flatten joined post records
    return (data?.map((item: any) => item.post).filter(Boolean) as Post[]) || [];
}

// 4. API: Attach a single tag to a post
export async function attachTagToPost(postId: string, tagId: string): Promise<void> {
    const { error } = await supabase
        .from('post_tag')
        .insert([
            {
                post_id: postId,
                tag_id: tagId,
            },
        ]);

    if (error && error.code !== '23505') { // 23505 = duplicate key error (already attached)
        console.error('Error attaching tag to post:', error.message);
        throw error;
    }
}

// 5. API: Bulk attach multiple tags when creating a post
export async function attachMultipleTagsToPost(postId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;

    const records = tagIds.map((tagId) => ({
        post_id: postId,
        tag_id: tagId,
    }));

    const { error } = await supabase
        .from('post_tag')
        .upsert(records, { onConflict: 'post_id,tag_id' });

    if (error) {
        console.error('Error attaching multiple tags to post:', error.message);
        throw error;
    }
}

// 6. API: Remove a tag from a post
export async function removeTagFromPost(postId: string, tagId: string): Promise<void> {
    const { error } = await supabase
        .from('post_tag')
        .delete()
        .eq('post_id', postId)
        .eq('tag_id', tagId);

    if (error) {
        console.error('Error removing tag from post:', error.message);
        throw error;
    }
}