import { cors } from "@elysiajs/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Elysia } from "elysia";
import mongoose from "mongoose";
import { auth } from "./lib/auth.ts";
import { usersRoute } from "./routes/users.route.ts";
import type { AppRouter } from "./trpc/index.ts";
import { appRouter } from "./trpc/index.ts";

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
      origin: "http://localhost:3000",
    }),
  )
  .all("/api/auth/*", ({ request }) => auth.handler(request))

  .on("start", connectDB) // Connect DB before server starts

  .all("/trpc/*", ({ request }) => {
    return fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
      createContext: () => ({}), // Your context
    });
  })
  .use(usersRoute)

  .get("/", () => "Elysia Main Server Running")

  .listen(5000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
export type App = typeof app;
export type { AppRouter };
