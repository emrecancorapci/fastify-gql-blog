import { eq } from "drizzle-orm";
import type { IResolvers } from "mercurius";

import { postQueries, postResolvers } from "@/modules/post/post.resolvers.js";
import { userQueries, userResolvers } from "@/modules/user/user.resolvers.js";
import {
  categories,
  posts,
  postTags,
  tags,
  users,
} from "@/config/db/schema.js";
import { DateScalar } from "./date.js";
import {
  createUser,
  deleteUser,
  login,
  register,
  updateUser,
} from "@/modules/user/user.methods.js";

export const resolvers: IResolvers = {
  DateTime: DateScalar,
  Query: {
    ...postQueries.Query,
    ...userQueries.Query,
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
    categories: async (_, __, ctx) => {
      return await ctx.database.select().from(categories);
    },
    category: async (_, { id, slug }, ctx) => {
      if (slug) {
        return (
          await ctx.database
          .select()
          .from(categories)
            .where(eq(categories.slug, slug))
        )[0];
      }
      if (id) {
        return (
          await ctx.database
          .select()
          .from(categories)
            .where(eq(categories.id, id))
        )[0];
      }

      console.error("No input provided for category query");

      return undefined;
    },
  },
  ...postResolvers,
  User: userResolvers.User,
  Comment: {
    author: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(users)
        .where(eq(users.id, String(id))),
    post: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(posts)
        .where(eq(posts.id, String(id))),
  },
  Category: {
    posts: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(posts)
        .where(eq(posts.category_id, Number(id))),
  },
  Tag: {
    posts: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(posts)
        .innerJoin(postTags, eq(postTags.post_id, posts.id))
        .where(eq(postTags.tag_id, Number(id))),
  },
  Mutation: {
    createUser: async (_, data, ctx) => await createUser(ctx, data),
    updateUser: async (_, data, ctx) => await updateUser(ctx, data),
    deleteUser: async (_, data, ctx) => await deleteUser(ctx, data),
    login: async (_, data, ctx) => await login(ctx, data),
    register: async (_, data, ctx) => await register(ctx, data),
    createCategory: async (_, { name, slug }, ctx) => {
      return (
        await ctx.database.insert(categories).values({ name, slug }).returning()
      )[0];
    },
    createTag: async (_, { name, slug }, ctx) => {
      return (
        await ctx.database.insert(tags).values({ name, slug }).returning()
      )[0];
    },
  },
};
