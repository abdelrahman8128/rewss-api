"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartBySellerController = void 0;
const cart_service_1 = require("../service/cart.service");
const cartService = new cart_service_1.CartService();
const getCartBySellerController = async (req, res) => {
    try {
        const userId = req.user._id?.toString?.() || req.user.id || req.user.userId;
        const { sellerId } = req.query;
        if (!sellerId) {
            return res.status(400).json({ message: "sellerId is required" });
        }
        const cart = await cartService.getCartBySeller(userId, String(sellerId));
        return res.status(200).json({ cart });
    }
    catch (error) {
        return res
            .status(400)
            .json({ message: error.message || "Failed to get cart by seller" });
    }
};
exports.getCartBySellerController = getCartBySellerController;
