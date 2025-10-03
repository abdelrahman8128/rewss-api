"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeItemBySellerForUserController = void 0;
const cart_service_1 = require("../service/cart.service");
const service = new cart_service_1.CartService();
const removeItemBySellerForUserController = async (req, res) => {
    try {
        const sellerId = req.user?._id?.toString();
        const { userId, adId } = (req.body || {});
        if (!userId)
            return res.status(400).json({ message: "userId is required" });
        if (!adId)
            return res.status(400).json({ message: "adId is required" });
        const cart = await service.removeItemForUserBySeller(sellerId, userId, adId);
        return res
            .status(200)
            .json({ message: "Item removed from user's cart", cart });
    }
    catch (err) {
        const message = err?.message || "Failed to remove item from user's cart";
        const status = message.includes("authorized")
            ? 403
            : message.includes("not found")
                ? 404
                : 400;
        return res.status(status).json({ message });
    }
};
exports.removeItemBySellerForUserController = removeItemBySellerForUserController;
