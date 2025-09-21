import mongoose, { Schema, Document } from "mongoose";

export interface IReaction {
  userId: string;
  emoji: string;
  timestamp: Date;
}

export interface IReadBy {
  userId: string;
  readAt: Date;
}

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: string;
  message: string;
  messageId: string;
  messageType: "text" | "image" | "file" | "audio" | "video" | "sticker";
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  isDelivered: boolean;
  deliveredTo: string[];
  readBy: IReadBy[];
  reactions: IReaction[];
  replyTo?: mongoose.Types.ObjectId;
  forwarded: boolean;
  edited: boolean;
  isEdited: boolean;
  editedAt?: Date;
  deleted: boolean;
  deletedAt?: Date;
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    latitude?: number;
    longitude?: number;
    thumbnailUrl?: string;
  };
}

const reactionSchema = new Schema<IReaction>({
  userId: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const readBySchema = new Schema<IReadBy>({
  userId: {
    type: String,
    required: true,
  },
  readAt: {
    type: Date,
    default: Date.now,
  },
});

const messageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "audio", "video", "sticker"],
      default: "text",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "read", "failed"],
      default: "sent",
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredTo: [
      {
        type: String,
      },
    ],
    readBy: [readBySchema],
    reactions: [reactionSchema],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    forwarded: {
      type: Boolean,
      default: false,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      fileUrl: String,
      fileName: String,
      fileSize: Number,
      mimeType: String,
      duration: Number,
      thumbnailUrl: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
