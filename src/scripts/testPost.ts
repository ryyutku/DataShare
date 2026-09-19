// src/scripts/testPost.ts
import 'dotenv/config';
import { createPost, getPosts, getPostById, updatePost, deletePost } from '../services/postService';

async function run() {
  console.log('--- Creating post ---');
  const newPost = await createPost({
    community_id: 'bbbbbbbb-0000-0000-0000-000000000001',
    author_id: '11111111-1111-1111-1111-111111111111',
    title: 'Test post from script',
    description: 'Just checking createPost works',
    schema: [{ name: 'text', type: 'string' }],
    example_row: { text: 'hello world' },
    goal_count: 10,
  });
  console.log('Created:', newPost);

  console.log('--- Fetching post by id ---');
  const fetched = await getPostById(newPost.id);
  console.log('Fetched:', fetched);

  console.log('--- Listing posts in community ---');
  const posts = await getPosts('bbbbbbbb-0000-0000-0000-000000000001');
  console.log('Posts:', posts);

  console.log('--- Updating post ---');
  const updated = await updatePost(newPost.id, { title: 'Updated title from script' });
  console.log('Updated:', updated);

  console.log('--- Deleting post ---');
  await deletePost(newPost.id);
  console.log('Deleted post', newPost.id);

  console.log('--- Confirming deletion ---');
  const afterDelete = await getPostById(newPost.id);
  console.log('Should be null:', afterDelete);
}

run().catch((err) => {
  console.error('Test script failed:', err);
});