import { and, eq } from "drizzle-orm";
import type { IResolverObject, IResolvers } from "mercurius";

import {
  categories,
  comments,
  postLikes,
  postTags,
  tags,
  users,
} from "@/config/db/schema.js";
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
} from "@/modules/post/post.methods.js";
import { getUserById } from "../user/user.methods.js";

export const postQueries: IResolverObject = {
  Query: {
    posts: async (_, __, ctx) => await getAllPosts(ctx),
    post: async (_, { id, slug }, ctx) => {
      if (slug && typeof slug === "string") {
        return await getPostBySlug(ctx, slug);
      }
      if (id && typeof id === "string") {
        return await getPostById(ctx, id);
      }

      console.error("No input provided for post query");

      return undefined;
    },
  },
};

export const postResolvers: IResolvers = {
  Post: {
    author: async ({ author_id }, _, ctx) => await getUserById(ctx, author_id),
    category: async ({ category_id }, _, ctx) =>
      await ctx.database
        .select()
        .from(categories)
        .where(eq(categories.id, Number(category_id))),
    tags: async ({ id: post_id }, _, ctx) =>
      await ctx.database
        .select()
        .from(tags)
        .innerJoin(postTags, eq(postTags.tag_id, tags.id))
        .where(eq(postTags.post_id, String(post_id))),
    post_likes: async ({ id: post_id }, _, ctx) =>
      await ctx.database
        .select()
        .from(postLikes)
        .innerJoin(users, eq(postLikes.user_id, users.id))
        .where(eq(postLikes.post_id, String(post_id))),
    comments: async ({ id: post_id }, _, ctx) =>
      await ctx.database
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.post_id, String(post_id)),
            eq(comments.deleted, false),
          ),
        ),
  },
};
