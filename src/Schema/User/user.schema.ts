import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  phoneCode?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  status: "active" | "inactive" | "pending" | "ban" | "deleted" | "blocked";
  role: "user" | "seller" | "admin" | "super"; // Assuming a role field is needed
  createdAt: Date;
  updatedAt: Date;
  avatar?: string; // Optional avatar field
  favorites: Types.ObjectId[]; // Array of ad IDs
}

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
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    phoneNumber: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      index: true,
      
    },
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

    avatar: {
      type: String,
      required: false,
      default: "https://example.com/default-avatar.png", // Default avatar URL
    },

    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ad",
        default: [],
      },
    ],

    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

export default model<IUser>("User", UserSchema);
