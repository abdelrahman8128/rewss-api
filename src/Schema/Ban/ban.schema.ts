import { Schema, model, Document, Types } from "mongoose";

export interface IBan extends Document {
  userId: Types.ObjectId;
  bannedBy: Types.ObjectId;
  reason?: string;
  banStartDate: Date;
  banEndDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BanSchema = new Schema<IBan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bannedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: false,
      trim: true,
    },
    banStartDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    banEndDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
BanSchema.index({ userId: 1, isActive: 1 });
BanSchema.index({ banEndDate: 1, isActive: 1 });

export default model<IBan>("Ban", BanSchema);
