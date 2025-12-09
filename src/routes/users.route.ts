import { Elysia, t } from "elysia";
import { UserModel } from "../models/user.model";

// 1. Define the Schema (moved from index.ts)
const UserBodySchema = t.Object({
  username: t.String({ minLength: 3 }),
  email: t.String({ format: "email" }),
});

// 2. Create an Elysia instance for the Users router
// We name it and export it as a plugin.
export const usersRoute = new Elysia({ prefix: "/users" })
  // --- POST /users (Create User) ---
  .post(
    "/", // The route is just '/', but the prefix makes it '/users'
    async ({ body, set }) => {
      try {
        const existingUser = await UserModel.findOne({ email: body.email });
        if (existingUser) {
          set.status = 409;
          return { message: "A user with this email already exists." };
        }

        const newUser = new UserModel(body);
        const savedUser = await newUser.save();

        set.status = 201;
        // Strip out the MongoDB version key before sending
        return savedUser.toObject({ versionKey: false });
      } catch (error) {
        console.error("Error creating user:", error);
        set.status = 500;
        return { message: "Failed to create user due to a server error." };
      }
    },
    {
      body: UserBodySchema,
      error({ code, error }) {
        if (code === "VALIDATION") {
          return new Response(JSON.stringify({ message: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  )

  // --- GET /users (Fetch All Users) ---
  .get("/", async ({ set }) => {
    try {
      const users = await UserModel.find({});
      return users; // Elysia converts to JSON
    } catch (error) {
      console.error("Error fetching users:", error);
      set.status = 500;
      return { message: "Database error while fetching users." };
    }
  });
