import { Document, Schema, model } from "mongoose";

// Interface representing a brand document
export interface IBrand extends Document {
  name: string;
  country: string;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const BrandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true,
      trim: true,
      index: true,
    },

    country: {
      type: String,
      required: [false, "Country of origin is required"],
      trim: true,
      index: true,
    },

    logo: {
      type: String,
      required: [false, "Logo URL is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
export default model<IBrand>("Brand", BrandSchema);
