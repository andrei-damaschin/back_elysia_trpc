import cors from "@elysiajs/cors";
import { trpc } from "@elysiajs/trpc";
import { Elysia } from "elysia";
import mongoose from "mongoose";
import { usersRoute } from "./routes/users.route";
import { appRouter } from "./trpc"; //
import type { AppRouter } from "./trpc/index";
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    // Exit process if connection fails
    process.exit(1);
  }
};

const app = new Elysia()
  .use(
    cors({
      // Replace 5173 with the port your Quick app is actually running on
      origin: "http://localhost:3000",
    }),
  )
  .on("start", connectDB) // Connect DB before server starts

  // 1. USE THE PLUGIN: Mount the entire usersRoute here
  .use(
    trpc(appRouter, {
      endpoint: "/trpc",
      // Optional: Set up context (if needed for authentication, etc.)
      // createContext() { ... }
    }),
  )
  .use(usersRoute)
  // 2. Keep the simple root route
  .get("/", () => "Elysia Main Server Running")

  .listen(5000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
export type App = typeof app;
export type { AppRouter };
