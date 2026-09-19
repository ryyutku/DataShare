// src/types/post.ts

export type FieldDataType = 'string' | 'number' | 'boolean' | 'date' | 'select' | 'image_url';

export interface DatasetField {
  id: string;
  name: string;
  type: FieldDataType;
  description: string;
  required: boolean;
  exampleValue: string;
}

export interface CommunityOption {
  id: string;
  name: string;
  slug: string;
}

export interface TagOption {
  id: string;
  name: string;
  slug: string;
}

export interface CreatePostPayload {
  community_id: string;
  author_id: string;
  title: string;
  description: string;
  schema: Record<string, string>; // e.g. { "make": "string", "price": "number" }
  example_row: Record<string, any>; // e.g. { "make": "Toyota", "price": 15000 }
  goal_count: number;
  tag_ids?: string[];
}