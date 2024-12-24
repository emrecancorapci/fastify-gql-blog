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
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date(Date.now()))
      .notNull(),
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
  postLikes: many(postLikes),
  comments: many(comments),
}));

// Users

export const userRoleEnum = schema.enum("role", ["user", "editor", "admin"]);

export const users = schema.table(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    role: userRoleEnum("role").default("user"),
    name: varchar("name", { length: 127 }),
    username: varchar("username", { length: 63 }).unique().notNull(),
    email: varchar("email", { length: 127 }).unique().notNull(),
    password_hash: varchar("password_hash", { length: 255 }).notNull(),
    bio: text("bio"),
    profile_img: varchar({ length: 255 }),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date(Date.now()))
      .notNull(),
  },
  (t) => [
    { emailIdx: uniqueIndex("email_idx").on(t.email) },
    { usernameIdx: uniqueIndex("username_idx").on(t.username) },
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  postLikes: many(postLikes),
  commentLikes: many(usersToCommentLikes),
  editorCategories: many(editorsToCategories),
  deletedComments: many(comments),
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
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date(Date.now()))
      .notNull(),
    deleted: boolean("deleted").default(false),
    deleted_at: timestamp("deleted_at"),
    deleted_by: uuid("deleted_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (t) => [{ postIdx: index("post_idx").on(t.post_id) }],
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.author_id],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.post_id],
    references: [posts.id],
  }),
  deletedBy: one(users, {
    fields: [comments.deleted_by],
    references: [users.id],
  }),
  likes: many(usersToCommentLikes),
}));

// Categories
export const categories = schema.table("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 127 }).notNull(),
  slug: varchar("slug", { length: 127 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date(Date.now()))
    .notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
  editors: many(editorsToCategories),
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

// Many to Many Relationships
// Post Likes (Users to Posts)
export const postLikes = schema.table(
  "post_likes",
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

export const likesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.post_id],
    references: [posts.id],
  }),
  users: one(users, {
    fields: [postLikes.user_id],
    references: [users.id],
  }),
}));

// Comment Likes (Users to Comments)
export const usersToCommentLikes = schema.table(
  "comment_likes",
  {
    comment_id: integer("comment_id")
      .notNull()
      .references(() => comments.id),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [{ pk: primaryKey({ columns: [t.comment_id, t.user_id] }) }],
);

export const commentLikesRelations = relations(
  usersToCommentLikes,
  ({ one }) => ({
    comment: one(comments, {
      fields: [usersToCommentLikes.comment_id],
      references: [comments.id],
    }),
    users: one(users, {
      fields: [usersToCommentLikes.user_id],
      references: [users.id],
    }),
  }),
);

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

// Editors to Categories
export const editorsToCategories = schema.table(
  "editors_to_categories",
  {
    editor_id: uuid("editor_id")
      .notNull()
      .references(() => users.id),
    category_id: integer("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (t) => [
    {
      pk: primaryKey({ columns: [t.editor_id, t.category_id] }),
    },
  ],
);

export const editorsToCategoriesRelations = relations(
  editorsToCategories,
  ({ one }) => ({
    user: one(users, {
      fields: [editorsToCategories.editor_id],
      references: [users.id],
    }),
    category: one(categories, {
      fields: [editorsToCategories.category_id],
      references: [categories.id],
    }),
  }),
);
