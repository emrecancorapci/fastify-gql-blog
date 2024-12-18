import { eq } from "drizzle-orm";
import type { IResolverObject } from "mercurius";

import { comments, likes, posts, users } from "../../config/db/schema.js";

export const userQueries: IResolverObject<{ id: string | number }> = {
  Query: {
    users: async (_, __, ctx) => {
      return ctx.database.select().from(users);
    },
    user: async (_, { id, email, username }, ctx) => {
      if (email) {
        return ctx.database.select().from(users).where(eq(users.email, email));
      }
      if (username) {
        return ctx.database
          .select()
          .from(users)
          .where(eq(users.username, username));
      }
      if (id) {
        return ctx.database.select().from(users).where(eq(users.id, id));
      }

      console.error("No input provided for user query");

      return undefined;
    },
  },
};

export const userResolvers: IResolverObject<{ id: string | number }> = {
  User: {
    posts: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(posts)
        .where(eq(posts.author_id, String(id))),
    comments: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(comments)
        .where(eq(comments.author_id, String(id))),
    likes: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(likes)
        .innerJoin(posts, eq(likes.post_id, posts.id))
        .where(eq(likes.user_id, String(id))),
  },
};
