import { Request, Response } from "express";
import { CartService } from "../service/cart.service";

const service = new CartService();

export const updateCartItemQuantityController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?._id?.toString();
    const { adId, quantity } = req.body || {};

    if (!adId) return res.status(400).json({ message: "adId is required" });
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ message: "quantity must be >= 1" });
    }

    const cart = await service.updateItemQuantity(userId, adId, qty);
    return res.status(200).json(cart);
  } catch (err: any) {
    const message = err?.message || "Failed to update item quantity";
    const status = message.includes("not found") ? 404 : 400;
    return res.status(status).json({ message });
  }
};

