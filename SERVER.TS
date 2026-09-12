import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase directly inside server.ts using process.env
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in .env!\n');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(express.json());

// 2. Swagger UI Document Specification
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'DataShare Custom APIs',
        version: '1.0.0',
        description: 'Swagger UI testing playground for your custom DataShare endpoints'
    },
    paths: {
        //post apis start
        '/api/posts': {
            get: {
                tags: ['1. Posts (postService)'],
                summary: 'getPosts() - Fetch all posts',
                responses: { 200: { description: 'Success' } }
            },
            post: {
                tags: ['1. Posts (postService)'],
                summary: 'createPost() - Create a new dataset post',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    community_id: { type: 'string', example: 'paste-community-uuid' },
                                    author_id: { type: 'string', example: 'paste-user-uuid' },
                                    title: { type: 'string', example: 'US Used Cars 2026' },
                                    description: { type: 'string', example: 'Crowdsourcing car prices' },
                                    schema: { type: 'object', example: { make: 'string', price: 'number' } },
                                    example_row: { type: 'object', example: { make: 'Toyota', price: 15000 } },
                                    goal_count: { type: 'integer', example: 100 }
                                },
                                required: ['community_id', 'author_id', 'title', 'schema', 'example_row']
                            }
                        }
                    }
                },
                responses: { 201: { description: 'Created' } }
            }
        },
        '/api/posts/{id}': {
            get: {
                tags: ['1. Posts (postService)'],
                summary: 'getPostById() - Fetch a single post by UUID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: { 200: { description: 'Success' } }
            },
            put: {
                tags: ['1. Posts (postService)'],
                summary: 'updatePost() - Update a post',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string', example: 'Updated Title' },
                                    description: { type: 'string', example: 'Updated Description' },
                                    goal_count: { type: 'integer', example: 200 }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Updated' } }
            },
            delete: {
                tags: ['1. Posts (postService)'],
                summary: 'deletePost() - Delete a post',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: { 200: { description: 'Deleted' } }
            }
        },
        //post apis end

        //post tag start
        '/api/post-tags/by-post': {
            get: {
                tags: ['7. Post Tags (postTagService)'],
                summary: 'getTagsForPost() - Get all tags for a post',
                description: 'Returns all tag badges attached to a specific post ID.',
                parameters: [
                    {
                        name: 'post_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-post-uuid-here' },
                        description: 'The UUID of the post'
                    }
                ],
                responses: {
                    200: { description: 'Array of tags' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/post-tags/by-tag': {
            get: {
                tags: ['7. Post Tags (postTagService)'],
                summary: 'getPostsByTag() - Get all posts with a specific tag',
                description: 'Finds all dataset posts tagged with a specific tag UUID (e.g. clicking #machine-learning).',
                parameters: [
                    {
                        name: 'tag_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-tag-uuid-here' },
                        description: 'The UUID of the tag'
                    }
                ],
                responses: {
                    200: { description: 'Array of posts' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/post-tags/attach': {
            post: {
                tags: ['7. Post Tags (postTagService)'],
                summary: 'attachTagToPost() - Attach a single tag to a post',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    post_id: { type: 'string', example: 'paste-post-uuid' },
                                    tag_id: { type: 'string', example: 'paste-tag-uuid' }
                                },
                                required: ['post_id', 'tag_id']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Tag attached successfully' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/post-tags/bulk-attach': {
            post: {
                tags: ['7. Post Tags (postTagService)'],
                summary: 'attachMultipleTagsToPost() - Bulk attach tags to a post',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    post_id: { type: 'string', example: 'paste-post-uuid' },
                                    tag_ids: {
                                        type: 'array',
                                        items: { type: 'string' },
                                        example: ['tag-uuid-1', 'tag-uuid-2']
                                    }
                                },
                                required: ['post_id', 'tag_ids']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Tags attached successfully' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/post-tags/remove': {
            delete: {
                tags: ['7. Post Tags (postTagService)'],
                summary: 'removeTagFromPost() - Remove a tag from a post',
                parameters: [
                    {
                        name: 'post_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-post-uuid' }
                    },
                    {
                        name: 'tag_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-tag-uuid' }
                    }
                ],
                responses: {
                    200: { description: 'Tag removed from post successfully' },
                    500: { description: 'Server error' }
                }
            }
        },
        // post tag end


        //community apis start
        '/api/communities': {
            get: {
                tags: ['2. Communities (communityService)'],
                summary: 'getCommunities() - Fetch all communities',
                description: 'Returns all communities sorted alphabetically by name.',
                responses: {
                    200: { description: 'Array of communities' },
                    500: { description: 'Server error' }
                }
            },
            post: {
                tags: ['2. Communities (communityService)'],
                summary: 'createCommunity() - Create a new community',
                description: 'Registers a new community and auto-formats the slug (e.g. "Web Dev" -> "web-dev").',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Machine Learning' },
                                    slug: { type: 'string', example: 'machine-learning' },
                                    description: { type: 'string', example: 'Community for sharing ML models and datasets.' },
                                    created_by: { type: 'string', example: 'paste-user-uuid' }
                                },
                                required: ['name', 'slug', 'description', 'created_by']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Community created successfully' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/communities/slug/{slug}': {
            get: {
                tags: ['2. Communities (communityService)'],
                summary: 'getCommunityBySlug() - Fetch single community by slug',
                description: 'Retrieves community details using its URL slug (e.g. "webdev" or "r/webdev").',
                parameters: [
                    {
                        name: 'slug',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', example: 'webdev' },
                        description: 'The unique slug of the community'
                    }
                ],
                responses: {
                    200: { description: 'Community details' },
                    404: { description: 'Community not found' }
                }
            }
        },

        '/api/communities/search': {
            get: {
                tags: ['2. Communities (communityService)'],
                summary: 'searchCommunities() - Search communities by name or slug',
                description: 'Searches for communities matching a partial query string.',
                parameters: [
                    {
                        name: 'q',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'web' },
                        description: 'Search keyword'
                    }
                ],
                responses: {
                    200: { description: 'Matching communities' }
                }
            }
        },

        '/api/communities/check-slug': {
            get: {
                tags: ['2. Communities (communityService)'],
                summary: 'isSlugAvailable() - Check if a slug is available',
                description: 'Returns whether a community slug is taken or free to register.',
                parameters: [
                    {
                        name: 'slug',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'react' },
                        description: 'Slug to check'
                    }
                ],
                responses: {
                    200: { description: 'Returns { available: boolean }' }
                }
            }
        },
        //community apis end

        //community tags apis start
        '/api/community-tags/by-community': {
            get: {
                tags: ['7. Community Tags (communityTagService)'],
                summary: 'getTagsForCommunity() - Get all tags linked to a community',
                description: 'Retrieves all global tags associated with a specific community UUID.',
                parameters: [
                    {
                        name: 'community_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-community-uuid-here' },
                        description: 'The UUID of the community'
                    }
                ],
                responses: {
                    200: { description: 'Array of tags' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/community-tags/by-tag': {
            get: {
                tags: ['7. Community Tags (communityTagService)'],
                summary: 'getCommunitiesByTag() - Find communities that use a tag',
                description: 'Retrieves all communities associated with a specific tag UUID.',
                parameters: [
                    {
                        name: 'tag_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-tag-uuid-here' },
                        description: 'The UUID of the tag'
                    }
                ],
                responses: {
                    200: { description: 'Array of communities' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/community-tags/link': {
            post: {
                tags: ['7. Community Tags (communityTagService)'],
                summary: 'linkTagToCommunity() - Link a tag to a community',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    community_id: { type: 'string', example: 'paste-community-uuid' },
                                    tag_id: { type: 'string', example: 'paste-tag-uuid' }
                                },
                                required: ['community_id', 'tag_id']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Tag linked to community successfully' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/community-tags/bulk-link': {
            post: {
                tags: ['7. Community Tags (communityTagService)'],
                summary: 'linkMultipleTagsToCommunity() - Bulk link tags to a community',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    community_id: { type: 'string', example: 'paste-community-uuid' },
                                    tag_ids: {
                                        type: 'array',
                                        items: { type: 'string' },
                                        example: ['tag-uuid-1', 'tag-uuid-2']
                                    }
                                },
                                required: ['community_id', 'tag_ids']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'All tags linked successfully' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/community-tags/unlink': {
            delete: {
                tags: ['7. Community Tags (communityTagService)'],
                summary: 'unlinkTagFromCommunity() - Unlink a tag from a community',
                parameters: [
                    {
                        name: 'community_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-community-uuid' }
                    },
                    {
                        name: 'tag_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-tag-uuid' }
                    }
                ],
                responses: {
                    200: { description: 'Tag unlinked successfully' },
                    500: { description: 'Server error' }
                }
            }
        },
        //community tags apis end

        //comment apis start    
        '/api/comments': {
            get: {
                tags: ['3. Comments (commentService)'],
                summary: 'getCommentsByPostId() - Fetch all comments for a post',
                description: 'Returns all comments linked to a specific post_id in chronological order.',
                parameters: [
                    {
                        name: 'post_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-post-uuid-here' },
                        description: 'The UUID of the post to get comments for'
                    }
                ],
                responses: {
                    200: { description: 'Array of comments' },
                    500: { description: 'Server error' }
                }
            },
            post: {
                tags: ['3. Comments (commentService)'],
                summary: 'addComment() - Create a comment or nested reply',
                description: 'Creates a top-level comment (parent_comment_id: null) or a reply to an existing comment (pass parent_comment_id).',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    post_id: { type: 'string', example: 'paste-post-uuid' },
                                    user_id: { type: 'string', example: 'paste-user-uuid' },
                                    body: { type: 'string', example: 'This is a great dataset, thanks for sharing!' },
                                    parent_comment_id: {
                                        type: 'string',
                                        nullable: true,
                                        example: null,
                                        description: 'Pass null for top-level comment, or pass UUID of comment to reply to'
                                    }
                                },
                                required: ['post_id', 'user_id', 'body']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Comment created successfully' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/comments/count': {
            get: {
                tags: ['3. Comments (commentService)'],
                summary: 'getCommentCount() - Get total comments count for a post',
                parameters: [
                    {
                        name: 'post_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-post-uuid-here' },
                        description: 'The UUID of the post'
                    }
                ],
                responses: {
                    200: { description: 'Total count returned as { count: number }' }
                }
            }
        },

        '/api/comments/{id}': {
            delete: {
                tags: ['3. Comments (commentService)'],
                summary: 'deleteComment() - Delete a comment by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'The UUID of the comment to delete'
                    }
                ],
                responses: {
                    200: { description: 'Comment deleted successfully' },
                    500: { description: 'Server error' }
                }
            }
        },
        //comment apis end

        //tag apis start    
        '/api/tags': {
            get: {
                tags: ['6. Global Tags (globalTagService)'],
                summary: 'getTags() - Fetch all tags or search for autocomplete',
                description: 'Returns up to 20 tags sorted alphabetically. Can be filtered with a search keyword.',
                parameters: [
                    {
                        name: 'search',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', example: 'react' },
                        description: 'Optional partial keyword to filter tags'
                    }
                ],
                responses: {
                    200: { description: 'Array of tags' },
                    500: { description: 'Server error' }
                }
            },
            post: {
                tags: ['6. Global Tags (globalTagService)'],
                summary: 'getOrCreateTag() - Create tag or get existing',
                description: 'Auto-formats the tag slug (e.g. "Web Dev" -> "web-dev"). Returns existing tag if it already exists.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Artificial Intelligence' },
                                    created_by: { type: 'string', nullable: true, example: 'paste-user-uuid-or-null' }
                                },
                                required: ['name']
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Existing tag returned' },
                    201: { description: 'New tag created successfully' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/tags/slug/{slug}': {
            get: {
                tags: ['6. Global Tags (globalTagService)'],
                summary: 'getTagBySlug() - Fetch single tag by its slug',
                description: 'Retrieves tag details using its clean slug (e.g. "machine-learning").',
                parameters: [
                    {
                        name: 'slug',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', example: 'machine-learning' },
                        description: 'The unique slug of the tag'
                    }
                ],
                responses: {
                    200: { description: 'Tag details' },
                    404: { description: 'Tag not found' }
                }
            }
        },

        '/api/tags/{id}': {
            delete: {
                tags: ['6. Global Tags (globalTagService)'],
                summary: 'deleteTag() - Delete a tag by UUID',
                description: 'Permanently removes a tag by its ID.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'The UUID of the tag to delete'
                    }
                ],
                responses: {
                    200: { description: 'Tag deleted successfully' },
                    500: { description: 'Server error' }
                }
            }
        },
        //tag apis start    

        //moderate server start
        '/api/moderators': {
            get: {
                tags: ['8. Moderators (moderatorService)'],
                summary: 'getCommunityModerators() - Get all moderators for a community',
                description: 'Returns all assigned moderators and their roles for a specific community.',
                parameters: [
                    {
                        name: 'community_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-community-uuid' },
                        description: 'The UUID of the community'
                    }
                ],
                responses: {
                    200: { description: 'Array of moderators' },
                    500: { description: 'Server error' }
                }
            },
            post: {
                tags: ['8. Moderators (moderatorService)'],
                summary: 'addModerator() - Add a user as moderator',
                description: 'Assigns a moderator role (owner, moderator, admin) to a user in a community.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    community_id: { type: 'string', example: 'paste-community-uuid' },
                                    user_id: { type: 'string', example: 'paste-user-uuid' },
                                    role: { type: 'string', example: 'moderator' }
                                },
                                required: ['community_id', 'user_id', 'role']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Moderator assigned successfully' },
                    500: { description: 'Server error' }
                }
            },
            delete: {
                tags: ['8. Moderators (moderatorService)'],
                summary: 'removeModerator() - Remove a moderator from a community',
                parameters: [
                    {
                        name: 'community_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-community-uuid' }
                    },
                    {
                        name: 'user_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-user-uuid' }
                    }
                ],
                responses: {
                    200: { description: 'Moderator removed successfully' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/moderators/check': {
            get: {
                tags: ['8. Moderators (moderatorService)'],
                summary: 'checkUserModStatus() - Check if user is a moderator',
                description: 'Returns { isModerator: boolean, role: string | null } for permission checks.',
                parameters: [
                    {
                        name: 'community_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-community-uuid' }
                    },
                    {
                        name: 'user_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-user-uuid' }
                    }
                ],
                responses: {
                    200: { description: 'Returns moderator status' }
                }
            }
        },

        '/api/moderators/role': {
            put: {
                tags: ['8. Moderators (moderatorService)'],
                summary: 'updateModeratorRole() - Change moderator role',
                description: 'Promote or change role (e.g. from moderator to owner).',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    community_id: { type: 'string', example: 'paste-community-uuid' },
                                    user_id: { type: 'string', example: 'paste-user-uuid' },
                                    role: { type: 'string', example: 'owner' }
                                },
                                required: ['community_id', 'user_id', 'role']
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Role updated successfully' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/moderators/by-user': {
            get: {
                tags: ['8. Moderators (moderatorService)'],
                summary: 'getCommunitiesModeratedByUser() - Get communities user moderates',
                description: 'Returns an array of community IDs where this user holds a moderator role.',
                parameters: [
                    {
                        name: 'user_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-user-uuid' },
                        description: 'The UUID of the user'
                    }
                ],
                responses: {
                    200: { description: 'Array of community IDs' }
                }
            }
        },
        //moderate server end   

        //submissionrowservice start
        '/api/submission-rows': {
            get: {
                tags: ['4. Submission Rows (submissionRowService)'],
                summary: 'getDatasetRows() - Get active rows for a dataset',
                description: 'Returns all current, non-deleted dataset rows for a specific post_id (supports pagination with limit & offset).',
                parameters: [
                    {
                        name: 'post_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-post-uuid-here' },
                        description: 'The UUID of the post/dataset'
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 50 },
                        description: 'Rows per page'
                    },
                    {
                        name: 'offset',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 0 },
                        description: 'Number of rows to skip'
                    }
                ],
                responses: {
                    200: { description: 'Array of dataset rows' },
                    500: { description: 'Server error' }
                }
            },
            post: {
                tags: ['4. Submission Rows (submissionRowService)'],
                summary: 'submitDataRow() - Contribute a single row to dataset',
                description: 'Submits a new data object matching the post schema. Automatically sets is_current = true and is_deleted = false.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    post_id: { type: 'string', example: 'paste-post-uuid' },
                                    contributor_id: { type: 'string', example: 'paste-user-uuid' },
                                    data: {
                                        type: 'object',
                                        example: {
                                            make: 'Tesla',
                                            model: 'Model 3',
                                            year: 2023,
                                            price_usd: 31000,
                                            city: 'Seattle'
                                        }
                                    }
                                },
                                required: ['post_id', 'contributor_id', 'data']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Row contributed successfully' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/submission-rows/bulk': {
            post: {
                tags: ['4. Submission Rows (submissionRowService)'],
                summary: 'bulkSubmitRows() - Bulk upload dataset rows (CSV/JSON)',
                description: 'Uploads an array of multiple data rows at once.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    post_id: { type: 'string', example: 'paste-post-uuid' },
                                    contributor_id: { type: 'string', example: 'paste-user-uuid' },
                                    rows_data: {
                                        type: 'array',
                                        items: { type: 'object' },
                                        example: [
                                            { make: 'Ford', model: 'F-150', year: 2021, price_usd: 28000 },
                                            { make: 'Honda', model: 'Civic', year: 2022, price_usd: 22000 }
                                        ]
                                    }
                                },
                                required: ['post_id', 'contributor_id', 'rows_data']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'All rows uploaded successfully' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/submission-rows/revise': {
            put: {
                tags: ['4. Submission Rows (submissionRowService)'],
                summary: 'editDataRow() - Revise a row (Git-style versioning)',
                description: 'Marks the old row as is_current = false, and inserts a new version pointing to it via parent_row_id.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    old_row_id: { type: 'string', example: 'paste-old-row-uuid' },
                                    post_id: { type: 'string', example: 'paste-post-uuid' },
                                    editor_id: { type: 'string', example: 'paste-user-uuid' },
                                    updated_data: {
                                        type: 'object',
                                        example: {
                                            make: 'Tesla',
                                            model: 'Model 3 Performance',
                                            year: 2023,
                                            price_usd: 34500
                                        }
                                    }
                                },
                                required: ['old_row_id', 'post_id', 'editor_id', 'updated_data']
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Row revised with new version' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/submission-rows/count': {
            get: {
                tags: ['4. Submission Rows (submissionRowService)'],
                summary: 'getActiveRowCount() - Get total active rows count',
                description: 'Returns the count of active rows to calculate progress towards the goal_count.',
                parameters: [
                    {
                        name: 'post_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-post-uuid-here' },
                        description: 'The UUID of the post'
                    }
                ],
                responses: {
                    200: { description: 'Returns { count: number }' }
                }
            }
        },

        '/api/submission-rows/history/{id}': {
            get: {
                tags: ['4. Submission Rows (submissionRowService)'],
                summary: 'getRowHistory() - Get audit/revision history for a row',
                description: 'Retrieves all historical edits and revisions linked to a row ID.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', example: 'paste-initial-row-uuid' },
                        description: 'Initial row UUID'
                    }
                ],
                responses: {
                    200: { description: 'Array of historical revisions' }
                }
            }
        },

        '/api/submission-rows/{id}': {
            delete: {
                tags: ['4. Submission Rows (submissionRowService)'],
                summary: 'softDeleteRow() - Soft delete a row',
                description: 'Marks is_deleted = true and is_current = false without destroying audit history.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Row UUID to soft-delete'
                    }
                ],
                responses: {
                    200: { description: 'Row soft-deleted successfully' }
                }
            }
        },

        //submissionrowservice end

        //upvote start
        '/api/upvotes/toggle': {
            post: {
                tags: ['5. Upvotes (voteService)'],
                summary: 'toggleUpvote() - Toggle upvote on a post',
                description: 'Toggles upvote status: if user has not upvoted, adds an upvote. If already upvoted, removes it.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    post_id: { type: 'string', example: 'paste-post-uuid' },
                                    user_id: { type: 'string', example: 'paste-user-uuid' }
                                },
                                required: ['post_id', 'user_id']
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Returns { hasUpvoted: boolean }' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/upvotes/check': {
            get: {
                tags: ['5. Upvotes (voteService)'],
                summary: 'hasUserUpvoted() - Check if user upvoted a post',
                description: 'Returns boolean to determine if the upvote arrow should be highlighted in orange.',
                parameters: [
                    {
                        name: 'post_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-post-uuid' },
                        description: 'The UUID of the post'
                    },
                    {
                        name: 'user_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-user-uuid' },
                        description: 'The UUID of the user'
                    }
                ],
                responses: {
                    200: { description: 'Returns { hasUpvoted: boolean }' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/upvotes/count': {
            get: {
                tags: ['5. Upvotes (voteService)'],
                summary: 'getPostUpvoteCount() - Get total upvotes for a post',
                description: 'Counts the total upvote records for a specific post_id.',
                parameters: [
                    {
                        name: 'post_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-post-uuid' },
                        description: 'The UUID of the post'
                    }
                ],
                responses: {
                    200: { description: 'Returns { count: number }' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/upvotes/user-posts': {
            get: {
                tags: ['5. Upvotes (voteService)'],
                summary: 'getUserUpvotedPostIds() - Get all post IDs upvoted by user',
                description: 'Returns an array of post UUIDs upvoted by a specific user (useful for a User Profile "Upvoted" tab).',
                parameters: [
                    {
                        name: 'user_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-user-uuid' },
                        description: 'The UUID of the user'
                    }
                ],
                responses: {
                    200: { description: 'Array of post UUIDs' },
                    500: { description: 'Server error' }
                }
            }
        },


        //upvote end

        //user interest start
        '/api/user-interests': {
            get: {
                tags: ['9. User Interests (userInterestService)'],
                summary: 'getUserInterests() - Get all tags followed by user',
                description: 'Returns all tags/topics that a specific user has followed.',
                parameters: [
                    {
                        name: 'user_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-user-uuid-here' },
                        description: 'The UUID of the user'
                    }
                ],
                responses: {
                    200: { description: 'Array of followed tags' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/user-interests/check': {
            get: {
                tags: ['9. User Interests (userInterestService)'],
                summary: 'isUserInterestedInTag() - Check if user follows a tag',
                description: 'Returns boolean to determine whether to show "Follow" or "Following" button.',
                parameters: [
                    {
                        name: 'user_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-user-uuid' }
                    },
                    {
                        name: 'tag_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-tag-uuid' }
                    }
                ],
                responses: {
                    200: { description: 'Returns { isFollowing: boolean }' }
                }
            }
        },

        '/api/user-interests/toggle': {
            post: {
                tags: ['9. User Interests (userInterestService)'],
                summary: 'toggleInterest() - Toggle follow/unfollow on a tag',
                description: 'Follows tag if not following, or unfollows if already following.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    user_id: { type: 'string', example: 'paste-user-uuid' },
                                    tag_id: { type: 'string', example: 'paste-tag-uuid' }
                                },
                                required: ['user_id', 'tag_id']
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Returns { isFollowing: boolean }' },
                    500: { description: 'Server error' }
                }
            }
        },

        '/api/user-interests/add': {
            post: {
                tags: ['9. User Interests (userInterestService)'],
                summary: 'addInterest() - Follow a tag',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    user_id: { type: 'string', example: 'paste-user-uuid' },
                                    tag_id: { type: 'string', example: 'paste-tag-uuid' }
                                },
                                required: ['user_id', 'tag_id']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Tag followed successfully' }
                }
            }
        },

        '/api/user-interests/remove': {
            delete: {
                tags: ['9. User Interests (userInterestService)'],
                summary: 'removeInterest() - Unfollow a tag',
                parameters: [
                    {
                        name: 'user_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-user-uuid' }
                    },
                    {
                        name: 'tag_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-tag-uuid' }
                    }
                ],
                responses: {
                    200: { description: 'Tag unfollowed successfully' }
                }
            }
        },

        '/api/user-interests/bulk': {
            post: {
                tags: ['9. User Interests (userInterestService)'],
                summary: 'setBulkInterests() - Bulk follow tags (Onboarding)',
                description: 'Follow multiple topics at once (e.g. initial onboarding flow).',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    user_id: { type: 'string', example: 'paste-user-uuid' },
                                    tag_ids: {
                                        type: 'array',
                                        items: { type: 'string' },
                                        example: ['tag-uuid-1', 'tag-uuid-2', 'tag-uuid-3']
                                    }
                                },
                                required: ['user_id', 'tag_ids']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'All tags followed successfully' }
                }
            }
        },

        '/api/user-interests/users-by-tag': {
            get: {
                tags: ['9. User Interests (userInterestService)'],
                summary: 'getUsersInterestedInTag() - Get all users following a tag',
                description: 'Returns an array of user UUIDs who follow a specific tag.',
                parameters: [
                    {
                        name: 'tag_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'paste-tag-uuid-here' }
                    }
                ],
                responses: {
                    200: { description: 'Array of user UUIDs' }
                }
            }
        },

        //user interest end

        //user service start
        '/api/users/signup': {
            post: {
                tags: ['0. Users & Auth (userService)'],
                summary: 'signUpUser() - Register new account',
                description: 'Creates an account in Supabase Auth AND creates a row in the public "user" table.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', example: 'developer@example.com' },
                                    password: { type: 'string', example: 'StrongPassword123!' },
                                    username: { type: 'string', example: 'developer' }
                                },
                                required: ['email', 'password', 'username']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'User registered successfully' },
                    400: { description: 'Registration error' }
                }
            }
        },

        '/api/users/signin': {
            post: {
                tags: ['0. Users & Auth (userService)'],
                summary: 'signInUser() - Log in with email & password',
                description: 'Authenticates credentials and returns session tokens (JWT).',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', example: 'developer@example.com' },
                                    password: { type: 'string', example: 'StrongPassword123!' }
                                },
                                required: ['email', 'password']
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Logged in successfully with access token' },
                    401: { description: 'Invalid credentials' }
                }
            }
        },

        '/api/users/signout': {
            post: {
                tags: ['0. Users & Auth (userService)'],
                summary: 'signOutUser() - Log out',
                responses: {
                    200: { description: 'Logged out successfully' }
                }
            }
        },

        '/api/users/check-username': {
            get: {
                tags: ['0. Users & Auth (userService)'],
                summary: 'isUsernameAvailable() - Check username availability',
                description: 'Returns whether a username is free or taken for real-time validation.',
                parameters: [
                    {
                        name: 'username',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', example: 'developer' },
                        description: 'Username to check'
                    }
                ],
                responses: {
                    200: { description: 'Returns { available: boolean }' }
                }
            }
        },

        '/api/users/username/{username}': {
            get: {
                tags: ['0. Users & Auth (userService)'],
                summary: 'getUserByUsername() - Fetch profile by username',
                description: 'Retrieves public user details using their handle (e.g. browsing /u/developer).',
                parameters: [
                    {
                        name: 'username',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', example: 'developer' }
                    }
                ],
                responses: {
                    200: { description: 'Public profile details' },
                    404: { description: 'User not found' }
                }
            }
        },

        '/api/users/{id}': {
            get: {
                tags: ['0. Users & Auth (userService)'],
                summary: 'getUserById() - Fetch user by UUID',
                description: 'Retrieves public user details by their unique ID.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', example: 'paste-user-uuid' }
                    }
                ],
                responses: {
                    200: { description: 'User profile details' },
                    404: { description: 'User not found' }
                }
            }
        },

        //user service end
    }
};

// 3. Mount Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 4. API Endpoints
// 1. GET ALL POSTS (WITH OPTIONAL COMMUNITY FILTER)
app.get('/api/posts', async (req, res) => {
    const communityId = req.query.community_id as string;

    let query = supabase
        .from('post')
        .select(`
      id,
      community_id,
      author_id,
      title,
      description,
      schema,
      example_row,
      goal_count,
      created_at,
      updated_at,
      author:user!post_author_id_fkey (
        username
      ),
      community:community!post_community_id_fkey (
        slug,
        name
      )
    `)
        .order('created_at', { ascending: false });

    if (communityId) {
        query = query.eq('community_id', communityId);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json(error);
    res.json(data);
});

// 2. CREATE A POST
app.post('/api/posts', async (req, res) => {
    const { community_id, author_id, title, description, schema, example_row, goal_count } = req.body;

    const { data, error } = await supabase
        .from('post')
        .insert([
            {
                community_id,
                author_id,
                title: title?.trim(),
                description: description?.trim(),
                schema,
                example_row,
                goal_count: goal_count || 100,
                updated_at: new Date().toISOString(),
            },
        ])
        .select(`
      id,
      community_id,
      author_id,
      title,
      description,
      schema,
      example_row,
      goal_count,
      created_at,
      updated_at
    `)
        .single();

    if (error) return res.status(500).json(error);
    res.status(201).json(data);
});

// 3. GET SINGLE POST BY ID
app.get('/api/posts/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('post')
        .select(`
      id,
      community_id,
      author_id,
      title,
      description,
      schema,
      example_row,
      goal_count,
      created_at,
      updated_at,
      author:user!post_author_id_fkey (
        username
      ),
      community:community!post_community_id_fkey (
        slug,
        name
      )
    `)
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(404).json({ error: 'Post not found', details: error.message });
    res.json(data);
});

// 4. UPDATE A POST
app.put('/api/posts/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('post')
        .update({
            ...req.body,
            updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

    if (error) return res.status(500).json(error);
    res.json(data);
});

// 5. DELETE A POST
app.delete('/api/posts/:id', async (req, res) => {
    const { error } = await supabase
        .from('post')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json(error);
    res.json({ message: 'Post deleted successfully' });
});
// 1. GET ALL COMMUNITIES
app.get('/api/communities', async (_req, res) => {
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
        username
      )
    `)
        .order('name', { ascending: true });

    if (error) return res.status(500).json(error);
    res.json(data);
});

// 2. CREATE A NEW COMMUNITY
app.post('/api/communities', async (req, res) => {
    const { name, slug, description, created_by } = req.body;

    const cleanSlug = slug
        .trim()
        .toLowerCase()
        .replace(/^r\//, '')
        .replace(/[^a-z0-9-_]/g, '-');

    const { data, error } = await supabase
        .from('community')
        .insert([
            {
                name: name.trim(),
                slug: cleanSlug,
                description: description.trim(),
                created_by,
            },
        ])
        .select()
        .single();

    if (error) return res.status(500).json(error);
    res.status(201).json(data);
});

// 3. SEARCH COMMUNITIES (Put before /:slug to prevent routing collision)
app.get('/api/communities/search', async (req, res) => {
    const q = req.query.q as string;
    if (!q) return res.json([]);

    const { data, error } = await supabase
        .from('community')
        .select('*')
        .or(`name.ilike.%${q}%,slug.ilike.%${q}%`)
        .limit(10);

    if (error) return res.status(500).json(error);
    res.json(data);
});

// 4. CHECK IF SLUG IS AVAILABLE
app.get('/api/communities/check-slug', async (req, res) => {
    const slug = (req.query.slug as string || '').trim().toLowerCase().replace(/^r\//, '');
    if (!slug) return res.status(400).json({ error: 'Missing slug parameter' });

    const { data } = await supabase
        .from('community')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

    res.json({ available: !data });
});

// 5. GET SINGLE COMMUNITY BY SLUG
app.get('/api/communities/slug/:slug', async (req, res) => {
    const cleanSlug = req.params.slug.startsWith('r/')
        ? req.params.slug.replace('r/', '')
        : req.params.slug;

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
        username
      )
    `)
        .eq('slug', cleanSlug)
        .single();

    if (error) return res.status(404).json({ error: 'Community not found', details: error.message });
    res.json(data);
});

// 1. GET ALL TAGS FOR A COMMUNITY
app.get('/api/community-tags/by-community', async (req, res) => {
    const communityId = req.query.community_id as string;
    if (!communityId) return res.status(400).json({ error: 'Missing community_id query parameter' });

    const { data, error } = await supabase
        .from('community_tag')
        .select(`
      tag:tag (
        id,
        slug,
        name,
        created_at
      )
    `)
        .eq('community_id', communityId);

    if (error) return res.status(500).json(error);
    const tags = data?.map((item: any) => item.tag).filter(Boolean) || [];
    res.json(tags);
});

// 2. GET ALL COMMUNITIES BY TAG
app.get('/api/community-tags/by-tag', async (req, res) => {
    const tagId = req.query.tag_id as string;
    if (!tagId) return res.status(400).json({ error: 'Missing tag_id query parameter' });

    const { data, error } = await supabase
        .from('community_tag')
        .select(`
      community:community (
        id,
        slug,
        name,
        description,
        created_by,
        created_at
      )
    `)
        .eq('tag_id', tagId);

    if (error) return res.status(500).json(error);
    const communities = data?.map((item: any) => item.community).filter(Boolean) || [];
    res.json(communities);
});

// 3. LINK A TAG TO A COMMUNITY
app.post('/api/community-tags/link', async (req, res) => {
    const { community_id, tag_id } = req.body;

    const { data, error } = await supabase
        .from('community_tag')
        .insert([{ community_id, tag_id }])
        .select();

    if (error && error.code !== '23505') return res.status(500).json(error);
    res.status(201).json({ message: 'Tag linked successfully', data });
});

// 4. BULK LINK MULTIPLE TAGS TO A COMMUNITY
app.post('/api/community-tags/bulk-link', async (req, res) => {
    const { community_id, tag_ids } = req.body;
    if (!tag_ids || !Array.isArray(tag_ids) || tag_ids.length === 0) {
        return res.status(400).json({ error: 'tag_ids must be a non-empty array' });
    }

    const records = tag_ids.map((tag_id: string) => ({
        community_id,
        tag_id,
    }));

    const { data, error } = await supabase
        .from('community_tag')
        .upsert(records, { onConflict: 'community_id,tag_id' });

    if (error) return res.status(500).json(error);
    res.status(201).json({ message: 'All tags linked successfully', data });
});

// 5. UNLINK A TAG FROM A COMMUNITY
app.delete('/api/community-tags/unlink', async (req, res) => {
    const communityId = req.query.community_id as string;
    const tagId = req.query.tag_id as string;

    if (!communityId || !tagId) {
        return res.status(400).json({ error: 'Missing community_id or tag_id query parameters' });
    }

    const { error } = await supabase
        .from('community_tag')
        .delete()
        .eq('community_id', communityId)
        .eq('tag_id', tagId);

    if (error) return res.status(500).json(error);
    res.json({ message: 'Tag unlinked successfully' });
});

// 1. GET ALL COMMENTS FOR A POST
app.get('/api/comments', async (req, res) => {
    const postId = req.query.post_id as string;
    if (!postId) {
        return res.status(400).json({ error: 'Missing required query parameter: post_id' });
    }

    const { data, error } = await supabase
        .from('comment')
        .select(`
      id,
      post_id,
      user_id,
      parent_comment_id,
      body,
      created_at,
      author:user!comment_user_id_fkey (
        username
      )
    `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) return res.status(500).json(error);
    res.json(data);
});

// 2. ADD A COMMENT OR REPLY
app.post('/api/comments', async (req, res) => {
    const { post_id, user_id, body, parent_comment_id } = req.body;

    const { data, error } = await supabase
        .from('comment')
        .insert([
            {
                post_id,
                user_id,
                body,
                parent_comment_id: parent_comment_id || null,
            },
        ])
        .select()
        .single();

    if (error) return res.status(500).json(error);
    res.status(201).json(data);
});

// 3. GET COMMENT COUNT FOR A POST
app.get('/api/comments/count', async (req, res) => {
    const postId = req.query.post_id as string;
    if (!postId) {
        return res.status(400).json({ error: 'Missing required query parameter: post_id' });
    }

    const { count, error } = await supabase
        .from('comment')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

    if (error) return res.status(500).json(error);
    res.json({ count: count || 0 });
});

// 4. DELETE A COMMENT
app.delete('/api/comments/:id', async (req, res) => {
    const { error } = await supabase
        .from('comment')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json(error);
    res.json({ message: 'Comment deleted successfully' });
});

// 1. GET ALL TAGS OR SEARCH
app.get('/api/tags', async (req, res) => {
    const search = req.query.search as string;

    let query = supabase
        .from('tag')
        .select(`
      id,
      slug,
      name,
      created_by,
      created_at,
      creator:user!tag_created_by_fkey (
        username
      )
    `)
        .order('name', { ascending: true });

    if (search && search.trim() !== '') {
        const term = search.trim().toLowerCase();
        query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) return res.status(500).json(error);
    res.json(data);
});

// 2. GET OR CREATE A TAG
app.post('/api/tags', async (req, res) => {
    const { name, created_by } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Tag name is required' });

    const cleanSlug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-');

    // Check if it already exists
    const { data: existing } = await supabase
        .from('tag')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();

    if (existing) {
        return res.status(200).json({ message: 'Tag already exists', tag: existing });
    }

    // Insert new tag
    const { data, error } = await supabase
        .from('tag')
        .insert([
            {
                name: name.trim(),
                slug: cleanSlug,
                created_by: created_by || null,
            },
        ])
        .select()
        .single();

    if (error) return res.status(500).json(error);
    res.status(201).json({ message: 'Tag created successfully', tag: data });
});

// 3. GET SINGLE TAG BY SLUG
app.get('/api/tags/slug/:slug', async (req, res) => {
    const cleanSlug = req.params.slug.trim().toLowerCase();

    const { data, error } = await supabase
        .from('tag')
        .select(`
      id,
      slug,
      name,
      created_by,
      created_at,
      creator:user!tag_created_by_fkey (
        username
      )
    `)
        .eq('slug', cleanSlug)
        .single();

    if (error) return res.status(404).json({ error: 'Tag not found', details: error.message });
    res.json(data);
});

// 4. DELETE A TAG
app.delete('/api/tags/:id', async (req, res) => {
    const { error } = await supabase
        .from('tag')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json(error);
    res.json({ message: 'Tag deleted successfully' });
});

// 1. GET ALL MODERATORS FOR A COMMUNITY
app.get('/api/moderators', async (req, res) => {
    const communityId = req.query.community_id as string;
    if (!communityId) return res.status(400).json({ error: 'Missing community_id query parameter' });

    const { data, error } = await supabase
        .from('community_moderator')
        .select(`
      community_id,
      user_id,
      role,
      user:user!community_moderator_user_id_fkey (
        username
      )
    `)
        .eq('community_id', communityId);

    if (error) return res.status(500).json(error);
    res.json(data);
});

// 2. CHECK USER MODERATOR STATUS
app.get('/api/moderators/check', async (req, res) => {
    const communityId = req.query.community_id as string;
    const userId = req.query.user_id as string;

    if (!communityId || !userId) {
        return res.status(400).json({ error: 'Missing community_id or user_id query parameter' });
    }

    const { data, error } = await supabase
        .from('community_moderator')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .maybeSingle();

    if (error) return res.status(500).json(error);
    res.json({ isModerator: !!data, role: data ? data.role : null });
});

// 3. ADD MODERATOR
app.post('/api/moderators', async (req, res) => {
    const { community_id, user_id, role } = req.body;

    const { data, error } = await supabase
        .from('community_moderator')
        .insert([
            {
                community_id,
                user_id,
                role: role || 'moderator',
            },
        ])
        .select()
        .single();

    if (error) return res.status(500).json(error);
    res.status(201).json(data);
});

// 4. UPDATE MODERATOR ROLE
app.put('/api/moderators/role', async (req, res) => {
    const { community_id, user_id, role } = req.body;

    const { data, error } = await supabase
        .from('community_moderator')
        .update({ role })
        .eq('community_id', community_id)
        .eq('user_id', user_id)
        .select()
        .single();

    if (error) return res.status(500).json(error);
    res.json(data);
});

// 5. REMOVE MODERATOR
app.delete('/api/moderators', async (req, res) => {
    const communityId = req.query.community_id as string;
    const userId = req.query.user_id as string;

    if (!communityId || !userId) {
        return res.status(400).json({ error: 'Missing community_id or user_id query parameter' });
    }

    const { error } = await supabase
        .from('community_moderator')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

    if (error) return res.status(500).json(error);
    res.json({ message: 'Moderator removed successfully' });
});

// 6. GET COMMUNITIES MODERATED BY USER
app.get('/api/moderators/by-user', async (req, res) => {
    const userId = req.query.user_id as string;
    if (!userId) return res.status(400).json({ error: 'Missing user_id query parameter' });

    const { data, error } = await supabase
        .from('community_moderator')
        .select('community_id')
        .eq('user_id', userId);

    if (error) return res.status(500).json(error);
    const communityIds = data ? data.map((item: any) => item.community_id) : [];
    res.json(communityIds);
});
// 1. GET ALL TAGS FOR A POST
app.get('/api/post-tags/by-post', async (req, res) => {
    const postId = req.query.post_id as string;
    if (!postId) return res.status(400).json({ error: 'Missing post_id query parameter' });

    const { data, error } = await supabase
        .from('post_tag')
        .select(`
      tag:tag (
        id,
        slug,
        name,
        created_at
      )
    `)
        .eq('post_id', postId);

    if (error) return res.status(500).json(error);
    const tags = data?.map((item: any) => item.tag).filter(Boolean) || [];
    res.json(tags);
});

// 2. GET ALL POSTS BY TAG
app.get('/api/post-tags/by-tag', async (req, res) => {
    const tagId = req.query.tag_id as string;
    if (!tagId) return res.status(400).json({ error: 'Missing tag_id query parameter' });

    const { data, error } = await supabase
        .from('post_tag')
        .select(`
      post:post (
        id,
        community_id,
        author_id,
        title,
        description,
        schema,
        example_row,
        goal_count,
        created_at,
        updated_at,
        author:user!post_author_id_fkey (
          username
        ),
        community:community!post_community_id_fkey (
          slug,
          name
        )
      )
    `)
        .eq('tag_id', tagId);

    if (error) return res.status(500).json(error);
    const posts = data?.map((item: any) => item.post).filter(Boolean) || [];
    res.json(posts);
});

// 3. ATTACH SINGLE TAG TO POST
app.post('/api/post-tags/attach', async (req, res) => {
    const { post_id, tag_id } = req.body;

    const { data, error } = await supabase
        .from('post_tag')
        .insert([{ post_id, tag_id }])
        .select();

    if (error && error.code !== '23505') return res.status(500).json(error);
    res.status(201).json({ message: 'Tag attached successfully', data });
});

// 4. BULK ATTACH TAGS TO POST
app.post('/api/post-tags/bulk-attach', async (req, res) => {
    const { post_id, tag_ids } = req.body;
    if (!tag_ids || !Array.isArray(tag_ids) || tag_ids.length === 0) {
        return res.status(400).json({ error: 'tag_ids must be a non-empty array' });
    }

    const records = tag_ids.map((tag_id: string) => ({
        post_id,
        tag_id,
    }));

    const { data, error } = await supabase
        .from('post_tag')
        .upsert(records, { onConflict: 'post_id,tag_id' });

    if (error) return res.status(500).json(error);
    res.status(201).json({ message: 'Tags attached successfully', data });
});

// 5. REMOVE TAG FROM POST
app.delete('/api/post-tags/remove', async (req, res) => {
    const postId = req.query.post_id as string;
    const tagId = req.query.tag_id as string;

    if (!postId || !tagId) {
        return res.status(400).json({ error: 'Missing post_id or tag_id query parameters' });
    }

    const { error } = await supabase
        .from('post_tag')
        .delete()
        .eq('post_id', postId)
        .eq('tag_id', tagId);

    if (error) return res.status(500).json(error);
    res.json({ message: 'Tag removed from post successfully' });
});
// 1. GET ALL CURRENT ROWS FOR A DATASET
app.get('/api/submission-rows', async (req, res) => {
    const postId = req.query.post_id as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!postId) return res.status(400).json({ error: 'Missing post_id query parameter' });

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
      contributor:user!submission_row_contributor_id_fkey (
        username
      )
    `)
        .eq('post_id', postId)
        .eq('is_current', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return res.status(500).json(error);
    res.json(data);
});

// 2. SUBMIT A SINGLE DATA ROW
app.post('/api/submission-rows', async (req, res) => {
    const { post_id, contributor_id, data } = req.body;

    const { data: row, error } = await supabase
        .from('submission_row')
        .insert([
            {
                post_id,
                contributor_id,
                data,
                parent_row_id: null,
                is_current: true,
                is_deleted: false,
            },
        ])
        .select()
        .single();

    if (error) return res.status(500).json(error);
    res.status(201).json(row);
});

// 3. BULK SUBMIT ROWS (CSV/JSON UPLOAD)
app.post('/api/submission-rows/bulk', async (req, res) => {
    const { post_id, contributor_id, rows_data } = req.body;

    if (!rows_data || !Array.isArray(rows_data) || rows_data.length === 0) {
        return res.status(400).json({ error: 'rows_data must be a non-empty array' });
    }

    const records = rows_data.map((row: any) => ({
        post_id,
        contributor_id,
        data: row,
        parent_row_id: null,
        is_current: true,
        is_deleted: false,
    }));

    const { data, error } = await supabase
        .from('submission_row')
        .insert(records)
        .select();

    if (error) return res.status(500).json(error);
    res.status(201).json({ message: 'Rows uploaded successfully', count: data.length });
});

// 4. REVISE/EDIT A ROW (VERSIONING)
app.put('/api/submission-rows/revise', async (req, res) => {
    const { old_row_id, post_id, editor_id, updated_data } = req.body;

    // 1. Mark old row as inactive
    await supabase
        .from('submission_row')
        .update({ is_current: false })
        .eq('id', old_row_id);

    // 2. Insert revised row pointing to parent
    const { data: newRow, error } = await supabase
        .from('submission_row')
        .insert([
            {
                post_id,
                contributor_id: editor_id,
                data: updated_data,
                parent_row_id: old_row_id,
                is_current: true,
                is_deleted: false,
            },
        ])
        .select()
        .single();

    if (error) return res.status(500).json(error);
    res.json(newRow);
});

// 5. GET ACTIVE ROW COUNT FOR PROGRESS
app.get('/api/submission-rows/count', async (req, res) => {
    const postId = req.query.post_id as string;
    if (!postId) return res.status(400).json({ error: 'Missing post_id query parameter' });

    const { count, error } = await supabase
        .from('submission_row')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('is_current', true)
        .eq('is_deleted', false);

    if (error) return res.status(500).json(error);
    res.json({ count: count || 0 });
});

// 6. GET ROW REVISION HISTORY
app.get('/api/submission-rows/history/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('submission_row')
        .select('*')
        .or(`id.eq.${req.params.id},parent_row_id.eq.${req.params.id}`)
        .order('created_at', { ascending: true });

    if (error) return res.status(500).json(error);
    res.json(data);
});

// 7. SOFT DELETE A ROW
app.delete('/api/submission-rows/:id', async (req, res) => {
    const { error } = await supabase
        .from('submission_row')
        .update({ is_deleted: true, is_current: false })
        .eq('id', req.params.id);

    if (error) return res.status(500).json(error);
    res.json({ message: 'Row soft-deleted successfully' });
});

// 1. TOGGLE UPVOTE
app.post('/api/upvotes/toggle', async (req, res) => {
    const { post_id, user_id } = req.body;
    if (!post_id || !user_id) {
        return res.status(400).json({ error: 'Missing post_id or user_id in request body' });
    }

    // Check if user already upvoted
    const { data: existing } = await supabase
        .from('upvote')
        .select('post_id')
        .eq('post_id', post_id)
        .eq('user_id', user_id)
        .maybeSingle();

    if (existing) {
        // Already upvoted -> REMOVE UPVOTE
        const { error } = await supabase
            .from('upvote')
            .delete()
            .eq('post_id', post_id)
            .eq('user_id', user_id);

        if (error) return res.status(500).json(error);
        return res.json({ hasUpvoted: false, message: 'Upvote removed' });
    } else {
        // Not upvoted yet -> ADD UPVOTE
        const { error } = await supabase
            .from('upvote')
            .insert([{ post_id, user_id }]);

        if (error) return res.status(500).json(error);
        return res.json({ hasUpvoted: true, message: 'Upvote added' });
    }
});

// 2. CHECK IF USER HAS UPVOTED
app.get('/api/upvotes/check', async (req, res) => {
    const post_id = req.query.post_id as string;
    const user_id = req.query.user_id as string;

    if (!post_id || !user_id) {
        return res.status(400).json({ error: 'Missing post_id or user_id query parameters' });
    }

    const { data, error } = await supabase
        .from('upvote')
        .select('post_id')
        .eq('post_id', post_id)
        .eq('user_id', user_id)
        .maybeSingle();

    if (error) return res.status(500).json(error);
    res.json({ hasUpvoted: !!data });
});

// 3. GET POST UPVOTE COUNT
app.get('/api/upvotes/count', async (req, res) => {
    const post_id = req.query.post_id as string;
    if (!post_id) {
        return res.status(400).json({ error: 'Missing post_id query parameter' });
    }

    const { count, error } = await supabase
        .from('upvote')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post_id);

    if (error) return res.status(500).json(error);
    res.json({ count: count || 0 });
});

// 4. GET ALL POST IDs UPVOTED BY USER
app.get('/api/upvotes/user-posts', async (req, res) => {
    const user_id = req.query.user_id as string;
    if (!user_id) {
        return res.status(400).json({ error: 'Missing user_id query parameter' });
    }

    const { data, error } = await supabase
        .from('upvote')
        .select('post_id')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json(error);
    const postIds = data ? data.map((item: any) => item.post_id) : [];
    res.json(postIds);
});

// 1. GET ALL INTERESTS FOR A USER
app.get('/api/user-interests', async (req, res) => {
    const userId = req.query.user_id as string;
    if (!userId) return res.status(400).json({ error: 'Missing user_id query parameter' });

    const { data, error } = await supabase
        .from('user_interest')
        .select(`
      id,
      user_id,
      tag_id,
      created_at,
      tag:tag!user_interest_tag_id_fkey (
        id,
        slug,
        name,
        created_at
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json(error);
    const tags = data?.map((item: any) => item.tag).filter(Boolean) || [];
    res.json(tags);
});

// 2. CHECK IF USER IS INTERESTED IN A TAG
app.get('/api/user-interests/check', async (req, res) => {
    const userId = req.query.user_id as string;
    const tagId = req.query.tag_id as string;

    if (!userId || !tagId) {
        return res.status(400).json({ error: 'Missing user_id or tag_id query parameters' });
    }

    const { data, error } = await supabase
        .from('user_interest')
        .select('id')
        .eq('user_id', userId)
        .eq('tag_id', tagId)
        .maybeSingle();

    if (error) return res.status(500).json(error);
    res.json({ isFollowing: !!data });
});

// 3. TOGGLE USER INTEREST (FOLLOW / UNFOLLOW)
app.post('/api/user-interests/toggle', async (req, res) => {
    const { user_id, tag_id } = req.body;
    if (!user_id || !tag_id) {
        return res.status(400).json({ error: 'Missing user_id or tag_id in request body' });
    }

    const { data: existing } = await supabase
        .from('user_interest')
        .select('id')
        .eq('user_id', user_id)
        .eq('tag_id', tag_id)
        .maybeSingle();

    if (existing) {
        // Unfollow
        const { error } = await supabase
            .from('user_interest')
            .delete()
            .eq('user_id', user_id)
            .eq('tag_id', tag_id);

        if (error) return res.status(500).json(error);
        return res.json({ isFollowing: false, message: 'Unfollowed tag' });
    } else {
        // Follow
        const { error } = await supabase
            .from('user_interest')
            .insert([{ user_id, tag_id }]);

        if (error) return res.status(500).json(error);
        return res.json({ isFollowing: true, message: 'Followed tag' });
    }
});

// 4. ADD SINGLE INTEREST
app.post('/api/user-interests/add', async (req, res) => {
    const { user_id, tag_id } = req.body;

    const { data, error } = await supabase
        .from('user_interest')
        .insert([{ user_id, tag_id }])
        .select()
        .single();

    if (error) return res.status(500).json(error);
    res.status(201).json(data);
});

// 5. REMOVE SINGLE INTEREST
app.delete('/api/user-interests/remove', async (req, res) => {
    const userId = req.query.user_id as string;
    const tagId = req.query.tag_id as string;

    if (!userId || !tagId) {
        return res.status(400).json({ error: 'Missing user_id or tag_id query parameters' });
    }

    const { error } = await supabase
        .from('user_interest')
        .delete()
        .eq('user_id', userId)
        .eq('tag_id', tagId);

    if (error) return res.status(500).json(error);
    res.json({ message: 'Interest removed successfully' });
});

// 6. BULK SET INTERESTS (ONBOARDING)
app.post('/api/user-interests/bulk', async (req, res) => {
    const { user_id, tag_ids } = req.body;
    if (!tag_ids || !Array.isArray(tag_ids) || tag_ids.length === 0) {
        return res.status(400).json({ error: 'tag_ids must be a non-empty array' });
    }

    const records = tag_ids.map((tag_id: string) => ({
        user_id,
        tag_id,
    }));

    const { data, error } = await supabase
        .from('user_interest')
        .insert(records)
        .select();

    if (error) return res.status(500).json(error);
    res.status(201).json({ message: 'Bulk interests saved successfully', count: data.length });
});

// 7. GET USERS INTERESTED IN A TAG
app.get('/api/user-interests/users-by-tag', async (req, res) => {
    const tagId = req.query.tag_id as string;
    if (!tagId) return res.status(400).json({ error: 'Missing tag_id query parameter' });

    const { data, error } = await supabase
        .from('user_interest')
        .select('user_id')
        .eq('tag_id', tagId);

    if (error) return res.status(500).json(error);
    const userIds = data ? data.map((item: any) => item.user_id) : [];
    res.json(userIds);
});

// 1. SIGN UP (AUTH + USER TABLE)
app.post('/api/users/signup', async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ error: 'Missing email, password, or username' });
    }

    // 1. Auth signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) return res.status(400).json(authError);
    if (!authData.user) return res.status(400).json({ error: 'User registration failed' });

    // 2. Insert into public "user" table
    const { data: profileUser, error: profileError } = await supabase
        .from('user')
        .insert([
            {
                id: authData.user.id,
                username: username.trim(),
                email: email.trim().toLowerCase(),
            },
        ])
        .select()
        .single();

    if (profileError) return res.status(500).json(profileError);
    res.status(201).json({ authUser: authData.user, user: profileUser });
});

// 2. SIGN IN
app.post('/api/users/signin', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return res.status(401).json(error);
    res.json(data);
});

// 3. SIGN OUT
app.post('/api/users/signout', async (_req, res) => {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(500).json(error);
    res.json({ message: 'Signed out successfully' });
});

// 4. CHECK USERNAME AVAILABILITY
app.get('/api/users/check-username', async (req, res) => {
    const username = (req.query.username as string || '').trim();
    if (!username) return res.status(400).json({ error: 'Missing username query parameter' });

    const { data } = await supabase
        .from('user')
        .select('id')
        .eq('username', username)
        .maybeSingle();

    res.json({ available: !data });
});

// 5. GET USER BY USERNAME
app.get('/api/users/username/:username', async (req, res) => {
    const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('username', req.params.username.trim())
        .single();

    if (error) return res.status(404).json({ error: 'User not found', details: error.message });
    res.json(data);
});

// 6. GET USER BY ID
app.get('/api/users/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(404).json({ error: 'User not found', details: error.message });
    res.json(data);
});
// 5. Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 SWAGGER IS LIVE AT: http://localhost:${PORT}/api-docs\n`);
});