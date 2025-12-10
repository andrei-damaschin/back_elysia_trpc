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

// --- 1. Users Table ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  // Store hashed passwords only!
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").default(true),
  role: text("role", { enum: ["admin", "user"] }).default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- 2. Posts Table (One-to-Many with Users) ---
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  // Foreign Key with Cascade Delete (Delete user -> delete their posts)
  authorId: integer("author_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  content: text("content"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- 3. Tags Table (Many-to-Many with Posts) ---
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// --- 4. Posts-to-Tags Junction Table (Many-to-Many) ---
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
    // Composite Primary Key ensures no duplicate pairs
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  }),
);

// --- 5. RELATIONS (Crucial for clean tRPC queries) ---

// Define relations for Users
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts), // A user has many posts
}));

// Define relations for Posts
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  tags: many(postsToTags), // Link to junction table
}));

// Define relations for Tags
export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postsToTags),
}));

// Define relations for Junction Table
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
