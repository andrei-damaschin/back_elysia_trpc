// src/db/postgres/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";

const client = postgres(process.env.POSTGRESS_URI!);
export const pgDb = drizzle(client, { schema });
