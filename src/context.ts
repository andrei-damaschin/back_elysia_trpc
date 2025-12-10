// src/context.ts
import { pgDb } from "./db/postgres/index.ts"; // Import your Drizzle instance
// import { User } from './db/mongo/models'; // Your existing Mongoose models

export const createContext = async () => {
  return {
    // Return existing context props (auth, headers, etc.)

    // Add Drizzle here:
    pg: pgDb,

    // You can also add specific Mongoose models if you don't import them directly
    // mongo: { User }
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
