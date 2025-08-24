import { model, Schema, Document, Types } from "mongoose";

export interface IStock extends Document {
  _id: Types.ObjectId;
  adId: Types.ObjectId;
  available: number;
  reserved: number;
  bought: number;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema = new Schema<IStock>(
  {
    adId: {
      type: Schema.Types.ObjectId,
      ref: "Ad",
      required: [true, "Ad reference is required"],
      unique: true, // One stock record per ad
      index: true,
    },
    available: {
      type: Number,
      required: [true, "Available quantity is required"],
      min: [0, "Available quantity cannot be negative"],
      default: 0,
    },
    reserved: {
      type: Number,
      required: [true, "Reserved quantity is required"],
      min: [0, "Reserved quantity cannot be negative"],
      default: 0,
    },
    bought: {
      type: Number,
      required: [true, "Bought quantity is required"],
      min: [0, "Bought quantity cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


export default model<IStock>("Stock", StockSchema);
