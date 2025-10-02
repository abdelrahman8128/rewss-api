import { Request, Response } from "express";
import { CartService } from "../service/cart.service";

const service = new CartService();

export const getCartController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString();

    const cart = await service.getCart(userId);
    return res.status(200).json({ message: "Cart fetched successfully", cart });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err?.message || "Failed to get cart" });
  }
};

