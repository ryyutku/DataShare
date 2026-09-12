import { supabase } from './supabaseclient';

// 1. Exact TypeScript Interface matching your table columns
export interface Community {
    id: string;
    slug: string;
    name: string;
    description: string;
    created_by: string;
    created_at: string;

    // Optional: Populated when joining creator profile
    creator?: {
        username: string;
        avatar_url?: string;
    };
}

// 2. API: Fetch all communities (Sorted by newest or alphabetical)
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
      creator:profiles!community_created_by_fkey (
        username,
        avatar_url
      )
    `)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching communities:', error.message);
        throw error;
    }

    return (data as unknown as Community[]) || [];
}

// 3. API: Fetch a single community by its unique SLUG (e.g. /r/webdev)
export async function getCommunityBySlug(slug: string): Promise<Community | null> {
    const cleanSlug = slug.startsWith('r/') ? slug.replace('r/', '') : slug;

    const { data, error } = await supabase
        .from('community')
        .select(`
      id,
      slug,
      name,
      description,
      created_by,
      created_at,
      creator:profiles!community_created_by_fkey (
        username,
        avatar_url
      )
    `)
        .eq('slug', cleanSlug)
        .single();

    if (error) {
        console.error(`Error fetching community with slug ${cleanSlug}:`, error.message);
        return null;
    }

    return data as unknown as Community;
}

// 4. API: Create a brand new community
export async function createCommunity(newCommunity: {
    name: string;
    slug: string;
    description: string;
    created_by: string; // The UUID of the logged-in user
}): Promise<Community> {
    // Format slug cleanly: lowercase, no spaces (e.g., "Web Dev" -> "web-dev")
    const cleanSlug = newCommunity.slug
        .trim()
        .toLowerCase()
        .replace(/^r\//, '') // strip "r/" if typed
        .replace(/[^a-z0-9-_]/g, '-'); // replace special characters with dashes

    const { data, error } = await supabase
        .from('community')
        .insert([
            {
                name: newCommunity.name.trim(),
                slug: cleanSlug,
                description: newCommunity.description.trim(),
                created_by: newCommunity.created_by,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error creating community:', error.message);
        throw error;
    }

    return data as Community;
}

// 5. API: Search communities by name or slug (For Search Bar)
export async function searchCommunities(searchTerm: string): Promise<Community[]> {
    const { data, error } = await supabase
        .from('community')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        .limit(10);

    if (error) {
        console.error('Error searching communities:', error.message);
        throw error;
    }

    return data || [];
}

// 6. API: Check if a slug is already taken (For real-time validation when creating)
export async function isSlugAvailable(slug: string): Promise<boolean> {
    const cleanSlug = slug.trim().toLowerCase().replace(/^r\//, '');
    const { data } = await supabase
        .from('community')
        .select('id')
        .eq('slug', cleanSlug)
        .maybeSingle();

    return !data; // Returns true if available, false if taken
}