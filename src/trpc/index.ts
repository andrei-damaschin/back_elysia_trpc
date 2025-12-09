import { initTRPC } from "@trpc/server";
import { z } from "zod"; // 💡 Zod is the standard for tRPC validation
import { IUser, UserModel } from "../models/user.model";

// 1. Initialize tRPC
// We keep the convention of naming the tRPC instance 't'.
// No special configuration is needed here because Zod is the default parser.
const t = initTRPC.create();

// Define the base router and procedures
export const appRouter = t.router({
  userList: t.procedure.query(async () => {
    // This function runs when the frontend calls 'trpc.userList.useQuery()'

    // Fetch users and ensure they are converted to plain objects for transfer
    const users: IUser[] = await UserModel.find({});
    return users.map((user) => user.toObject({ versionKey: false }));
  }),

  /**
   * Procedure: userCreate
   * Function: Creates a new user in MongoDB.
   * Type: Mutation (POST equivalent)
   */
  userCreate: t.procedure
    // 2. Input Validation using Zod
    // This schema defines the expected shape and rules for the incoming data.
    .input(
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters long."),
        email: z.string().email("Invalid email format."), // Zod has built-in email validation
      }),
    )
    .mutation(async ({ input }) => {
      // Input is guaranteed to be validated by Zod at this point

      // Check for existing user (optional, but good practice)
      const existingUser = await UserModel.findOne({ email: input.email });
      if (existingUser) {
        // Throwing a standard Error is correctly captured and serialized by tRPC
        throw new Error("A user with this email already exists.");
      }

      // Create and save the new Mongoose document
      const newUser = new UserModel(input);
      const savedUser = await newUser.save();

      // Return the new object, stripping the MongoDB version key
      return savedUser.toObject({ versionKey: false });
    }),
});

// 3. Export the Type Definition
// This type is crucial! The frontend uses it to generate the client-side hooks.
export type AppRouter = typeof appRouter;
