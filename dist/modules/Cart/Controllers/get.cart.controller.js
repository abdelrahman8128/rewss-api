"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartController = void 0;
const cart_service_1 = require("../service/cart.service");
const service = new cart_service_1.CartService();
const getCartController = async (req, res) => {
    try {
        const userId = req.user?._id?.toString();
        const cart = await service.getCart(userId);
        return res.status(200).json(cart);
    }
    catch (err) {
        return res
            .status(500)
            .json({ message: err?.message || "Failed to get cart" });
    }
};
exports.getCartController = getCartController;
