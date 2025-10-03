import { Request, Response } from "express";
import { CartService } from "../service/cart.service";

const cartService = new CartService();

export const deleteCartBySellerController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user._id?.toString?.() || req.user.id || req.user.userId;
    const { sellerId } = req.query as any;

    if (!sellerId) {
      return res.status(400).json({ message: "sellerId is required" });
    }


    await cartService.deleteCartBySeller(userId, String(sellerId));
    
    return res.status(200).json({ message: "Cart deleted" });

  
  } catch (error: any) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to delete cart by seller" });
  }
};
