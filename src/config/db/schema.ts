import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgSchema,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const schema = pgSchema("blog");

// Posts
export const posts = schema.table(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    img_url: varchar("img_url", { length: 255 }),
    slug: varchar("slug").unique().notNull(),
    content: text("content").notNull(),
    author_id: uuid("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    category_id: integer("category_id")
      .default(0)
      .references(() => categories.id, { onDelete: "set null" }),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date(Date.now())),
    published: boolean("published").default(true),
    deleted: boolean("deleted").default(false),
  },
  (table) => [{ slugIdx: uniqueIndex("slug_idx").on(table.slug) }],
);

export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.author_id],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.category_id],
    references: [categories.id],
  }),
  tags: many(postsToTags),
  likes: many(likes),
}));

// Users
export const users = schema.table(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    role: varchar("role", { length: 15 }).default("user"),
    name: varchar("name", { length: 127 }),
    username: varchar("username", { length: 63 }).unique().notNull(),
    email: varchar("email", { length: 127 }).unique().notNull(),
    password_hash: varchar("password_hash", { length: 255 }).notNull(),
    bio: text("bio"),
    profile_img: varchar({ length: 255 }),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date(Date.now())),
  },
  (t) => [
    { emailIdx: uniqueIndex("email_idx").on(t.email) },
    { usernameIdx: uniqueIndex("username_idx").on(t.username) },
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
}));

// Comments
export const comments = schema.table(
  "comments",
  {
    id: serial("id").primaryKey(),
    author_id: uuid("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    post_id: uuid("post_id").references(() => posts.id, {
      onDelete: "cascade",
    }),
    content: text("content").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date(Date.now())),
    deleted: boolean("deleted").default(false),
  },
  (t) => [{ postIdx: index("post_idx").on(t.post_id) }],
);

// Categories
export const categories = schema.table("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 127 }).notNull(),
  slug: varchar("slug", { length: 127 }).notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

// Tags
export const tags = schema.table("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 127 }).notNull(),
  slug: varchar("slug", { length: 127 }).notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postsToTags),
}));

// Likes (Posts to Users)
export const likes = schema.table(
  "likes",
  {
    post_id: uuid("post_id")
      .notNull()
      .references(() => posts.id),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [{ pk: primaryKey({ columns: [t.post_id, t.user_id] }) }],
);

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.post_id],
    references: [posts.id],
  }),
  users: one(users, {
    fields: [likes.user_id],
    references: [users.id],
  }),
}));

// Posts to Tags
export const postsToTags = schema.table(
  "posts_to_tags",
  {
    post_id: uuid("post_id")
      .notNull()
      .references(() => posts.id),
    tag_id: integer("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => [
    {
      pk: primaryKey({ columns: [t.post_id, t.tag_id] }),
    },
  ],
);

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsToTags.post_id],
    references: [posts.id],
  }),
  tags: one(tags, {
    fields: [postsToTags.tag_id],
    references: [tags.id],
  }),
}));
