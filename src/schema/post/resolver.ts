import { and, eq } from "drizzle-orm";
import type { IResolverObject } from "mercurius";
import slugify from "slug";

import {
  categories,
  comments,
  likes,
  posts,
  postsToTags,
  tags,
  users,
} from "@/config/db/schema.js";
import { CreatePostSchema, UpdatePostSchema } from "./schema.js";

export const postQueries: IResolverObject<{ id: string | number }> = {
  Query: {
    posts: async (_, __, ctx) =>
      await ctx.database.select().from(posts).where(eq(posts.deleted, false)),
    post: async (_, { id, slug }, ctx) => {
      if (slug) {
        return await ctx.database
          .select()
          .from(posts)
          .where(and(eq(posts.slug, slug), eq(posts.deleted, false)));
      }
      if (id) {
        return await ctx.database
          .select()
          .from(posts)
          .where(and(eq(posts.id, id), eq(posts.deleted, false)));
      }

      console.error("No input provided for post query");

      return undefined;
    },
  },
};

export const postResolvers: IResolverObject<{ id: string | number }> = {
  Post: {
    author: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(users)
        .where(eq(users.id, String(id))),
    category: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(categories)
        .where(eq(categories.id, Number(id))),
    tags: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(tags)
        .innerJoin(postsToTags, eq(postsToTags.tag_id, tags.id))
        .where(eq(postsToTags.post_id, String(id))),
    likes: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(likes)
        .innerJoin(users, eq(likes.user_id, users.id))
        .where(eq(likes.post_id, String(id))),
    comments: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(comments)
        .where(
          and(eq(comments.post_id, String(id)), eq(comments.deleted, false)),
        ),
  },
  Mutation: {
    createPost: async (_, data, ctx) => {
      const {
        title,
        img_url,
        content,
        author_id,
        category_id,
        tags,
        published,
      } = await CreatePostSchema.parseAsync(data);

      const slugifiedTitle = slugify(title, { locale: "tr" });

      const response = await ctx.database
        .insert(posts)
        .values({
          title,
          img_url,
          slug: slugifiedTitle,
          content,
          author_id,
          category_id,
          published: published ?? true,
        })
        .returning();

      if (tags && tags.length > 0) {
        ctx.database
          .insert(postsToTags)
          .values(
            tags.map((tag_id: number) => ({ post_id: response[0].id, tag_id })),
          );
      }

      return response;
    },
    updatePost: async (_, data, ctx) => {
      const {
        id,
        title,
        img_url,
        content,
        author_id,
        category_id,
        tags,
        published,
      } = await UpdatePostSchema.parseAsync(data);

      let slug: string | undefined;

      if (title) {
        slug = slugify(title, { locale: "tr" });
      }

      const response = await ctx.database
        .update(posts)
        .set({
          title,
          img_url,
          slug,
          content,
          author_id,
          category_id,
          published,
        })
        .returning();

      if (!tags || tags.length === 0) return response;

      ctx.database
        .delete(postsToTags)
        .where(eq(postsToTags.post_id, id))
        .execute();

      const tagsResponse = ctx.database
        .insert(postsToTags)
        .values(
          tags.map((tag_id: number) => ({ post_id: response[0].id, tag_id })),
        )
        .returning({ tag_id: postsToTags.tag_id });

      console.log(tagsResponse);

      return response;
    },
    deletePost: async (_, { id }, ctx) => {
      const response = ctx.database
        .delete(posts)
        .where(eq(posts.id, id))
        .returning();

      ctx.database
        .delete(postsToTags)
        .where(eq(postsToTags.post_id, id))
        .execute();

      ctx.database.delete(comments).where(eq(comments.post_id, id)).execute();

      return response;
    },
  },
};
