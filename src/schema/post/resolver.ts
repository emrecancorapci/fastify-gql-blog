import { eq } from "drizzle-orm";
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
} from "../../config/db/schema.js";
import argon2 from "argon2";

export const postQueries: IResolverObject<{ id: string | number }> = {
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
  },
};

export const postResolvers: IResolverObject<{ id: string | number }> = {
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
  Mutation: {
    createPost: async (
      _,
      {
        title,
        img_url,
        slug,
        content,
        author_id,
        category_id,
        tags,
        published,
      },
      ctx,
    ) => {
      // HERE
      const slugifiedTitle = slugify(title, { locale: "tr" });
    
      ctx.database
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
        .execute();
    },
  },
};
