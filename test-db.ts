import postgres from "postgres";

const sql = postgres({
  host: "127.0.0.1",
  port: 5432,
  database: "postgres",
  username: "postgres",
  password: "Dis_andrei1995",
  ssl: false,
});

async function main() {
  try {
    const version = await sql`SELECT version()`;
    console.log("✅ Connection Successful:", version[0]);
  } catch (err) {
    console.error("❌ Connection Failed:", err);
  }
  process.exit();
}

main();
