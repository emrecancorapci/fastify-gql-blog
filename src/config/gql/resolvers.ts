import { eq } from "drizzle-orm";
import type { IResolvers, MercuriusContext } from "mercurius";

import { categories, posts, tags, users } from "../db/schema.js";
import type database from "../db/drizzle.js";

interface Context extends MercuriusContext {
  database: typeof database;
}

// 1.05

const resolvers: IResolvers<{ id: string | number }, Context> = {
  Query: {
    posts: async (_, __, ctx) => {
      return ctx.database.select().from(posts);
    },
    post: async (_, { id }, ctx) => {
      return ctx.database.select().from(posts).where(eq(posts.id, id));
    },
    users: async (_, __, ctx) => {
      return ctx.database.select().from(users);
    },
    user: async (_, { id }, ctx) => {
      return ctx.database.select().from(users).where(eq(users.id, id));
    },
    tags: async (_, __, ctx) => {
      return ctx.database.select().from(tags);
    },
    tag: async (_, { id }, ctx) => {
      return ctx.database.select().from(tags).where(eq(tags.id, id));
    },
    categories: async (_, __, ctx) => {
      return ctx.database.select().from(categories);
    },
    category: async (_, { id }, ctx) => {
      return ctx.database
        .select()
        .from(categories)
        .where(eq(categories.id, id));
    },
  },
  User: {
    posts: async ({ id }, _, ctx) => {
      return ctx.database
        .select()
        .from(posts)
        .where(eq(posts.author_id, String(id)));
    },
  },
  Post: {
    likes: async ({ id }, _, ctx) => {
      return ctx.database
        .select()
        .from(users)
        .where(eq(users.id, String(id)));
    },
    author: async ({ id }, _, ctx) => {
      return ctx.database
        .select()
        .from(users)
        .where(eq(users.id, String(id))).limit(1);
    },
  },
};
