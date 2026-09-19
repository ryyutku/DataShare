// src/types/postDetail.ts

export interface PostDetail {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  description: string;
  schema: Record<string, string>; // e.g. { "city": "string", "price_usd": "number" }
  example_row: Record<string, any>;
  goal_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username: string;
  };
  community?: {
    id: string;
    slug: string;
    name: string;
    description: string;
  };
  upvotes_count?: number;
  has_upvoted?: boolean;
}

export interface SubmissionRow {
  id: string;
  post_id: string;
  contributor_id: string;
  data: Record<string, any>;
  created_at: string;
  contributor?: {
    username: string;
  };
}

export interface CommentItem {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
  author?: {
    username: string;
  };
  replies?: CommentItem[];
}