import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  participants: string[];
  roomId: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    participants: {
      type: [String],
      required: true,
      validate: {
        validator: function (participants: string[]) {
          return participants.length === 2;
        },
        message: "Chat must have exactly 2 participants",
      },
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    lastMessage: {
      type: String,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model<IChat>("Chat", chatSchema);
