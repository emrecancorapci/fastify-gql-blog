import { and, count, eq, or, type SQL, type DBQueryConfig } from "drizzle-orm";
import argon2 from "argon2";
import type { MercuriusContext } from "mercurius";
import type { PgColumn, SelectedFieldsFlat } from "drizzle-orm/pg-core";

import { users } from "@/config/db/schema.js";
import {
  CreateUserSchema,
  defaultUserColumns,
  LoginSchema,
  UpdateUserSchema,
} from "./user.validations.js";
import { z } from "zod";

const defaultSelect = {
  id: users.id,
  name: users.name,
  username: users.username,
  bio: users.bio,
  profile_img: users.profile_img,
  created_at: users.created_at,
};

export async function getAllUsers(
  { database, user }: MercuriusContext,
  options: DBQueryConfig<"many", true> = {
    columns: defaultUserColumns,
    orderBy: users.created_at,
    limit: 10,
    offset: 0,
  },
) {
  if (user && user.role === "admin") {
    return await database.query.users.findMany(options);
  }

  if (user)
    return await database.query.users.findMany({
      ...options,
      where: options.where
        ? // @ts-expect-error I couldn't find a way to type this
          and(options.where, eq(users.id, user.id))
        : eq(users.id, user.id),
    });

  throw new Error("Unauthorized access to users data");
}

export async function getUserById(
  { database }: MercuriusContext,
  id: string,
  options: { select?: SelectedFieldsFlat } = { select: defaultSelect },
) {
  if (options.select) {
    return (await database.select(options.select).from(users).where(eq(users.id, id)))[0];
  }

  return (await database.select().from(users).where(eq(users.id, id)))[0];
}

export async function getUserByUsername(
  { database }: MercuriusContext,
  username: string,
  options: { select?: SelectedFieldsFlat } = { select: defaultSelect },
) {
  if (options.select) {
    return (
      await database.select(options.select).from(users).where(eq(users.username, username))
    )[0];
  }

  return await database.select().from(users).where(eq(users.username, username));
}

export async function getUserByEmail(
  { database }: MercuriusContext,
  email: string,
  options: { select?: SelectedFieldsFlat } = { select: defaultSelect },
) {
  if (options.select) {
    return await database.select(options.select).from(users).where(eq(users.email, email));
  }

  return await database.select().from(users).where(eq(users.email, email));
}

export async function createUser({ database, user }: MercuriusContext, data: unknown) {
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized access to create user");
  }

  const { username, email, password, ...userData } = await CreateUserSchema.parseAsync(data);

  const [{ count: userCount }] = await database
    .select({ count: count() })
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)));

  if (userCount > 0) {
    throw new Error("User already exists");
  }

  const password_hash = await argon2.hash(password);

  const [createdUser] = await database
    .insert(users)
    .values({ username, email, password_hash, ...userData })
    .returning(defaultSelect);

  if (!createdUser) {
    throw new Error("Failed to create user");
  }

  return createdUser;
}

export async function updateUser({ database, user }: MercuriusContext, data: unknown) {
  const { id, ...user_data } = await UpdateUserSchema.parseAsync(data);

  if (!user) {
    throw new Error("Unauthorized access to update user. Not logged in.");
  }
  if (user.id !== id && user.role !== "admin") {
    throw new Error("Unauthorized access to update user. Not admin.");
  }

  const [updated_user] = await database
    .update(users)
    .set(user_data)
    .where(eq(users.id, id))
    .returning(defaultSelect);

  if (!updated_user) {
    throw new Error("Failed to update user");
  }

  return updated_user;
}

export async function deleteUser({ database, user }: MercuriusContext, id: string) {
  if (!user) {
    throw new Error("Unauthorized access to delete user. Not logged in.");
  }
  if (user.id !== id && user.role !== "admin") {
    throw new Error("Unauthorized access to delete user. Not admin.");
  }

  const parsedId = await z.string().uuid().parseAsync(id);

  const [userData] = await database
    .delete(users)
    .where(eq(users.id, parsedId))
    .returning(defaultSelect);

  if (!userData) {
    throw new Error("Failed to delete user");
  }

  return userData;
}

export async function login({ database, jwtSign }: MercuriusContext, data: unknown) {
  const { email, password } = await LoginSchema.parseAsync(data);

  const [user] = await database
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      role: users.role,
      password_hash: users.password_hash,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    throw new Error("User does not exist");
  }

  const { password_hash, ...payload } = user;

  if (!(await argon2.verify(password_hash, password))) {
    throw new Error("Invalid password");
  }

  return jwtSign(payload);
}

export async function register({ database, jwtSign }: MercuriusContext, data: unknown) {
  console.log("Register", data);
  const { username, email, password } = await CreateUserSchema.parseAsync(data);

  const [{ count: userCount }] = await database
    .select({ count: count() })
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)));

  if (userCount > 0) {
    throw new Error("User already exists");
  }

  const password_hash = await argon2.hash(password);

  const [createdUser] = await database
    .insert(users)
    .values({ username, email, password_hash })
    .returning({ ...defaultSelect, role: users.role });

  if (!createdUser) {
    throw new Error("Failed to create user");
  }

  return jwtSign({
    id: createdUser.id,
    name: createUser.name,
    username: createdUser.username,
    role: createdUser.role,
  });
}
