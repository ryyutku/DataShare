import { supabase } from './supabaseclient';

export interface SearchResults {
    communities: Array<{
        id: string;
        name: string;
        slug: string;
        description: string;
    }>;
    posts: Array<{
        id: string;
        title: string;
        description: string;
        community?: { slug: string; name: string };
        author?: { username: string };
    }>;
}

export async function searchAll(query: string): Promise<SearchResults> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return { communities: [], posts: [] };

    // Search Communities (Fuzzy search on name, slug, description)
    const { data: communities } = await supabase
        .from('community')
        .select('id, name, slug, description')
        .or(`name.ilike.%${cleanQuery}%,slug.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
        .limit(5);

    // Calls the PostgreSQL function that understands stems & ranking
    const { data: smartPosts, error } = await supabase
        .rpc('search_posts', { search_term: cleanQuery });

    let finalPosts = smartPosts;

    if (!finalPosts || finalPosts.length === 0) {
        const { data: fallbackPosts } = await supabase
            .from('post')
            .select(`
        id,
        title,
        description,
        community:community!post_community_id_fkey (slug, name),
        author:user!post_author_id_fkey (username)
      `)
            .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
            .limit(10);

        finalPosts = fallbackPosts || [];
    }

    return {
        communities: (communities as any) || [],
        posts: (finalPosts as any) || [],
    };
}