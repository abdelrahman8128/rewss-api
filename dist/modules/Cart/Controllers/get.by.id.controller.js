"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartByIdController = void 0;
const cart_service_1 = require("../service/cart.service");
const service = new cart_service_1.CartService();
const getCartByIdController = async (req, res) => {
    try {
        const userId = req.user?._id?.toString();
        const { id } = req.params;
        const cart = await service.getCartById(userId, id);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        return res.status(200).json({ message: "Cart fetched successfully", cart });
    }
    catch (err) {
        return res
            .status(500)
            .json({ message: err?.message || "Failed to get cart" });
    }
};
exports.getCartByIdController = getCartByIdController;
