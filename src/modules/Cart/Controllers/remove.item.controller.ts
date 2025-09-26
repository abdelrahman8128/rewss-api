import { Request, Response } from "express";
import { CartService } from "../service/cart.service";

const service = new CartService();

export const removeItemFromCartController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?._id?.toString();
    const { adId } = req.body || {};

    if (!adId) return res.status(400).json({ message: "adId is required" });

    const cart = await service.removeItem(userId, adId);
    return res.status(200).json(cart);
  } catch (err: any) {
    const message = err?.message || "Failed to remove item from cart";
    const status = message.includes("not found") ? 404 : 400;
    return res.status(status).json({ message });
  }
};
