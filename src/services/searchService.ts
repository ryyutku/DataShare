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

    const isCommunityOnly = cleanQuery.toLowerCase().startsWith('c/') || cleanQuery.toLowerCase().startsWith('r/');
    const actualQuery = isCommunityOnly ? cleanQuery.slice(2).trim() : cleanQuery;

    let communitiesQuery = supabase
        .from('community')
        .select('id, name, slug, description');

    if (actualQuery) {
        communitiesQuery = communitiesQuery.or(`name.ilike.%${actualQuery}%,slug.ilike.%${actualQuery}%,description.ilike.%${actualQuery}%`);
    }

    const { data: communities } = await communitiesQuery.limit(isCommunityOnly ? 10 : 5);

    let finalPosts: any[] = [];

    if (!isCommunityOnly && actualQuery) {
        const { data: smartPostIds } = await supabase
            .rpc('search_posts', { search_term: actualQuery });

        if (smartPostIds && smartPostIds.length > 0) {
            const ids = smartPostIds.map((p: any) => p.id);
            const { data: joinedPosts } = await supabase
                .from('post')
                .select(`
          id,
          title,
          description,
          community:community!post_community_id_fkey (slug, name),
          author:user!post_author_id_fkey (username)
        `)
                .in('id', ids);

            finalPosts = joinedPosts || [];
        } else {
            const { data: fallback } = await supabase
                .from('post')
                .select(`
          id,
          title,
          description,
          community:community!post_community_id_fkey (slug, name),
          author:user!post_author_id_fkey (username)
        `)
                .or(`title.ilike.%${actualQuery}%,description.ilike.%${actualQuery}%`)
                .limit(10);

            finalPosts = fallback || [];
        }
    }

    return {
        communities: (communities as any) || [],
        posts: finalPosts,
    };
}