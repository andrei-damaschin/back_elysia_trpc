import { initTRPC } from "@trpc/server";
import { z } from "zod"; // 💡 Zod is the standard for tRPC validation
import { IUser, UserModel } from "../models/user.model.ts";

const t = initTRPC.create();

export const appRouter = t.router({
  userList: t.procedure.query(async () => {
    const users: IUser[] = await UserModel.find({});
    return users.map((user) => user.toObject({ versionKey: false }));
  }),

  userCreate: t.procedure

    .input(
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters long."),
        email: z.email("Invalid email format."), // Zod has built-in email validation
      }),
    )
    .mutation(async ({ input }) => {
      const existingUser = await UserModel.findOne({ email: input.email });
      if (existingUser) {
        throw new Error("A user with this email already exists.");
      }

      const newUser = new UserModel(input);
      const savedUser = await newUser.save();

      return savedUser.toObject({ versionKey: false });
    }),
});


export type AppRouter = typeof appRouter;
