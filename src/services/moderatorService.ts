import { supabase } from './supabaseclient';

// 1. Exact TypeScript Interface matching your table columns
export interface CommunityModerator {
    community_id: string;
    user_id: string;
    role: string; // e.g. 'owner' | 'moderator' | 'admin'

    // Optional joined data from public.profiles
    user?: {
        username: string;
        avatar_url?: string;
    };
}

// 2. API: Get all moderators for a specific community (with usernames)
export async function getCommunityModerators(communityId: string): Promise<CommunityModerator[]> {
    const { data, error } = await supabase
        .from('community_moderator')
        .select(`
      community_id,
      user_id,
      role,
      user:profiles!community_moderator_user_id_fkey (
        username,
        avatar_url
      )
    `)
        .eq('community_id', communityId);

    if (error) {
        console.error(`Error fetching moderators for community ${communityId}:`, error.message);
        throw error;
    }

    return (data as unknown as CommunityModerator[]) || [];
}

// 3. API: Check if a specific user is a moderator/owner of a community
export async function checkUserModStatus(
    communityId: string,
    userId: string
): Promise<{ isModerator: boolean; role: string | null }> {
    const { data, error } = await supabase
        .from('community_moderator')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error checking moderator role:', error.message);
        return { isModerator: false, role: null };
    }

    return {
        isModerator: !!data,
        role: data ? data.role : null,
    };
}

// 4. API: Add a new moderator to a community
export async function addModerator(
    communityId: string,
    userId: string,
    role: string = 'moderator'
): Promise<CommunityModerator> {
    const { data, error } = await supabase
        .from('community_moderator')
        .insert([
            {
                community_id: communityId,
                user_id: userId,
                role: role,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error adding moderator:', error.message);
        throw error;
    }

    return data as CommunityModerator;
}

// 5. API: Remove a moderator from a community
export async function removeModerator(communityId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('community_moderator')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error removing moderator:', error.message);
        throw error;
    }
}

// 6. API: Update moderator role (e.g. promote from 'moderator' to 'owner')
export async function updateModeratorRole(
    communityId: string,
    userId: string,
    newRole: string
): Promise<CommunityModerator> {
    const { data, error } = await supabase
        .from('community_moderator')
        .update({ role: newRole })
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating moderator role:', error.message);
        throw error;
    }

    return data as CommunityModerator;
}

// 7. API: Get all communities where a specific user is a moderator
export async function getCommunitiesModeratedByUser(userId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('community_moderator')
        .select('community_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching moderated communities:', error.message);
        return [];
    }

    return data ? data.map((item) => item.community_id) : [];
}