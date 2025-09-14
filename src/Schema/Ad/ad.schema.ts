import { model, Schema, Document, Types } from "mongoose";

export interface IAd extends Document {
  userId: Types.ObjectId;
  _id: Types.ObjectId;
  title: string;
  slug: string;
  category?: Types.ObjectId;
  models: {
    model: Types.ObjectId; // Reference to the Model schema
    // year: number
  }[]; // List of objects containing model and year
  condition: string;
  manufacturedCountry: string;
  description: string;
  thumbnail?: Types.ObjectId; // URL for thumbnail image
  album: Types.ObjectId[]; // Array of image URLs
  stock?: Types.ObjectId; // Reference to Stock schema
  stockStatus: "available" | "out_of_stock" | "low_stock";
  status: "active" | "pending" | "deleted";
  price: number;
  createdAt?: Date; // Optional field for creation timestamp
  updatedAt?: Date; // Optional field for last update timestamp
}

const AdSchema = new Schema<IAd>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true, // Index for faster search
    },
    title: {
      type: String,
      required: [true, "Ad title is required"],
      trim: true,
    },
    slug: {
      type: String,
      // required: [true, "Ad slug is required"],
      trim: true,
      //unique: true, // Ensure slug is unique
      index: true, // Index for faster search
      lowercase: true, // Convert slug to lowercase
    },

    models: [
      {
        model: {
          type: Schema.Types.ObjectId,
          ref: "Model",

          required: [true, "Model is required"],

          index: true, // Index for faster search
        },
      },
    ],
    condition: {
      type: String,
      required: [true, "Ad condition is required"],
      trim: true,
      index: true, // Index for faster search
    },
    manufacturedCountry: {
      type: String,
      required: [true, "Manufactured country is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Ad description is required"],
      trim: true,
    },
    thumbnail: {
      type: Schema.Types.ObjectId,
      ref: "AdImage", 
    },
    album: [
      {
        type: Schema.Types.ObjectId,
        ref: "AdImage", 
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
      required: [true, "Category is required"],
    },
    stock: {
      type: Schema.Types.ObjectId,
      ref: "Stock",
      index: true,
    },
    stockStatus: {
      type: String,
      enum: ["available", "out_of_stock", "low_stock"],
      default: "available",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "pending", "deleted"],
      default: "pending",
      index: true, // Index for faster search
    },

    price: {
      type: Number,
      required: [true, "Ad price is required"],
      min: [0, "Price cannot be negative"],
      index: true, // Index for faster search
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);
AdSchema.pre("save", async function (next) {
  if (
    this.isModified("title") ||
    this.isModified("status") ||
    this.isModified("condition") ||
    this.isModified("manufacturedCountry") ||
    this.isModified("models")
  ) {
    const modelNames = await Promise.all(
      this.models.map(async (m) => {
        const modelDoc = await model("Model").findById(m.model).exec();
        return modelDoc ? (modelDoc as any).name : "";
      })
    );

    const slugParts = [
      this.title,
      this.status,
      this.condition,
      this.manufacturedCountry,
      ...modelNames,
    ];
    this.slug = slugParts
      .filter((part) => part) // Remove empty parts
      .map((part) => part.toLowerCase().replace(/\s+/g, "-"))
      .join("-");
  }
  next();
});

AdSchema.pre("findOneAndUpdate", async function (next) {
  const update: any = this.getUpdate();
  if (Array.isArray(update)) {
    return next();
  }
  if (
    update?.title ||
    update?.status ||
    update?.condition ||
    update?.manufacturedCountry ||
    update?.models ||
    update?.$set?.title ||
    update?.$set?.status ||
    update?.$set?.condition ||
    update?.$set?.manufacturedCountry ||
    update?.$set?.models
  ) {
    const title = update?.$set?.title ?? update?.title;
    const status = update?.$set?.status ?? update?.status;
    const condition = update?.$set?.condition ?? update?.condition;
    const manufacturedCountry =
      update?.$set?.manufacturedCountry ?? update?.manufacturedCountry;
    const modelsToUse = update?.$set?.models ?? update?.models;

    const modelNames = await Promise.all(
      (modelsToUse || []).map(async (m: any) => {
        const modelDoc = await model("Model").findById(m.model).exec();
        return modelDoc ? (modelDoc as any).name : "";
      })
    );

    const slugParts = [
      title,
      status,
      condition,
      manufacturedCountry,
      ...modelNames,
    ];

    update.$set = update.$set || {};
    update.$set.slug = slugParts
      .filter((part: any) => part) // Remove empty parts
      .map((part: any) => String(part).toLowerCase().replace(/\s+/g, "-"))
      .join("-");

    this.setUpdate(update);
  }
  next();
});

export default model<IAd>("Ad", AdSchema);
