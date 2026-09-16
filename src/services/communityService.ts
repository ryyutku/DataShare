// src/services/communityService.ts
import { supabase } from './supabaseclient';

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  creator?: {
    id: string;
    username: string;
    email: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface CreateCommunityInput {
  name: string;
  slug?: string;
  description?: string;
  topics?: string[]; // Array of tag names e.g. ["Technology", "Gaming"]
}

// 1. Fetch all communities
export async function getCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from('community')
    .select(`
      id,
      slug,
      name,
      description,
      created_by,
      created_at,
      creator:user!created_by (
        id,
        username,
        email
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching communities:', error.message);
    throw error;
  }

  return (data as unknown as Community[]) || [];
}

// 2. Fetch single community by slug
export async function getCommunityBySlug(slug: string): Promise<Community | null> {
  if (!slug) return null;

  const cleanSlug = slug.trim().toLowerCase().replace(/^r\//, '');

  try {
    // 1. Fetch community by slug or by name as fallback
    const { data: communityData, error: communityError } = await supabase
      .from('community')
      .select('*')
      .or(`slug.eq.${cleanSlug},name.ilike.${cleanSlug}`)
      .maybeSingle();

    if (communityError || !communityData) {
      console.warn(`Community r/${cleanSlug} not found:`, communityError?.message);
      return null;
    }

    // 2. Fetch creator username safely from "user" table
    let creatorInfo = { id: communityData.created_by, username: 'Moderator', email: '' };
    if (communityData.created_by) {
      const { data: userData } = await supabase
        .from('user')
        .select('id, username, email')
        .eq('id', communityData.created_by)
        .maybeSingle();

      if (userData) {
        creatorInfo = userData;
      }
    }

    return {
      ...communityData,
      creator: creatorInfo,
    } as Community;
  } catch (err) {
    console.error(`Unexpected error fetching r/${cleanSlug}:`, err);
    return null;
  }
}

// 3. Create a brand new community (handles tags and moderator assignment)
export async function createCommunity(input: CreateCommunityInput): Promise<Community> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to create a community.');

  const cleanSlug = (input.slug || input.name)
    .trim()
    .toLowerCase()
    .replace(/^r\//, '')
    .replace(/[^a-z0-9_]/g, '-');

  // A. Insert into community
  const { data: newCommunity, error: communityError } = await supabase
    .from('community')
    .insert([
      {
        name: input.name.trim(),
        slug: cleanSlug,
        description: (input.description || '').trim(),
        created_by: user.id,
      },
    ])
    .select()
    .single();

  if (communityError) {
    if (communityError.code === '23505') {
      throw new Error(`r/${cleanSlug} already exists. Please pick another name.`);
    }
    throw new Error(communityError.message || 'Failed to create community');
  }

  // B. Add creator to community_moderator table
  await supabase.from('community_moderator').insert([
    {
      community_id: newCommunity.id,
      user_id: user.id,
      role: 'creator',
    },
  ]);

  // C. Add creator to community_members table
  await supabase.from('community_members').insert([
    {
      community_id: newCommunity.id,
      user_id: user.id,
    },
  ]);

  // D. Link tags if provided
  if (input.topics && input.topics.length > 0) {
    for (const topicName of input.topics) {
      const topicSlug = topicName.toLowerCase().replace(/[^a-z0-9]/g, '-');

      // Find or insert tag
      let { data: tagRecord } = await supabase
        .from('tag')
        .select('id')
        .eq('slug', topicSlug)
        .maybeSingle();

      if (!tagRecord) {
        const { data: createdTag } = await supabase
          .from('tag')
          .insert([{ name: topicName, slug: topicSlug, created_by: user.id }])
          .select('id')
          .single();
        tagRecord = createdTag;
      }

      if (tagRecord) {
        await supabase.from('community_tag').insert([
          {
            community_id: newCommunity.id,
            tag_id: tagRecord.id,
          },
        ]);
      }
    }
  }

  return newCommunity as Community;
}

// 4. Join a community
export async function joinCommunity(communityId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to join.');

  const { error } = await supabase
    .from('community_members')
    .insert([{ community_id: communityId, user_id: user.id }]);

  if (error && error.code !== '23505') {
    throw error;
  }
}

// 5. Leave a community
export async function leaveCommunity(communityId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', user.id);

  if (error) throw error;
}

// 6. Check if current user is member / moderator / owner
export async function getCommunityUserStatus(communityId: string, creatorId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { isMember: false, isModerator: false, isOwner: false };
  }

  const isOwner = user.id === creatorId;

  // Check if member
  const { data: memberRow } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .maybeSingle();

  // Check if moderator
  const { data: modRow } = await supabase
    .from('community_moderator')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    isMember: !!memberRow || isOwner,
    isModerator: !!modRow || isOwner,
    isOwner,
  };
}

// 7. Get moderators list for community sidebar
export async function getCommunityModerators(communityId: string) {
  const { data, error } = await supabase
    .from('community_moderator')
    .select(`
      role,
      user:user (
        id,
        username,
        email
      )
    `)
    .eq('community_id', communityId);

  if (error) {
    console.error('Error fetching moderators:', error);
    return [];
  }

  return data || [];
}

// 8. Delete community (owner only)
export async function deleteCommunity(communityId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('community')
    .delete()
    .eq('id', communityId)
    .eq('created_by', user.id);

  if (error) {
    console.error('Error deleting community:', error.message);
    throw error;
  }
}

// 9. Fetch communities joined/created by current user (for LeftSidebar)
export async function getUserCommunities(): Promise<Community[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    // 1. Always fetch communities created by the current user
    const { data: createdCommunities, error: createdError } = await supabase
      .from('community')
      .select('id, name, slug, description, created_by, created_at')
      .eq('created_by', user.id);

    if (createdError) {
      console.error('Error fetching created communities:', createdError.message);
    }

    // 2. Fetch communities the user joined from community_members
    let joinedCommunities: Community[] = [];
    const { data: memberRows, error: memberError } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', user.id);

    if (!memberError && memberRows && memberRows.length > 0) {
      const joinedIds = memberRows.map((m) => m.community_id);
      const { data: joinedData } = await supabase
        .from('community')
        .select('id, name, slug, description, created_by, created_at')
        .in('id', joinedIds);

      joinedCommunities = (joinedData as Community[]) || [];
    }

    // 3. Combine both lists and remove duplicates
    const combined = [...(createdCommunities || []), ...joinedCommunities];
    const uniqueMap = new Map<string, Community>();
    combined.forEach((c) => uniqueMap.set(c.id, c as Community));

    return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Error in getUserCommunities:', err);
    return [];
  }
}

export interface CategorizedCommunities {
  created: Community[];
  joined: Community[];
}

export async function getCategorizedUserCommunities(): Promise<CategorizedCommunities> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { created: [], joined: [] };

  try {
    // 1. Communities created by user (Moderating / Your Communities)
    const { data: createdData } = await supabase
      .from('community')
      .select('*')
      .eq('created_by', user.id)
      .order('name', { ascending: true });

    // 2. Communities joined by user from community_members table
    const { data: memberRows } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', user.id);

    let joinedData: Community[] = [];

    if (memberRows && memberRows.length > 0) {
      const joinedIds = memberRows.map((m) => m.community_id);
      
      const { data: joinedList } = await supabase
        .from('community')
        .select('*')
        .in('id', joinedIds)
        .neq('created_by', user.id) // Exclude owned so there are no duplicates
        .order('name', { ascending: true });

      joinedData = (joinedList as Community[]) || [];
    }

    return {
      created: (createdData as Community[]) || [],
      joined: joinedData,
    };
  } catch (err) {
    console.error('Error fetching categorized communities:', err);
    return { created: [], joined: [] };
  }
}