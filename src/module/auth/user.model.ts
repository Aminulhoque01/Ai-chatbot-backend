
import { Schema, model, models } from "mongoose";

export interface IUser {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}

const userSchema = new Schema<IUser>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User =
  models.User || model<IUser>("User", userSchema);

export default User;
