import { eq } from "drizzle-orm";
import type { IResolvers } from "mercurius";

import { postQueries, postResolvers } from "@/modules/post/post.resolvers.js";
import { userQueries, userResolvers } from "@/modules/user/user.resolvers.js";
import { categoryEditors, posts, postTags, tags, users } from "@/config/db/schema.js";
import { DateScalar } from "./date.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
} from "@/modules/post/post.methods.js";
import {
  createUser,
  deleteUser,
  getUserById,
  login,
  register,
  updateUser,
} from "@/modules/user/user.methods.js";
import { categoryQueries } from "@/modules/category/category.resolvers.js";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/modules/category/category.methods.js";

export const resolvers: IResolvers = {
  DateTime: DateScalar,
  Query: {
    ...postQueries.Query,
    ...userQueries.Query,
    ...categoryQueries.Query,
    tags: async (_, __, ctx) => {
      return ctx.database.select().from(tags);
    },
    tag: async (_, { id, slug }, ctx) => {
      if (slug) {
        return ctx.database.select().from(tags).where(eq(tags.slug, slug));
      }
      if (id) {
        return ctx.database.select().from(tags).where(eq(tags.id, id));
      }

      console.error("No input provided for tag query");

      return undefined;
    },
  },
  Post: postResolvers.Post,
  User: userResolvers.User,
  Comment: {
    author: async ({ author_id }, _, ctx) => await getUserById(ctx, author_id),
    post: async ({ post_id }, _, ctx) => await getPostById(ctx, post_id),
  },
  Category: {
    posts: async ({ id: category_id }, _, ctx) =>
      await getAllPosts(ctx, {
        where: eq(posts.category_id, Number(category_id)),
      }),
    editors: async ({ id: category_id }, _, ctx) =>
      await ctx.database
        .select()
        .from(users)
        .innerJoin(categoryEditors, eq(categoryEditors.editor_id, users.id))
        .where(eq(categoryEditors.category_id, Number(category_id))),
  },
  Tag: {
    posts: async ({ id: tag_id }, _, ctx) =>
      await ctx.database
        .select()
        .from(posts)
        .innerJoin(postTags, eq(postTags.post_id, posts.id))
        .where(eq(postTags.tag_id, Number(tag_id))),
  },
  Mutation: {
    createPost: async (_, data, ctx) => await createPost(ctx, data),
    updatePost: async (_, data, ctx) => await updatePost(ctx, data),
    deletePost: async (_, data, ctx) => await deletePost(ctx, data),
    createUser: async (_, data, ctx) => await createUser(ctx, data),
    updateUser: async (_, data, ctx) => await updateUser(ctx, data),
    deleteUser: async (_, data, ctx) => await deleteUser(ctx, data),
    login: async (_, data, ctx) => await login(ctx, data),
    register: async (_, data, ctx) => await register(ctx, data),
    createCategory: async (_, { name, slug }, ctx) => await createCategory(ctx, { name, slug }),
    updateCategory: async (_, { id, name, slug }, ctx) =>
      await updateCategory(ctx, { id, name, slug }),
    deleteCategory: async (_, { id }, ctx) => await deleteCategory(ctx, id),
    createTag: async (_, { name, slug }, ctx) => {
      return (await ctx.database.insert(tags).values({ name, slug }).returning())[0];
    },
  },
};
