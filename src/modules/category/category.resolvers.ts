import type { IResolverObject } from "mercurius";
import { getAllCategories, getCategoryById, getCategoryBySlug } from "./category.methods.js";

export const categoryQueries: IResolverObject = {
  Query: {
    categories: async (_, __, ctx) => getAllCategories(ctx),
    category: async (_, { id, slug }, ctx) => {
      if (slug) return await getCategoryBySlug(ctx, slug);

      if (id) return await getCategoryById(ctx, id);

      console.error("No input provided for category query");

      return undefined;
    },
  },
};
