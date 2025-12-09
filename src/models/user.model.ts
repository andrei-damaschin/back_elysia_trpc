import mongoose, { Document, Schema } from "mongoose";

// 1. Define the TypeScript interface for your document
export interface IUser extends Document {
  username: string;
  email: string;
  createdAt: Date;
}

// 2. Define the Mongoose Schema
const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

// 3. Create and export the Mongoose Model
export const UserModel = mongoose.model<IUser>("User", UserSchema);
