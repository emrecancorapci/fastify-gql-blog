import { and, eq } from "drizzle-orm";
import type { IResolverObject } from "mercurius";

import {
  categories,
  comments,
  postLikes,
  postTags,
  tags,
  users,
} from "@/config/db/schema.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  updatePost,
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

export const postResolvers: IResolverObject = {
  Post: {
    author: async ({ id }, _, ctx) => await getUserById(ctx, id),
    category: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(categories)
        .where(eq(categories.id, Number(id))),
    tags: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(tags)
        .innerJoin(postTags, eq(postTags.tag_id, tags.id))
        .where(eq(postTags.post_id, String(id))),
    postLikes: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(postLikes)
        .innerJoin(users, eq(postLikes.user_id, users.id))
        .where(eq(postLikes.post_id, String(id))),
    comments: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(comments)
        .where(
          and(eq(comments.post_id, String(id)), eq(comments.deleted, false)),
        ),
  },
  Mutation: {
    createPost: async (_, data, ctx) => await createPost(ctx, data),
    updatePost: async (_, data, ctx) => await updatePost(ctx, data),
    deletePost: async (_, { id }, ctx) => await deletePost(ctx, id),
  },
};
