import { and, eq, or, type SQL } from "drizzle-orm";
import slugify from "slug";
import type { MercuriusContext } from "mercurius";

import { posts, postsToTags } from "@/config/db/schema.js";
import { CreatePostSchema, UpdatePostSchema } from "./post.validations.js";
import type { SelectedFieldsFlat } from "drizzle-orm/pg-core";

export async function getAllPosts({ user, database }: MercuriusContext) {
  if (user && user.role === "admin") {
    return await database.select().from(posts);
  }

  return await database.select().from(posts).where(postIsVisible);
}

export async function getAllPostsBySQL(
  { user, database }: MercuriusContext,
  { select, where }: { select?: SelectedFieldsFlat; where?: SQL },
) {
  if (user && user.role === "admin") {
    if (user.role === "admin") {
      return await database.select().from(posts).where(where);
    }

    if (select) {
      return await database
        .select(select)
        .from(posts)
        .where(and(postIsVisibleByAuthor(user.id), where));
    }
  }

  if (select) {
    return await database
      .select(select)
      .from(posts)
      .where(and(postIsVisible, where));
  }

  return await database.select().from(posts).where(postIsVisible);
}

export async function getPostById(
  { user, database }: MercuriusContext,
  id: string,
) {
  if (user) {
    if (user.role === "admin") {
      return await database.select().from(posts).where(eq(posts.id, id));
    }

    return await database
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), postIsVisibleByAuthor(user.id)));
  }

  return await database
    .select()
    .from(posts)
    .where(and(eq(posts.id, id), postIsVisible));
}

export async function getPostBySlug(
  { user, database }: MercuriusContext,
  slug: string,
) {
  if (user) {
    if (user.role === "admin") {
      return await database.select().from(posts).where(eq(posts.slug, slug));
    }

    return await database
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.slug, slug),
          or(postIsVisible, eq(posts.author_id, user.id)),
        ),
      );
  }

  return await database
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), postIsVisible));
}

export async function createPost(
  { user, database }: MercuriusContext,
  data: unknown,
) {
  if (!user) {
    throw new Error("You must be logged in to create a post");
  }

  const verifiedPost = await CreatePostSchema.parseAsync(data);
  const slug = slugify(verifiedPost.title, { locale: "tr" });

  const { tags, ...post } = Object.assign(verifiedPost, {
    slug,
    author_id: user.id,
  });

  const [response] = await database.insert(posts).values(post).returning();

  if (tags && tags.length > 0) {
    await database
      .insert(postsToTags)
      .values(tags.map((tag_id: number) => ({ post_id: response.id, tag_id })));
  }

  Object.assign(response, {
    created_at: response.created_at.toISOString(),
    updated_at: response.updated_at.toISOString(),
  });

  return response;
}

export async function updatePost(
  { user, database }: MercuriusContext,
  data: unknown,
) {
  if (!user) {
    throw new Error("You must be logged in to update a post");
  }

  const {
    id,
    title,
    img_url,
    content,
    category_id,
    author_id,
    tags,
    published,
    deleted,
  } = await UpdatePostSchema.parseAsync(data);

  if (author_id !== user.id && user.role !== "admin") {
    throw new Error("You are not authorized to update this post");
  }

  let slug: string | undefined;
  let response: Post;

  if (title) {
    slug = slugify(title, { locale: "tr" });
  }

  if (user.role === "admin") {
    [response] = await database
      .update(posts)
      .set({
        title,
        img_url,
        slug,
        content,
        author_id,
        category_id,
        published,
        deleted,
      })
      .where(eq(posts.id, id))
      .returning();
  } else {
    [response] = await database
      .update(posts)
      .set({
        title,
        img_url,
        slug,
        content,
        category_id,
        published,
        deleted,
      })
      .where(and(eq(posts.id, id), eq(posts.author_id, user.id)))
      .returning();
  }

  Object.assign(response, {
    created_at: response.created_at.toISOString(),
    updated_at: response.updated_at.toISOString(),
  });

  if (!tags || tags.length === 0) return response;

  // Update tags
  await database.delete(postsToTags).where(eq(postsToTags.post_id, id));

  await database
    .insert(postsToTags)
    .values(tags.map((tag_id: number) => ({ post_id: response.id, tag_id })))
    .returning({ tag_id: postsToTags.tag_id });

  return response;
}

export async function deletePost(
  { user, database }: MercuriusContext,
  id: string,
) {
  if (!user) {
    throw new Error("You must be logged in to delete a post");
  }

  const [{ author_id }] = await database
    .select({ author_id: posts.author_id })
    .from(posts)
    .where(eq(posts.id, id));

  if (author_id !== user.id && user.role !== "admin") {
    throw new Error("You are not authorized to delete this post");
  }

  const response = await database
    .delete(posts)
    .where(eq(posts.id, id))
    .returning();

  await database.delete(postsToTags).where(eq(postsToTags.post_id, id));

  return response;
}

const postIsVisibleByAuthor = (id: string) =>
  or(eq(posts.author_id, id), postIsVisible);

const postIsVisible = and(eq(posts.published, true), eq(posts.deleted, false));

interface Post {
  id: string;
  title: string;
  img_url: string | null;
  slug: string;
  content: string;
  author_id: string | null;
  category_id: number | null;
  created_at: Date;
  updated_at: Date;
  published: boolean;
  deleted: boolean;
}
