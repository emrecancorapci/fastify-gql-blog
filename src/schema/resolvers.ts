import { eq } from "drizzle-orm";
import type { IResolvers } from "mercurius";

import { postQueries, postResolvers } from "./post/resolver.js";
import { userQueries, userResolvers } from "./user/resolver.js";
import {
  categories,
  comments,
  likes,
  posts,
  postsToTags,
  tags,
  users,
} from "../config/db/schema.js";

export const resolvers: IResolvers<{ id: string | number }> = {
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
      return ctx.database.select().from(categories);
    },
    category: async (_, { id, slug }, ctx) => {
      if (slug) {
        return ctx.database
          .select()
          .from(categories)
          .where(eq(categories.slug, slug));
      }
      if (id) {
        return ctx.database
          .select()
          .from(categories)
          .where(eq(categories.id, id));
      }

      console.error("No input provided for category query");

      return undefined;
    },
  },
  ...postResolvers,
  ...userResolvers,
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
        .innerJoin(postsToTags, eq(postsToTags.post_id, posts.id))
        .where(eq(postsToTags.tag_id, Number(id))),
  },
};
