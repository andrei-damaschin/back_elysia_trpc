// src/reset.ts
import postgres from "postgres";

const sql = postgres(process.env.POSTGRESS_URI!);

async function main() {
  console.log("🗑️  Dropping existing tables...");

  // We use CASCADE to remove linked tables automatically
  await sql`DROP TABLE IF EXISTS "posts_to_tags" CASCADE`;
  await sql`DROP TABLE IF EXISTS "posts" CASCADE`;
  await sql`DROP TABLE IF EXISTS "tags" CASCADE`;
  await sql`DROP TABLE IF EXISTS "users" CASCADE`;
  await sql`DROP TABLE IF EXISTS "drizzle_migrations" CASCADE`; // Clear migration history too

  console.log("✨ Database cleaned!");
  process.exit(0);
}

main();
