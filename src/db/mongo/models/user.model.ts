import mongoose, { Document, Schema } from "mongoose";

// 1. Define the TypeScript interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string; // <--- Added
  role: "admin" | "user"; // <--- Added to match Postgres
  isActive: boolean; // <--- Added to match Postgres
  createdAt: Date;
  updatedAt: Date; // <--- Added
}

// 2. Define the Mongoose Schema
const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // <--- Added
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
  },
  {
    // This automatically manages 'createdAt' and 'updatedAt'
    timestamps: true,
  },
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
