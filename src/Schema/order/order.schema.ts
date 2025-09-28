import { model, Schema } from "mongoose";


export interface IOrder extends Document {
  userId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  items: Schema.Types.ObjectId[];
  totalCost?: number; // Virtual field for calculated total
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [Schema.Types.ObjectId], ref: "Ad", required: true },
  totalCost: { type: Number, required: true },
});

export default model<IOrder>("Order", OrderSchema);