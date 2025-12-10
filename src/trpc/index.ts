import { initTRPC } from "@trpc/server";
import { z } from "zod";
// 1. Import Drizzle schemas and operators
import { users } from "../db/postgres/schema.ts"; // <-- From your schema.ts
// 2. Import your Context type (defined in previous steps)
import type { Context } from "../context.ts";
import { UserModel } from "../db/mongo/models/user.model.ts";

// 3. Initialize tRPC with your Context type
const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  // --- Mongoose Query (Existing) ---
  userList: t.procedure.query(async () => {
    const users = await UserModel.find({});
    return users.map((user) => user.toObject({ versionKey: false }));
  }),

  // --- Drizzle Query (New) ---
  getPostgresUsers: t.procedure.query(async ({ ctx }) => {
    // Uses the Drizzle instance injected into context
    return await ctx.pg.select().from(users);
  }),

  // --- Hybrid Mutation (Writes to BOTH) ---
  userCreate: t.procedure
    .input(
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters long."),
        email: z.email("Invalid email format."),
        // Add password since our Postgres schema likely requires it
        password: z.string().min(6).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Check existence (Check Postgres for speed, or Mongo)
      const existingUser = await UserModel.findOne({ email: input.email });
      if (existingUser) {
        throw new Error("A user with this email already exists.");
      }

      // 2. Create in MongoDB (Your existing logic)
      const newMongoUser = new UserModel({
        username: input.username,
        email: input.email,
      });
      const savedMongo = await newMongoUser.save();

      // 3. Create in Postgres (Drizzle Logic)
      // We wrap this in a try/catch in case Mongo succeeds but Postgres fails
      try {
        await ctx.pg.insert(users).values({
          name: input.username,
          email: input.email,
          // Assuming you have a password field in Postgres schema
          passwordHash: "placeholder_hash",
          role: "user",
        });
      } catch (err) {
        console.error("Failed to sync to Postgres:", err);
        // Optional: Rollback Mongo here if strict consistency is needed
      }

      return savedMongo.toObject({ versionKey: false });
    }),
});

export type AppRouter = typeof appRouter;
