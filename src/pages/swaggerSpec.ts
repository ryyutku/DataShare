export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "DataShare REST API",
    version: "1.0.0",
    description: "Official interactive REST API playground for DataShare crowd-sourced dataset platform."
  },
  servers: [
    {
      url: `${import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'}/rest/v1`,
      description: "Live Supabase PostgreSQL REST Server"
    }
  ],
  paths: {
    "/post": {
      get: {
        summary: "Get all dataset posts",
        tags: ["Posts"],
        parameters: [
          { name: "select", in: "query", schema: { type: "string", default: "*" }, description: "Columns to select" },
          { name: "order", in: "query", schema: { type: "string", default: "created_at.desc" }, description: "Sort order" },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } }
        ],
        responses: { 200: { description: "Array of dataset posts" } }
      },
      post: {
        summary: "Create a new dataset post",
        tags: ["Posts"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  community_id: { type: "string" },
                  author_id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  schema: { type: "object" },
                  example_row: { type: "object" },
                  goal_count: { type: "integer", default: 100 }
                },
                required: ["community_id", "author_id", "title", "schema", "example_row"]
              }
            }
          }
        },
        responses: { 201: { description: "Post created successfully" } }
      }
    },
    "/community": {
      get: {
        summary: "Get all communities",
        tags: ["Communities"],
        parameters: [
          { name: "select", in: "query", schema: { type: "string", default: "*" } }
        ],
        responses: { 200: { description: "Array of communities" } }
      },
      post: {
        summary: "Create a community",
        tags: ["Communities"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  slug: { type: "string" },
                  description: { type: "string" },
                  created_by: { type: "string" }
                },
                required: ["name", "slug", "created_by"]
              }
            }
          }
        },
        responses: { 201: { description: "Community created successfully" } }
      }
    },
    "/submission_row": {
      get: {
        summary: "Get rows for a dataset post",
        tags: ["Submission Rows"],
        parameters: [
          { name: "post_id", in: "query", schema: { type: "string" }, description: "Filter by post UUID (e.g. eq.YOUR_ID)" },
          { name: "is_current", in: "query", schema: { type: "string", default: "eq.true" } }
        ],
        responses: { 200: { description: "Dataset rows" } }
      },
      post: {
        summary: "Submit data row to a dataset",
        tags: ["Submission Rows"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  post_id: { type: "string" },
                  contributor_id: { type: "string" },
                  data: { type: "object" }
                },
                required: ["post_id", "contributor_id", "data"]
              }
            }
          }
        },
        responses: { 201: { description: "Row submitted successfully" } }
      }
    },
    "/comment": {
      get: {
        summary: "Get comments for a post",
        tags: ["Comments"],
        parameters: [
          { name: "post_id", in: "query", schema: { type: "string" } }
        ],
        responses: { 200: { description: "Array of comments" } }
      },
      post: {
        summary: "Add a comment or reply",
        tags: ["Comments"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  post_id: { type: "string" },
                  user_id: { type: "string" },
                  body: { type: "string" },
                  parent_comment_id: { type: "string", nullable: true }
                },
                required: ["post_id", "user_id", "body"]
              }
            }
          }
        },
        responses: { 201: { description: "Comment created" } }
      }
    },
    "/upvote": {
      get: {
        summary: "Get upvotes",
        tags: ["Upvotes"],
        parameters: [
          { name: "post_id", in: "query", schema: { type: "string" } }
        ],
        responses: { 200: { description: "Array of upvotes" } }
      },
      post: {
        summary: "Toggle upvote for a post",
        tags: ["Upvotes"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  post_id: { type: "string" },
                  user_id: { type: "string" }
                },
                required: ["post_id", "user_id"]
              }
            }
          }
        },
        responses: { 201: { description: "Upvoted successfully" } }
      }
    },
    "/user": {
      get: {
        summary: "Get public users",
        tags: ["Users"],
        parameters: [
          { name: "username", in: "query", schema: { type: "string" } }
        ],
        responses: { 200: { description: "User details" } }
      }
    },
    "/tag": {
      get: {
        summary: "Get all tags",
        tags: ["Tags"],
        responses: { 200: { description: "List of tags" } }
      }
    }
  }
};