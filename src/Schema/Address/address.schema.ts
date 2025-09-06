import { Schema, model, Document, Types } from "mongoose";

export interface IAddress extends Document {
  user: Types.ObjectId;
  country: string;
  gov: string; // Governorate/State
  city: string;
  region: string;
  street: string;
  building: string;
  apartment: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  moreInfo?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    gov: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    building: {
      type: String,
      required: true,
      trim: true,
    },
    apartment: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: false,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: false,
        min: -180,
        max: 180,
      },
    },
    moreInfo: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
AddressSchema.index({ user: 1, country: 1, city: 1 });
AddressSchema.index({ coordinates: "2dsphere" }); // For geospatial queries

// Compound index for unique default address per user
AddressSchema.index(
  { user: 1, isDefault: 1 },
  {
    unique: true,
    partialFilterExpression: { isDefault: true },
  }
);

export default model<IAddress>("Address", AddressSchema);
