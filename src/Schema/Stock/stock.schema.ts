import { model, Schema, Document, Types } from "mongoose";

export interface IStock extends Document {
  _id: Types.ObjectId;
  adId: Types.ObjectId;
  availableQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  minimumOrderQuantity: number;
  status: 'available' | 'out_of_stock' | 'low_stock';
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
    availableQuantity: {
      type: Number,
      required: [true, "Available quantity is required"],
      min: [0, "Available quantity cannot be negative"],
      default: 0,
    },
    reservedQuantity: {
      type: Number,
      required: [true, "Reserved quantity is required"],
      min: [0, "Reserved quantity cannot be negative"],
      default: 0,
    },
    soldQuantity: {
      type: Number,
      required: [true, "Sold quantity is required"],
      min: [0, "Sold quantity cannot be negative"],
      default: 0,
    },
    minimumOrderQuantity: {
      type: Number,
      required: [true, "Minimum order quantity is required"],
      min: [0, "Minimum order quantity cannot be negative"],
      default: 1,
    },
    status: {
      type: String,
      enum: ['available', 'out_of_stock', 'low_stock'],
      default: 'available',
      required: [true, "Stock status is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to automatically update status based on availableQuantity
StockSchema.pre('save', async function(next) {
  const oldStatus = this.status;
  
  if (this.availableQuantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.availableQuantity <= 3) {
    this.status = 'low_stock';
  } else {
    this.status = 'available';
  }
  
  // Update Ad's stockStatus if stock status changed
  if (oldStatus !== this.status) {
    const Ad = model('Ad');
    await Ad.findByIdAndUpdate(this.adId, { stockStatus: this.status });
  }
  
  next();
});

export default model<IStock>("Stock", StockSchema);
