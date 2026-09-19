import { supabase } from './supabaseclient';
import { type Tag } from './globalTagService';

// 1. Exact TypeScript Interface matching your table columns
export interface UserInterest {
    id: string;
    user_id: string;
    tag_id: string;
    created_at: string;

    // Joined tag details (populated when querying)
    tag?: Tag;
}

// 2. API: Get all tags followed/interested by a specific user
export async function getUserInterests(userId: string): Promise<Tag[]> {
    const { data, error } = await supabase
        .from('user_interest')
        .select(`
      id,
      user_id,
      tag_id,
      created_at,
      tag:tag!user_interest_tag_id_fkey (
        id,
        slug,
        name,
        created_by,
        created_at
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching interests for user ${userId}:`, error.message);
        throw error;
    }

    // Flatten the joined records so it returns clean Tag objects
    return (data?.map((item: any) => item.tag).filter(Boolean) as Tag[]) || [];
}

// 3. API: Check if a user follows a specific tag
export async function isUserInterestedInTag(userId: string, tagId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('user_interest')
        .select('id')
        .eq('user_id', userId)
        .eq('tag_id', tagId)
        .maybeSingle();

    if (error) {
        console.error('Error checking user interest:', error.message);
        return false;
    }

    return !!data; // true if following, false if not
}

// 4. API: Follow / Add an interest
export async function addInterest(userId: string, tagId: string): Promise<UserInterest> {
    const { data, error } = await supabase
        .from('user_interest')
        .insert([
            {
                user_id: userId,
                tag_id: tagId,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error adding interest:', error.message);
        throw error;
    }

    return data as UserInterest;
}

// 5. API: Unfollow / Remove an interest
export async function removeInterest(userId: string, tagId: string): Promise<void> {
    const { error } = await supabase
        .from('user_interest')
        .delete()
        .eq('user_id', userId)
        .eq('tag_id', tagId);

    if (error) {
        console.error('Error removing interest:', error.message);
        throw error;
    }
}

// 6. API: Toggle an interest (Follow if not following, Unfollow if already following)
export async function toggleInterest(
    userId: string,
    tagId: string
): Promise<{ isFollowing: boolean }> {
    const alreadyFollowing = await isUserInterestedInTag(userId, tagId);

    if (alreadyFollowing) {
        await removeInterest(userId, tagId);
        return { isFollowing: false };
    } else {
        await addInterest(userId, tagId);
        return { isFollowing: true };
    }
}

// 7. API: Bulk set interests (Great for New User Onboarding!)
export async function setBulkInterests(userId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;

    const records = tagIds.map((tagId) => ({
        user_id: userId,
        tag_id: tagId,
    }));

    const { error } = await supabase
        .from('user_interest')
        .insert(records);

    if (error) {
        console.error('Error setting bulk interests:', error.message);
        throw error;
    }
}

// 8. API: Get all user IDs interested in a tag (For notifications or recommendations)
export async function getUsersInterestedInTag(tagId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('user_interest')
        .select('user_id')
        .eq('tag_id', tagId);

    if (error) {
        console.error('Error fetching users for tag:', error.message);
        return [];
    }

    return data ? data.map((item) => item.user_id) : [];
}