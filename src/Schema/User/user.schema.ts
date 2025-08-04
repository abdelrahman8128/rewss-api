import { Schema, model, Document } from "mongoose";

import { IUser } from "../../interface/user/user.d";

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,

    },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: false, unique: true, trim: true     ,  index: true,},
    phoneCode: { type: String, required: false, trim: true },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "ban", "deleted", "blocked"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin", "super"],
      default: "user",
    },

    avatar:{
      type: String,
      required: false,
      default: "https://example.com/default-avatar.png", // Default avatar URL
    },

    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

export default model<IUser>("User", UserSchema);
