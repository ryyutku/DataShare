import { supabase } from './supabaseclient';
import { type Tag } from './globalTagService';
import { type Community } from './communityService';

// 1. Exact TypeScript Interface matching your table columns
export interface CommunityTagRecord {
    community_id: string;
    tag_id: string;
}

// 2. API: Get all tags associated with a specific community
// (e.g., viewing all topic tags available in r/webdev)
export async function getTagsForCommunity(communityId: string): Promise<Tag[]> {
    const { data, error } = await supabase
        .from('community_tag')
        .select(`
      tag:tag (
        id,
        name,
        description,
        usage_count,
        created_at
      )
    `)
        .eq('community_id', communityId);

    if (error) {
        console.error(`Error fetching tags for community ${communityId}:`, error.message);
        throw error;
    }

    // Flatten joined tag records
    return (data?.map((item: any) => item.tag).filter(Boolean) as Tag[]) || [];
}

// 3. API: Get all communities that use a specific tag
// (e.g., finding all communities tagged with #python)
export async function getCommunitiesByTag(tagId: string): Promise<Community[]> {
    const { data, error } = await supabase
        .from('community_tag')
        .select(`
      community:community (
        id,
        slug,
        name,
        description,
        created_by,
        created_at
      )
    `)
        .eq('tag_id', tagId);

    if (error) {
        console.error(`Error fetching communities for tag ${tagId}:`, error.message);
        throw error;
    }

    // Flatten joined community records
    return (data?.map((item: any) => item.community).filter(Boolean) as Community[]) || [];
}

// 4. API: Link a tag to a community
export async function linkTagToCommunity(communityId: string, tagId: string): Promise<void> {
    const { error } = await supabase
        .from('community_tag')
        .insert([
            {
                community_id: communityId,
                tag_id: tagId,
            },
        ]);

    if (error && error.code !== '23505') { // Ignore duplicate key errors if already linked
        console.error('Error linking tag to community:', error.message);
        throw error;
    }
}

// 5. API: Bulk link multiple tags to a community (e.g., when creating a community)
export async function linkMultipleTagsToCommunity(communityId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;

    const records = tagIds.map((tagId) => ({
        community_id: communityId,
        tag_id: tagId,
    }));

    const { error } = await supabase
        .from('community_tag')
        .upsert(records, { onConflict: 'community_id,tag_id' });

    if (error) {
        console.error('Error bulk linking tags to community:', error.message);
        throw error;
    }
}

// 6. API: Unlink a tag from a community
export async function unlinkTagFromCommunity(communityId: string, tagId: string): Promise<void> {
    const { error } = await supabase
        .from('community_tag')
        .delete()
        .eq('community_id', communityId)
        .eq('tag_id', tagId);

    if (error) {
        console.error('Error unlinking tag from community:', error.message);
        throw error;
    }
}