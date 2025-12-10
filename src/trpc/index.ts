import { initTRPC } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { Context } from "../context.ts";
import { UserModel } from "../db/mongo/models/user.model.ts";
import { users } from "../db/postgres/schema.ts";

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  // ... (other procedures like userList, getPostgresUsers)

  userCreate: t.procedure
    .input(
      z.object({
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Check for duplicates (Postgres is usually faster for this)
      const existingUser = await ctx.pg.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existingUser) {
        throw new Error("A user with this email already exists.");
      }

      // 🔒 2. Hash the password using Bun's native API
      // Default algorithm is Argon2id (industry standard)
      const hashedPassword = await Bun.password.hash(input.password);

      // 3. Save to MongoDB (Store the HASH, not the plain text)
      const newMongoUser = new UserModel({
        username: input.username,
        email: input.email,
        password: hashedPassword, // <--- Saving hash
        role: "user",
        isActive: true,
      });
      const savedMongo = await newMongoUser.save();

      // 4. Save to Postgres (Store the SAME hash)
      await ctx.pg.insert(users).values({
        username: input.username,
        email: input.email,
        password: hashedPassword, // <--- Saving hash
        role: "user",
        isActive: true,
      });

      // 5. Return the user (but delete the password from the response!)
      const userResponse = savedMongo.toObject({ versionKey: false });
      delete (userResponse as any).password;

      return userResponse;
    }),
});

export type AppRouter = typeof appRouter;
