import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// --- 1. Users Table (Aligned with Mongo) ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  // Renamed 'name' -> 'username' to match Mongo
  username: text("username").notNull(),

  email: text("email").notNull().unique(),

  // Renamed 'passwordHash' -> 'password' to match Mongo
  password: text("password").notNull(),

  isActive: boolean("is_active").default(true),
  role: text("role", { enum: ["admin", "user"] }).default("user"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- 2. Posts Table ---
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  content: text("content"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- 3. Tags Table ---
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// --- 4. Junction Table ---
export const postsToTags = pgTable(
  "posts_to_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  }),
);

// --- 5. RELATIONS ---
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  tags: many(postsToTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postsToTags),
}));

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsToTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postsToTags.tagId],
    references: [tags.id],
  }),
}));
