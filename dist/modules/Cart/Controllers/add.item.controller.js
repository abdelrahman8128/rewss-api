"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addItemToCartController = void 0;
const cart_service_1 = require("../service/cart.service");
const service = new cart_service_1.CartService();
const addItemToCartController = async (req, res) => {
    try {
        const userId = req.user?._id?.toString();
        const { adId, quantity } = req.body || {};
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        if (!adId)
            return res.status(400).json({ message: "adId is required" });
        const qty = Number(quantity ?? 1);
        if (!Number.isFinite(qty) || qty < 1) {
            return res.status(400).json({ message: "quantity must be >= 1" });
        }
        const cart = await service.addItem(userId, adId, qty);
        return res.status(200).json(cart);
    }
    catch (err) {
        const message = err?.message || "Failed to add item to cart";
        const status = message.includes("not found") || message.includes("not active")
            ? 404
            : 400;
        return res.status(status).json({ message });
    }
};
exports.addItemToCartController = addItemToCartController;
