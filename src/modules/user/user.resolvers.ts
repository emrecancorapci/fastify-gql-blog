import { and, eq } from "drizzle-orm";
import type { IResolverObject } from "mercurius";

import {
  categories,
  commentLikes,
  comments,
  categoryEditors,
  postLikes,
  posts,
} from "@/config/db/schema.js";
import { getAllPosts } from "@/modules/post/post.methods.js";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  login,
  register,
  updateUser,
} from "./user.methods.js";
import {
  defaultPostColumns,
  defaultPostSelect,
} from "../post/post.validations.js";

export const userQueries: IResolverObject = {
  Query: {
    users: async (_, __, ctx) => await getAllUsers(ctx),
    user: async (_, { id, email, username }, ctx) => {
      if (email) {
        return await getUserByEmail(ctx, email);
      }
      if (username) {
        return await getUserByUsername(ctx, username);
      }
      if (id) {
        return await getUserById(ctx, id);
      }

      throw new Error("No input provided for user query");
    },
  },
};

export const userResolvers: IResolverObject = {
  User: {
    posts: async ({ id }, _, ctx) =>
      await getAllPosts(ctx, {
        columns: defaultPostColumns,
        where: and(eq(posts.author_id, String(id))),
      }),
    comments: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(comments)
        .where(
          and(eq(comments.author_id, String(id)), eq(comments.deleted, false)),
        ),
    post_likes: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(postLikes)
        .innerJoin(posts, eq(postLikes.post_id, posts.id))
        .where(eq(postLikes.user_id, String(id))),
    comment_likes: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(commentLikes)
        .innerJoin(comments, eq(commentLikes.comment_id, comments.id))
        .where(eq(commentLikes.user_id, String(id))),
    editor_on: async ({ id }, _, ctx) =>
      await ctx.database
        .select()
        .from(categoryEditors)
        .innerJoin(categories, eq(categoryEditors.category_id, categories.id))
        .where(eq(categoryEditors.editor_id, String(id))),
  },
  Mutations: {
    createUser: async (_, data, ctx) => await createUser(ctx, data),
    updateUser: async (_, data, ctx) => await updateUser(ctx, data),
    deleteUser: async (_, data, ctx) => await deleteUser(ctx, data),
    login: async (_, data, ctx) => await login(ctx, data),
    register: async (_, data, ctx) => await register(ctx, data),
  },
};
