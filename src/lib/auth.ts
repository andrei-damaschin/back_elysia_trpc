import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017/your_db",
);
const db = client.db();

// 2. Configure Better Auth
export const auth = betterAuth({
  database: mongodbAdapter(db),
  trustedOrigins: ["http://localhost:3000"],

  emailAndPassword: {
    enabled: true,
  },
});
