// models/Seller.ts
import { Schema } from "mongoose";
import User, { IUser } from "./user.schema";

export interface ISeller extends IUser {
  physicalAddress: string;
  logo?: string;
  storePhotos?: string[]; // array of photo URLs
}

const SellerSchema = new Schema<ISeller>({
  physicalAddress: { type: String, required: false },
  logo: { type: String, required: false },
  storePhotos: {
    type: [String],
    required: false,
  },
});

// Discriminator
export default User.discriminator<ISeller>("seller", SellerSchema);
