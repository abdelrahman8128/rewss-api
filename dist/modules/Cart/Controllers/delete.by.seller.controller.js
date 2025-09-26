"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCartBySellerController = void 0;
const cart_service_1 = require("../service/cart.service");
const cartService = new cart_service_1.CartService();
const deleteCartBySellerController = async (req, res) => {
    try {
        const userId = req.user._id?.toString?.() || req.user.id || req.user.userId;
        const { sellerId } = req.query;
        if (!sellerId) {
            return res.status(400).json({ message: "sellerId is required" });
        }
        await cartService.deleteCartBySeller(userId, String(sellerId));
        return res.status(200).json({ message: "Cart deleted" });
    }
    catch (error) {
        return res
            .status(400)
            .json({ message: error.message || "Failed to delete cart by seller" });
    }
};
exports.deleteCartBySellerController = deleteCartBySellerController;
