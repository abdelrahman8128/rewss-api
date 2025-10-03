import { Request, Response } from "express";
import { CartService } from "../service/cart.service";

const service = new CartService();

export const getCartByIdController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    const { id } = req.params as { id: string };

    const cart = await service.getCartById(userId, id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    return res.status(200).json({ message: "Cart fetched successfully", cart });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err?.message || "Failed to get cart" });
  }
};
