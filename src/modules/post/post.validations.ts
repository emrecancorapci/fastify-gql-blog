import { posts } from "@/config/db/schema.js";
import { z } from "zod";

const id = z.string().uuid();
const title = z.string().min(4).max(255);
const img_url = z.string().url();
const slug = z.string().min(4).max(255);
const content = z.string().min(100);
const author_id = z.string().uuid();
const category_id = z.number().int().positive();
const tags = z.array(z.number().int().positive());
const published = z.boolean().default(true);
const deleted = z.boolean().default(false);

export const CreatePostSchema = z.object({
  title,
  img_url: img_url.optional(),
  content,
  author_id,
  category_id,
  tags: tags.optional(),
  published: published.optional(),
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
  deleted: deleted.optional(),
});

export const defaultPostSelect = {
  id: posts.id,
  title: posts.title,
  img_url: posts.img_url,
  slug: posts.slug,
  content: posts.content,
  author_id: posts.author_id,
  category_id: posts.category_id,
  created_at: posts.created_at,
  updated_at: posts.updated_at,
  published: posts.published,
  deleted: posts.deleted,
};

export const defaultPostColumns = {
  id: true,
  title: true,
  img_url: true,
  slug: true,
  content: true,
  author_id: true,
  category_id: true,
  created_at: true,
  updated_at: true,
};