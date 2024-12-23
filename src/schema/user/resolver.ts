import { and, eq, name, or } from "drizzle-orm";
import type { IResolverObject, MercuriusContext } from "mercurius";

import { comments, likes, posts, users } from "@/config/db/schema.js";
import {
  CreateUserSchema,
  DeleteUserSchema,
  LoginSchema,
  UpdateUserSchema,
} from "./schema.js";
import argon2 from "argon2";

const returnFields = {
  id: users.id,
  name: users.name,
  username: users.username,
  email: users.email,
  bio: users.bio,
  profile_img: users.profile_img,
  created_at: users.created_at,
  updated_at: users.updated_at,
};

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
        .where(and(eq(posts.author_id, String(id)), eq(posts.deleted, false))),
    comments: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(comments)
        .where(
          and(eq(comments.author_id, String(id)), eq(comments.deleted, false)),
        ),
    likes: async ({ id }, _, ctx) =>
      ctx.database
        .select()
        .from(likes)
        .innerJoin(posts, eq(likes.post_id, posts.id))
        .where(eq(likes.user_id, String(id))),
  },
  Mutations: {
    createUser: async (_, data, ctx) => {
      const { username, email, password } =
        await CreateUserSchema.parseAsync(data);

      const is_exist = await ctx.database
        .select({ email: users.email, username: users.username })
        .from(users)
        .where(or(eq(users.username, username), eq(users.email, email)));

      if (is_exist.length > 0) {
        throw new Error("User already exists");
      }

      const password_hash = await argon2.hash(password);

      const user = await ctx.database
        .insert(users)
        .values({ username, email, password_hash })
        .returning(returnFields);

      if (!user) {
        throw new Error("Failed to create user");
      }

      return user;
    },
    updateUser: async (_, data, ctx) => {
      const { id, current_password, ...user_data } =
        await UpdateUserSchema.parseAsync(data);

      await validateUserPassword(ctx, id, current_password);

      const updated_user = await ctx.database
        .update(users)
        .set(user_data)
        .where(eq(users.id, id))
        .returning(returnFields);

      if (!updated_user) {
        throw new Error("Failed to update user");
      }

      return updated_user;
    },
    deleteUser: async (_, data, ctx) => {
      const { id, password } = await DeleteUserSchema.parseAsync(data);

      await validateUserPassword(ctx, id, password);

      const user = await ctx.database
        .delete(users)
        .where(eq(users.id, id))
        .returning(returnFields);

      if (!user) {
        throw new Error("Failed to delete user");
      }

      return user;
    },
    login: async (_, data, ctx) => {
      const { username, password } = await LoginSchema.parseAsync(data);

      const user = await ctx.database
        .select({
          id: users.id,
          name: users.name,
          role: users.role,
          password_hash: users.password_hash,
        })
        .from(users)
        .where(eq(users.id, username));

      if (!user || user.length === 0) {
        throw new Error("User does not exist");
      }

      if (user.length > 1) {
        throw new Error("Multiple users with the same ID");
      }

      const [{ password_hash, ...payload }] = user;

      const is_password_validated = await argon2.verify(
        password_hash,
        password,
      );

      if (!is_password_validated) {
        throw new Error("Invalid password");
      }

      const token = ctx.jwtSign(payload);

      return token;
    },
  },
};

async function validateUserPassword(
  ctx: MercuriusContext,
  id: string,
  password: string,
) {
  const user = await ctx.database
    .select({ password_hash: users.password_hash })
    .from(users)
    .where(eq(users.id, id));

  if (!user || user.length === 0) {
    throw new Error("User does not exist");
  }

  if (user.length > 1) {
    throw new Error("Multiple users with the same ID");
  }

  const is_password_validated = await argon2.verify(
    user[0].password_hash,
    password,
  );

  if (!is_password_validated) {
    throw new Error("Invalid password");
  }
}
