// src/services/commentService.ts
import { supabase } from './supabaseclient';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
  author?: {
    username: string;
  };
  replies?: Comment[];
}

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comment')
    .select(`
      id,
      post_id,
      user_id,
      parent_comment_id,
      body,
      created_at,
      author:user (
        username
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching comments for post ${postId}:`, error.message);
    return [];
  }

  return nestComments((data as unknown as Comment[]) || []);
}

export function nestComments(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const topLevelComments: Comment[] = [];

  comments.forEach((c) => {
    commentMap.set(c.id, { ...c, replies: [] });
  });

  comments.forEach((c) => {
    const mappedComment = commentMap.get(c.id)!;
    if (c.parent_comment_id && commentMap.has(c.parent_comment_id)) {
      commentMap.get(c.parent_comment_id)!.replies!.push(mappedComment);
    } else {
      topLevelComments.push(mappedComment);
    }
  });

  return topLevelComments;
}

export async function addComment(newComment: {
  post_id: string;
  user_id: string;
  body: string;
  parent_comment_id?: string | null;
}): Promise<Comment> {
  const { data, error } = await supabase
    .from('comment')
    .insert([
      {
        post_id: newComment.post_id,
        user_id: newComment.user_id,
        body: newComment.body.trim(),
        parent_comment_id: newComment.parent_comment_id || null,
      },
    ])
    .select(`
      id,
      post_id,
      user_id,
      parent_comment_id,
      body,
      created_at,
      author:user (
        username
      )
    `)
    .single();

  if (error) {
    console.error('Error adding comment:', error.message);
    throw error;
  }

  return data as unknown as Comment;
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('comment').delete().eq('id', commentId);
  if (error) throw error;
}

export async function getCommentCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from('comment')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  return error ? 0 : count || 0;
}