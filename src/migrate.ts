// src/migrate.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// 1. Use the EXACT connection config that worked in your test
// src/migrate.ts
const migrationClient = postgres(process.env.POSTGRESS_URI!);

async function main() {
  console.log("⏳ Running migrations...");

  const db = drizzle(migrationClient);

  // 2. Point this to the folder created in Step 1
  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("✅ Migrations complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
