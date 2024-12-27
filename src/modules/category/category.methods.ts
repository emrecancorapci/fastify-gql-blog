import type { MercuriusContext } from "mercurius";
import { eq } from "drizzle-orm";

import { categories } from "@/config/db/schema.js";

export async function getAllCategories({ database }: MercuriusContext) {
  return await database.select().from(categories);
}

export async function getCategoryById(ctx: MercuriusContext, id: string) {
  return (
    await ctx.database
      .select()
      .from(categories)
      .where(eq(categories.id, Number(id)))
  )[0];
}

export async function getCategoryBySlug(ctx: MercuriusContext, slug: string) {
  return (await ctx.database.select().from(categories).where(eq(categories.slug, slug)))[0];
}

export async function createCategory(
  { database, user }: MercuriusContext,
  { name, slug }: { name: string; slug: string },
) {
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized access to create category");
  }

  return await database.insert(categories).values({ name, slug }).returning();
}

export async function updateCategory(
  { database, user }: MercuriusContext,
  { id, name, slug }: { id: string; name: string; slug: string },
) {
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized access to update category");
  }

  return await database
    .update(categories)
    .set({ name, slug })
    .where(eq(categories.id, Number(id)))
    .returning();
}

export async function deleteCategory({ database, user }: MercuriusContext, id: string) {
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized access to delete category");
  }

  return await database
    .delete(categories)
    .where(eq(categories.id, Number(id)))
    .returning();
}
