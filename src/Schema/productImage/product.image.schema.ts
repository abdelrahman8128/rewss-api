import { Schema,model,Document } from "mongoose";

export interface IAdImage extends Document {


    _id: Schema.Types.ObjectId; // MongoDB's ObjectId type
    adId: Schema.Types.ObjectId; // Reference to the ad this image belongs to
    imageId: string; // Unique identifier for the image
    imageUrl: string; // URL of the product image
    createdAt?: Date; // Optional field for creation timestamp
    updatedAt?: Date; // Optional field for last update timestamp
}

const AdImageSchema = new Schema<IAdImage> (
    {
        adId: {
            type: Schema.Types.ObjectId,
            ref: "Ad", // Assuming you have a Product model
            required: [true, "Ad ID is required"],
            index: true, // Index for faster search
        },
        imageId: {
            type: String,
            required: [true, "Image ID is required"],
            trim: true,
        },
        imageUrl: {
            type: String,
            required: [true, "Image URL is required"],
            trim: true,
        },
       
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt fields
    }
);

export default model<IAdImage>("AdImage", AdImageSchema);
