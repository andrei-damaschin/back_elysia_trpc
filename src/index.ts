import { cors } from "@elysiajs/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Elysia } from "elysia";

import { createContext } from "./context.ts";
import connectMongoDB from "./db/mongo/connect.ts";
import { auth } from "./lib/auth.ts";
import { usersRoute } from "./routes/users.route.ts";
import type { AppRouter } from "./trpc/index.ts";
import { appRouter } from "./trpc/index.ts";

const app = new Elysia()
  .use(
    cors({
      origin: "http://localhost:3000",
    }),
  )
  .all("/api/auth/*", ({ request }) => auth.handler(request))

  .on("start", connectMongoDB) // Connect DB before server starts

  .all("/trpc/*", ({ request }) => {
    return fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
      createContext,
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
