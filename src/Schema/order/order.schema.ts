import { Schema } from "mongoose";

export type IOrderItem = {
  productId: Schema.Types.ObjectId;
  quantity: number;
  price: number;
  total: number;
};

export type IOrder = Document & {
  userId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded"
    | "failed";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: "cash" | "bank" | "mobile_money" | "card";
  paymentId?: string;
  paymentAmount: number;
  paymentCurrency: string;

  VAT?: number;
  subTotal?: number;
  total?: number;
  shippingCost?: number;
  tax?: number;

  items: IOrderItem[];
};
