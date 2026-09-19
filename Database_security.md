# 🛡️ DataShare - Database Row Level Security (RLS) Documentation

This document outlines the Row Level Security (RLS) policies implemented across all 11 PostgreSQL tables in Supabase.

---

## 📋 Security Architecture Summary

- **Public Read Access:** Unauthenticated (anonymous) visitors can read public data (`community`, `post`, `comment`, `submission_row`, `tag`, `upvote`).
- **Authenticated Write Access:** Only verified logged-in users (`authenticated` role) can insert data.
- **Strict Ownership (Author-Only):** Users can only modify or delete rows where their `auth.uid()` matches the row's owner column.

---

## 🗄️ Table-by-Table Policy Definitions

### 1. `user` Table
Stores public profiles and account metadata.

| Policy Name | Command | Applied To | Logic / Definition |
| :--- | :--- | :--- | :--- |
| **Enable read access for all users** | `SELECT` | `public` | `USING (true)` |
| **Allow users to insert on signup** | `INSERT` | `public` | `WITH CHECK (auth.uid() = id)` |
| **Users can update their own profile** | `UPDATE` | `authenticated` | `USING (auth.uid() = id)` |

---

### 2. `community` Table
Stores communities (subreddits/hubs).

| Policy Name | Command | Applied To | Logic / Definition |
| :--- | :--- | :--- | :--- |
| **Enable read access for all users** | `SELECT` | `public` | `USING (true)` |
| **Enable insert for authenticated users only** | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = created_by)` |
| **Enable update community for authenticated users only** | `UPDATE` | `authenticated` | `USING (auth.uid() = created_by)` |

---

### 3. `community_moderator` Table
Links moderators to specific communities.

| Policy Name | Command | Applied To | Logic / Definition |
| :--- | :--- | :--- | :--- |
| **Moderators viewable by all** | `SELECT` | `public` | `USING (true)` |
| **Community owners can manage moderators** | `ALL` | `authenticated` | `USING (EXISTS (SELECT 1 FROM community WHERE id = community_moderator.community_id AND created_by = auth.uid()))` |

---

### 4. `community_tag` Table
Links global tags to communities.

| Policy Name | Command | Applied To | Logic / Definition |
| :--- | :--- | :--- | :--- |
| **Community tags viewable by all** | `SELECT` | `public` | `USING (true)` |
| **Community creators can link tags** | `INSERT` | `authenticated` | `WITH CHECK (EXISTS (SELECT 1 FROM community WHERE id = community_tag.community_id AND created_by = auth.uid()))` |

---

### 5. `post` Table
Dataset collection and discussion posts.

| Policy Name | Command | Applied To | Logic / Definition |
| :--- | :--- | :--- | :--- |
| **Enable read access for all users** | `SELECT` | `public` | `USING (true)` |
| **Enable insert for authenticated users only** | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = author_id)` |
| **Authors can update their own posts** | `UPDATE` | `authenticated` | `USING (auth.uid() = author_id)` |
| **Enable delete for users based on user_id** | `DELETE` | `public` | `USING (auth.uid() = author_id)` |

---

### 6. `post_tag` Table
Many-to-many relationship between dataset posts and tags.

| Policy Name | Command | Applied To | Logic / Definition |
| :--- | :--- | :--- | :--- |
| **Post tags viewable by all** | `SELECT` | `public` | `USING (true)` |
| **Post authors can attach tags** | `INSERT` | `authenticated` | `WITH CHECK (EXISTS (SELECT 1 FROM post WHERE id = post_tag.post_id AND author_id = auth.uid()))` |

---

### 7. `comment` Table
Threaded comments and discussion replies under posts.

| Policy Name | Command | Applied To | Logic / Definition |
| :--- | :--- | :--- | :--- |
| **Enable read access for all users** | `SELECT` | `public` | `USING (true)` |
| **Enable comment insert for authenticated users only** | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = user_id)` |
| **Enable delete for users based on user_id** | `DELETE` | `public` | `USING (auth.uid() = user_id)` |

---

### 8. `submission_row` Table
Crowdsourced dataset entries with Git-style versioning.

| Policy Name | Command | Applied To | Logic / Definition |
| :--- | :--- | :--- | :--- |
| **Dataset rows viewable by all** | `SELECT` | `public` | `USING (true)` |
| **Authenticated users can submit rows** | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = contributor_id)` |
| **Contributors can update their own rows** | `UPDATE` | `authenticated` | `USING (auth.uid() = contributor_id)` |
| **Contributors can delete their own rows** | `DELETE` | `authenticated` | `USING (auth.uid() = contributor_id)` |

---

### 9. `upvote` Table
Upvotes and downvotes with double-vote prevention.

| Policy Name | Command | Applied To | Logic / Definition |
| :--- | :--- | :--- | :--- |
| **Upvotes viewable by all** | `SELECT` | `public` | `USING (true)` |
| **Users can upvote** | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = user_id)` |
| **Users can remove their upvote** | `DELETE` | `authenticated` | `USING (auth.uid() = user_id)` |

---

### 10. `tag` Table
Platform-wide global topic tags.

| Policy Name | Command | Applied To | Logic / Definition |
| :--- | :--- | :--- | :--- |
| **Tags viewable by all** | `SELECT` | `public` | `USING (true)` |
| **Authenticated users can create tags** | `INSERT` | `authenticated` | `WITH CHECK (true)` |

---

### 11. `user_interest` Table
Tags followed by users for feed personalization.

| Policy Name | Command | Applied To | Logic / Definition |
| :--- | :--- | :--- | :--- |
| **User interests viewable by all** | `SELECT` | `public` | `USING (true)` |
| **Users can follow tags** | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = user_id)` |
| **Users can unfollow tags** | `DELETE` | `authenticated` | `USING (auth.uid() = user_id)` |

---

## 🚀 How to Apply via SQL (Migration Script)

All of these policies can be recreated at any time by executing the master migration file in the Supabase SQL Editor.
