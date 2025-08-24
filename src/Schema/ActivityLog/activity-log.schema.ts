import { model, Schema, Document, Types } from "mongoose";

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  stockId: Types.ObjectId;
  adId: Types.ObjectId;
  userId: Types.ObjectId;
  action: "created" | "updated" | "restocked" | "reserved" | "sold" | "cancelled" | "returned" | "adjusted";
  description: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  quantityChange?: number;
  previousQuantity?: number;
  newQuantity?: number;
  reason?: string;
  metadata?: {
    orderId?: string;
    batchNumber?: string;
    supplier?: string;
    location?: string;
    [key: string]: any;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    stockId: {
      type: Schema.Types.ObjectId,
      ref: "Stock",
      required: [true, "Stock reference is required"],
      index: true,
    },
    adId: {
      type: Schema.Types.ObjectId,
      ref: "Ad",
      required: [true, "Ad reference is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    action: {
      type: String,
      enum: ["created", "updated", "restocked", "reserved", "sold", "cancelled", "returned", "adjusted"],
      required: [true, "Action is required"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    changes: [
      {
        field: {
          type: String,
          required: true,
        },
        oldValue: {
          type: Schema.Types.Mixed,
        },
        newValue: {
          type: Schema.Types.Mixed,
        },
      },
    ],
    quantityChange: {
      type: Number,
    },
    previousQuantity: {
      type: Number,
      min: [0, "Previous quantity cannot be negative"],
    },
    newQuantity: {
      type: Number,
      min: [0, "New quantity cannot be negative"],
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [200, "Reason cannot exceed 200 characters"],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
  }
);

// Indexes for efficient queries
ActivityLogSchema.index({ stockId: 1, createdAt: -1 });
ActivityLogSchema.index({ adId: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });

// Compound index for complex queries
ActivityLogSchema.index({ stockId: 1, action: 1, createdAt: -1 });

export default model<IActivityLog>("ActivityLog", ActivityLogSchema);
