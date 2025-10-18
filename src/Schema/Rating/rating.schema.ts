import { Schema, Document } from "mongoose";

export interface IRating extends Document {
  adId: string;
  sellerId: string;
  buyerId: string;
  orderId: string;

  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    adId: { type: String, required: true },
    sellerId: { type: String, required: true },
    buyerId: { type: String, required: true },
    orderId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export { RatingSchema };
