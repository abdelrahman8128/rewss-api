"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCartsController = void 0;
const cart_service_1 = require("../service/cart.service");
const cartService = new cart_service_1.CartService();
const listCartsController = async (req, res) => {
    try {
        const userId = req.user._id?.toString?.() || req.user.id || req.user.userId;
        const carts = await cartService.listCarts(userId);
        return res.status(200).json({ carts });
    }
    catch (error) {
        return res
            .status(400)
            .json({ message: error.message || "Failed to list carts" });
    }
};
exports.listCartsController = listCartsController;
