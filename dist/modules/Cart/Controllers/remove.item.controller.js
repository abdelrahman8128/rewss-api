"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeItemFromCartController = void 0;
const cart_service_1 = require("../service/cart.service");
const service = new cart_service_1.CartService();
const removeItemFromCartController = async (req, res) => {
    try {
        const userId = req.user?._id?.toString();
        const { adId } = req.body || {};
        if (!adId)
            return res.status(400).json({ message: "adId is required" });
        const cart = await service.removeItem(userId, adId);
        return res.status(200).json({ message: "Item removed from cart", cart });
    }
    catch (err) {
        const message = err?.message || "Failed to remove item from cart";
        const status = message.includes("not found") ? 404 : 400;
        return res.status(status).json({ message });
    }
};
exports.removeItemFromCartController = removeItemFromCartController;
