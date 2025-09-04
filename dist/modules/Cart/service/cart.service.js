"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const cart_schema_1 = require("../../../Schema/cart/cart.schema");
class CartService {
    async createCart(cart) {
        const newCart = new cart_schema_1.Cart(cart);
        const savedCart = await newCart.save();
        return savedCart;
    }
}
exports.CartService = CartService;
