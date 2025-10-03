import { Schema } from "mongoose";

import { model } from "mongoose";

export interface ICart extends Document {
  userId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  items: ICartItem[];
  totalCost?: number; // Virtual field for calculated total
}

export interface ICartItem extends Document {
  productId: Schema.Types.ObjectId;
  quantity: number;
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Ad", required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtual fields in JSON
    toObject: { virtuals: true }, // Include virtual fields in objects
  }
);

// Ensure a user can only have one cart per seller
CartSchema.index({ userId: 1, sellerId: 1 }, { unique: true });

// Virtual field for total cost
CartSchema.virtual("totalCost").get(function () {
  if (!this.items || this.items.length === 0) return 0;

  return this.items.reduce((total, item) => {
    if (
      item.productId &&
      typeof item.productId === "object" &&
      "price" in item.productId
    ) {
      return total + (item.productId as any).price * item.quantity;
    }
    return total;
  }, 0);
});


// Post-hook to calculate and add total cost after find operations
CartSchema.post("find", function (docs: any, next: any) {
  if (!docs) return next();

  // Handle both single document and array of documents
  const documents = Array.isArray(docs) ? docs : [docs];

  documents.forEach((doc: any) => {
    if (doc && doc.items) {
      // Calculate total cost
      doc.totalCost = doc.items.reduce((total: number, item: any) => {
        if (item.productId && item.productId.price && item.quantity) {
          return total + item.productId.price * item.quantity;
        }
        return total;
      }, 0);

      // Add totalCost to the document
      doc.totalCost = doc.totalCost || 0;
    }
  });

  next();
});

// Post-hook for findOne operations
CartSchema.post("findOne", function (doc: any, next: any) {
  if (doc && doc.items) {
    // Calculate total cost
    doc.totalCost = doc.items.reduce((total: number, item: any) => {
      if (item.productId && item.productId.price && item.quantity) {
        return total + item.productId.price * item.quantity;
      }
      return total;
    }, 0);

    // Add totalCost to the document
    doc.totalCost = doc.totalCost || 0;
  }
  next();
});

// Post-hook for findOneAndUpdate operations
CartSchema.post("findOneAndUpdate", function (doc: any, next: any) {
  if (doc && doc.items) {
    // Calculate total cost
    doc.totalCost = doc.items.reduce((total: number, item: any) => {
      if (item.productId && item.productId.price && item.quantity) {
        return total + item.productId.price * item.quantity;
      }
      return total;
    }, 0);

    // Add totalCost to the document
    doc.totalCost = doc.totalCost || 0;
  }
  next();
});

export const Cart = model<ICart>("Cart", CartSchema);
