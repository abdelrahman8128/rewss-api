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
