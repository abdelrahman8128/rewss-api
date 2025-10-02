import { Request, Response } from "express";
import { CartService } from "../service/cart.service";

const cartService = new CartService();

export const listCartsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id?.toString?.() || req.user.id || req.user.userId;
    const carts = await cartService.listCarts(userId);
    return res
      .status(200)
      .json({ message: "Carts fetched successfully", carts });
  } catch (error: any) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to list carts" });
  }
};
