import { supabase } from './supabaseclient';

// 1. Exact TypeScript Interface matching your table columns
export interface SubmissionRow {
    id: string;
    post_id: string;
    contributor_id: string;
    data: Record<string, any>;          // The actual JSONB data row
    parent_row_id: string | null;       // Null if original, UUID if an edited revision
    is_current: boolean;                // True = latest active row, False = historical version
    is_deleted: boolean;                // Soft delete flag
    created_at: string;

    // Joined profile of contributor
    contributor?: {
        username: string;
        avatar_url?: string;
    };
}

// 2. API: Get all active, current rows for a dataset post (The Live Dataset)
export async function getDatasetRows(
    postId: string,
    limit: number = 50,
    offset: number = 0
): Promise<SubmissionRow[]> {
    const { data, error } = await supabase
        .from('submission_row')
        .select(`
      id,
      post_id,
      contributor_id,
      data,
      parent_row_id,
      is_current,
      is_deleted,
      created_at,
      contributor:profiles!submission_row_contributor_id_fkey (
        username,
        avatar_url
      )
    `)
        .eq('post_id', postId)
        .eq('is_current', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error(`Error fetching dataset rows for post ${postId}:`, error.message);
        throw error;
    }

    return (data as unknown as SubmissionRow[]) || [];
}

// 3. API: Contribute a new single data row
export async function submitDataRow(
    postId: string,
    contributorId: string,
    rowData: Record<string, any>
): Promise<SubmissionRow> {
    const { data, error } = await supabase
        .from('submission_row')
        .insert([
            {
                post_id: postId,
                contributor_id: contributorId,
                data: rowData,
                parent_row_id: null,
                is_current: true,
                is_deleted: false,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error submitting data row:', error.message);
        throw error;
    }

    return data as SubmissionRow;
}

// 4. API: Bulk submit data rows (e.g. CSV upload)
export async function bulkSubmitRows(
    postId: string,
    contributorId: string,
    rowsData: Record<string, any>[]
): Promise<void> {
    if (rowsData.length === 0) return;

    const records = rowsData.map((row) => ({
        post_id: postId,
        contributor_id: contributorId,
        data: row,
        parent_row_id: null,
        is_current: true,
        is_deleted: false,
    }));

    const { error } = await supabase
        .from('submission_row')
        .insert(records);

    if (error) {
        console.error('Error bulk submitting rows:', error.message);
        throw error;
    }
}

// 5. API: Edit/Revise a row (Git-style versioning)
// Marks previous row as is_current = false, and inserts the new version pointing back to it!
export async function editDataRow(
    oldRow: SubmissionRow,
    updatedData: Record<string, any>,
    editorId: string
): Promise<SubmissionRow> {
    // 1. Mark the old row as no longer the current version
    await supabase
        .from('submission_row')
        .update({ is_current: false })
        .eq('id', oldRow.id);

    // 2. Insert the new revised version pointing to the old one
    const { data, error } = await supabase
        .from('submission_row')
        .insert([
            {
                post_id: oldRow.post_id,
                contributor_id: editorId,
                data: updatedData,
                parent_row_id: oldRow.id, // Linked to parent revision!
                is_current: true,
                is_deleted: false,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error revising row:', error.message);
        throw error;
    }

    return data as SubmissionRow;
}

// 6. API: Soft-delete a row (Keeps history intact)
export async function softDeleteRow(rowId: string): Promise<void> {
    const { error } = await supabase
        .from('submission_row')
        .update({ is_deleted: true, is_current: false })
        .eq('id', rowId);

    if (error) {
        console.error('Error deleting row:', error.message);
        throw error;
    }
}

// 7. API: Get count of active rows (Calculates progress against goal_count)
export async function getActiveRowCount(postId: string): Promise<number> {
    const { count, error } = await supabase
        .from('submission_row')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('is_current', true)
        .eq('is_deleted', false);

    if (error) {
        console.error('Error getting row count:', error.message);
        return 0;
    }

    return count || 0;
}

// 8. API: Get revision history of a row
export async function getRowHistory(initialRowId: string): Promise<SubmissionRow[]> {
    const { data, error } = await supabase
        .from('submission_row')
        .select('*')
        .or(`id.eq.${initialRowId},parent_row_id.eq.${initialRowId}`)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching row history:', error.message);
        throw error;
    }

    return (data as unknown as SubmissionRow[]) || [];
}