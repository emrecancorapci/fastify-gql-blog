import { and, eq, or, type SQL, type DBQueryConfig } from "drizzle-orm";
import slugify from "slug";
import type { MercuriusContext } from "mercurius";

import { posts, postTags } from "@/config/db/schema.js";
import {
  CreatePostSchema,
  defaultPostColumns,
  UpdatePostSchema,
} from "./post.validations.js";

export async function getAllPosts(
  { user, database }: MercuriusContext,
  options: DBQueryConfig<"many", true> = {
    columns: defaultPostColumns,
    orderBy: posts.created_at,
    limit: 10,
    offset: 0,
  },
) {
  if (!user) {
    return await database.query.posts.findMany({
      ...options,
      where: options.where
        ? and(
            // @ts-expect-error I couldn't find a way to type this
            options.where,
            postIsVisible,
          )
        : postIsVisible,
    });
  }

  switch (user.role ?? "guest") {
    case "admin":
      return await database.query.posts.findMany({
        ...options,
        columns: { ...defaultPostColumns, published: true, deleted: true },
      });
    case "user":
      return await database.query.posts.findMany({
        ...options,
        columns: { ...defaultPostColumns, published: true, deleted: true },
        where: options.where
          ? // @ts-expect-error I couldn't find a way to type this
            and(options.where, postIsVisibleByAuthor(user.id))
          : or(eq(posts.author_id, user.id), postIsVisible),
      });
  }
}

export async function getPostById(
  { user, database }: MercuriusContext,
  id: string,
) {
  if (!user)
    return await database
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), postIsVisible));

  switch (user.role) {
    case "admin":
      return await database.select().from(posts).where(eq(posts.slug, id));

    case "user": {
      return await database
        .select()
        .from(posts)
        .where(and(eq(posts.id, id), postIsVisibleByAuthor(user.id)));
    }
  }
}

export async function getPostBySlug(
  { user, database }: MercuriusContext,
  slug: string,
) {
  if (!user)
    return await database
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), postIsVisible));

  switch (user.role) {
    case "admin":
      return await database.select().from(posts).where(eq(posts.slug, slug));

    case "user": {
      return await database
        .select()
        .from(posts)
        .where(and(eq(posts.slug, slug), postIsVisibleByAuthor(user.id)));
    }
  }
}

interface CreatePostData {
  title: string;
  img_url?: string;
  content: string;
  tags?: string[];
  author_id?: string;
  category_id: string;
  published?: boolean;
}
export async function createPost(
  { user, database }: MercuriusContext,
  data: CreatePostData,
) {
  if (!user) {
    throw new Error("You must be logged in to create a post");
  }

  const verifiedPost = await CreatePostSchema.parseAsync({
    ...data,
    category_id: Number(data.category_id),
    tags: data.tags?.map(Number),
  });
  const slug = slugify(verifiedPost.title, { locale: "tr" });

  const { tags, ...post } = Object.assign(verifiedPost, {
    slug,
    author_id: user.id,
  });

  const [response] = await database.insert(posts).values(post).returning();

  if (tags && tags.length > 0) {
    await database
      .insert(postTags)
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

  const slug = (() => {
    if (!title) return;
    return slugify(title, { locale: "tr" });
  })();

  const response = await (async () => {
    if (user.role === "admin") {
      const [response] = await database
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

      return response;
    }
    const [response] = await database
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
    return response;
  })();

  Object.assign(response, {
    created_at: response.created_at.toISOString(),
    updated_at: response.updated_at.toISOString(),
  });

  if (!tags || tags.length === 0) return response;

  // Update tags
  await database.delete(postTags).where(eq(postTags.post_id, id));

  await database
    .insert(postTags)
    .values(tags.map((tag_id: number) => ({ post_id: response.id, tag_id })))
    .returning({ tag_id: postTags.tag_id });

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

  await database.delete(postTags).where(eq(postTags.post_id, id));

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
