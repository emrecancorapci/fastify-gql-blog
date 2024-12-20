import { z } from "zod";

// Zod Schema
const id = z.string().uuid();
const title = z.string().min(4).max(255);
const img_url = z.string().url();
const slug = z.string().min(4).max(255);
const content = z.string().min(100);
const author_id = z.string().uuid();
const category_id = z.number().int().positive();
const tags = z.array(z.number().int().positive());
const published = z.boolean().default(true);

export const CreatePostSchema = z.object({
  title,
  img_url: img_url.optional(),
  content,
  author_id,
  category_id,
  tags: tags.optional(),
  published,
});

export const UpdatePostSchema = z.object({
  id,
  title: title.optional(),
  img_url: img_url.optional(),
  content: content.optional(),
  author_id: author_id.optional(),
  category_id: category_id.optional(),
  tags: tags.optional(),
  published: published.optional(),
});

// GraphQL Schema
export const postSchema = `#graphql
type Post {
  id: ID!,
  title: String!,
  img_url: String,
  slug: String!,
  content: String!,
  author: User!,
  category: Category!,
  tags: [Tag!]!,
  likes: [User!],
  comments: [Comment!],
  created_at: String!,
  updated_at: String!,
  published: Boolean!,
}`;