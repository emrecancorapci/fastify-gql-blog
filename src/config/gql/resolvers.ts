import { eq } from "drizzle-orm";
import type { IResolvers, MercuriusContext } from "mercurius";

import {
  categories,
  comments,
  likes,
  posts,
  postsToTags,
  tags,
  users,
} from "../db/schema.js";
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
    post: async (_, { id, slug }, ctx) => {
      if (slug) {
        return ctx.database.select().from(posts).where(eq(posts.slug, slug));
      }
      if (id) {
        return ctx.database.select().from(posts).where(eq(posts.id, id));
      }

      console.error("No input provided for post query");

      return undefined;
    },
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
  Post: {
    author: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(users)
        .where(eq(users.id, String(id))),
    category: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(categories)
        .where(eq(categories.id, Number(id))),
    tags: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(tags)
        .innerJoin(postsToTags, eq(postsToTags.tag_id, tags.id))
        .where(eq(postsToTags.post_id, String(id))),
    likes: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(likes)
        .innerJoin(users, eq(likes.user_id, users.id))
        .where(eq(likes.post_id, String(id))),
    comments: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(comments)
        .where(eq(comments.post_id, String(id))),
  },
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
