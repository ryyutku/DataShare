import { supabase } from './supabaseclient';

// 1. Exact TypeScript Interface matching your table columns
export interface Tag {
    id: string;
    slug: string;
    name: string;
    created_by: string | null;
    created_at: string;

    // Joined profile of creator (optional)
    creator?: {
        username: string;
        avatar_url?: string;
    };
}

// 2. API: Get all tags (or search tags for autocomplete)
export async function getTags(searchQuery?: string): Promise<Tag[]> {
    let query = supabase
        .from('tag')
        .select(`
      id,
      slug,
      name,
      created_by,
      created_at,
      creator:profiles!tag_created_by_fkey (
        username,
        avatar_url
      )
    `)
        .order('name', { ascending: true });

    if (searchQuery && searchQuery.trim() !== '') {
        const term = searchQuery.trim().toLowerCase();
        query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) {
        console.error('Error fetching tags:', error.message);
        throw error;
    }

    return (data as unknown as Tag[]) || [];
}

// 3. API: Get a single tag by its unique slug (e.g. /tag/machine-learning)
export async function getTagBySlug(slug: string): Promise<Tag | null> {
    const cleanSlug = slug.trim().toLowerCase();

    const { data, error } = await supabase
        .from('tag')
        .select(`
      id,
      slug,
      name,
      created_by,
      created_at,
      creator:profiles!tag_created_by_fkey (
        username,
        avatar_url
      )
    `)
        .eq('slug', cleanSlug)
        .single();

    if (error) {
        console.error(`Error fetching tag with slug ${cleanSlug}:`, error.message);
        return null;
    }

    return data as unknown as Tag;
}

// 4. API: Create a new tag (or return existing if slug already exists)
export async function getOrCreateTag(
    name: string,
    createdById?: string | null
): Promise<Tag> {
    // Generate clean slug: "Web Development" -> "web-development"
    const cleanSlug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-');

    // 1. Check if already exists
    const existingTag = await getTagBySlug(cleanSlug);
    if (existingTag) {
        return existingTag;
    }

    // 2. Insert new tag
    const { data, error } = await supabase
        .from('tag')
        .insert([
            {
                name: name.trim(),
                slug: cleanSlug,
                created_by: createdById || null,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error(`Error creating tag ${name}:`, error.message);
        throw error;
    }

    return data as Tag;
}

// 5. API: Delete a tag
export async function deleteTag(tagId: string): Promise<void> {
    const { error } = await supabase
        .from('tag')
        .delete()
        .eq('id', tagId);

    if (error) {
        console.error('Error deleting tag:', error.message);
        throw error;
    }
}