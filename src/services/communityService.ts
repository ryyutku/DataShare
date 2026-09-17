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
  topics?: string[];
}

export interface CategorizedCommunities {
  created: Community[];
  joined: Community[];
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
      creator:user!community_created_by_fkey (
        id,
        username,
        email
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching communities:', error.message);
    return [];
  }

  return (data as unknown as Community[]) || [];
}

// 2. Resilient Community Fetcher (matches by slug, name, or UUID id)
export async function getCommunityBySlug(slugOrId: string): Promise<Community | null> {
  if (!slugOrId) return null;

  const raw = slugOrId.trim();
  const cleanSlug = raw.toLowerCase().replace(/^r\//, '');
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);

  try {
    let communityData: any = null;

    if (isUUID) {
      const { data } = await supabase
        .from('community')
        .select('*')
        .eq('id', raw)
        .maybeSingle();
      communityData = data;
    }

    if (!communityData) {
      const { data } = await supabase
        .from('community')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();
      communityData = data;
    }

    // Fallback: match by name
    if (!communityData) {
      const { data } = await supabase
        .from('community')
        .select('*')
        .ilike('name', cleanSlug)
        .maybeSingle();
      communityData = data;
    }

    if (!communityData) {
      console.warn(`Community "${slugOrId}" not found`);
      return null;
    }

    // Fetch creator safely from "user" table
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
    console.error(`Error in getCommunityBySlug:`, err);
    return null;
  }
}

// 3. Create a brand new community
export async function createCommunity(input: CreateCommunityInput): Promise<Community> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to create a community.');

  const cleanSlug = (input.slug || input.name)
    .trim()
    .toLowerCase()
    .replace(/^r\//, '')
    .replace(/[^a-z0-9_]/g, '-');

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

  // Add creator to community_members table
  await supabase.from('community_members').insert([
    {
      community_id: newCommunity.id,
      user_id: user.id,
    },
  ]);

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

  const { data: memberRow } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    isMember: !!memberRow || isOwner,
    isModerator: isOwner,
    isOwner,
  };
}

// 7. Get moderators list
export async function getCommunityModerators(communityId: string) {
  const { data, error } = await supabase
    .from('community')
    .select(`
      created_by,
      creator:user!community_created_by_fkey (
        id,
        username,
        email
      )
    `)
    .eq('id', communityId)
    .maybeSingle();

  if (error || !data?.creator) return [];
  return [{ role: 'owner', user: data.creator }];
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

// 9. Fetch communities joined/created by current user
export async function getUserCommunities(): Promise<Community[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data: createdCommunities } = await supabase
      .from('community')
      .select('*')
      .eq('created_by', user.id);

    const { data: memberRows } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', user.id);

    let joinedCommunities: Community[] = [];
    if (memberRows && memberRows.length > 0) {
      const joinedIds = memberRows.map((m) => m.community_id);
      const { data: joinedData } = await supabase
        .from('community')
        .select('*')
        .in('id', joinedIds);

      joinedCommunities = (joinedData as Community[]) || [];
    }

    const combined = [...(createdCommunities || []), ...joinedCommunities];
    const uniqueMap = new Map<string, Community>();
    combined.forEach((c) => uniqueMap.set(c.id, c as Community));

    return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Error in getUserCommunities:', err);
    return [];
  }
}

// 10. Fetch categorized communities for sidebar
export async function getCategorizedUserCommunities(): Promise<CategorizedCommunities> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { created: [], joined: [] };

  try {
    const { data: createdData } = await supabase
      .from('community')
      .select('*')
      .eq('created_by', user.id)
      .order('name', { ascending: true });

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
        .neq('created_by', user.id)
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