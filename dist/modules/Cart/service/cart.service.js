"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const cart_schema_1 = require("../../../Schema/cart/cart.schema");
const user_schema_1 = __importDefault(require("../../../Schema/User/user.schema"));
const ad_schema_1 = __importDefault(require("../../../Schema/Ad/ad.schema"));
const stock_schema_1 = __importDefault(require("../../../Schema/Stock/stock.schema"));
class CartService {
    async validateAdAndStock(adId, requestedQuantity) {
        const ad = await ad_schema_1.default.findById(adId);
        if (!ad) {
            throw new Error("Product not found");
        }
        if (ad.status !== "active") {
            throw new Error("Product is not active");
        }
        if (ad.stock) {
            const stock = await stock_schema_1.default.findOne({ adId: ad._id });
            if (!stock) {
                throw new Error("Stock record not found for product");
            }
            if (requestedQuantity < stock.minimumOrderQuantity) {
                throw new Error(`Minimum order quantity is ${stock.minimumOrderQuantity}`);
            }
            if (requestedQuantity > stock.availableQuantity) {
                throw new Error("Requested quantity exceeds available stock");
            }
            if (stock.status === "out_of_stock") {
                throw new Error("Product is out of stock");
            }
        }
        else {
            if (ad.stockStatus === "out_of_stock") {
                throw new Error("Product is out of stock");
            }
        }
        return ad;
    }
    async createCart(userId, cart) {
        const user = await user_schema_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const seller = await user_schema_1.default.findById(cart.sellerId);
        if (!seller) {
            throw new Error("Seller not found");
        }
        const existingCart = await cart_schema_1.Cart.findOne({
            userId: userId,
            sellerId: cart.sellerId,
        });
        if (existingCart) {
            throw new Error("Cart already exists");
        }
        if (!cart.items || cart.items.length === 0) {
            throw new Error("Cart must contain at least one item");
        }
        const newCart = new cart_schema_1.Cart({ ...cart, userId });
        const savedCart = await newCart.save();
        const populated = await cart_schema_1.Cart.findById(savedCart._id).populate("items.productId sellerId");
        return populated;
    }
    async getCart(userId) {
        const cart = await cart_schema_1.Cart.findOne({ userId })
            .sort({ updatedAt: -1 })
            .populate("items.productId sellerId");
        return cart;
    }
    async listCarts(userId) {
        const carts = await cart_schema_1.Cart.find({ userId })
            .sort({ updatedAt: -1 })
            .populate("items.productId sellerId");
        return carts;
    }
    async getCartBySeller(userId, sellerId) {
        const cart = await cart_schema_1.Cart.findOne({ userId, sellerId })
            .sort({ updatedAt: -1 })
            .populate("items.productId sellerId");
        return cart;
    }
    async updateCart(cart) {
        const existingCart = await cart_schema_1.Cart.findOne({ userId: cart.userId });
        if (!existingCart) {
            throw new Error("Cart not found");
        }
        const updatedCart = await cart_schema_1.Cart.findOneAndUpdate({ userId: cart.userId }, cart, {
            new: true,
        }).populate("items.productId sellerId");
        return updatedCart;
    }
    async deleteCart(userId) {
        const existingCart = await cart_schema_1.Cart.findOne({ userId });
        if (!existingCart) {
            throw new Error("Cart not found");
        }
        await cart_schema_1.Cart.findOneAndDelete({ userId });
    }
    async deleteCartBySeller(userId, sellerId) {
        const existingCart = await cart_schema_1.Cart.findOne({ userId, sellerId });
        if (!existingCart) {
            throw new Error("Cart not found");
        }
        await cart_schema_1.Cart.findOneAndDelete({ userId, sellerId });
    }
    async addItem(userId, adId, quantity) {
        if (!quantity || quantity < 1) {
            throw new Error("Quantity must be at least 1");
        }
        const ad = await this.validateAdAndStock(adId, quantity);
        const sellerId = ad.userId;
        let cart = await cart_schema_1.Cart.findOne({ userId, sellerId }).sort({ updatedAt: -1 });
        if (!cart) {
            const created = new cart_schema_1.Cart({
                userId,
                sellerId,
                items: [{ productId: ad._id, quantity }],
            });
            const saved = await created.save();
            const populated = await cart_schema_1.Cart.findById(saved._id).populate("items.productId sellerId");
            return populated;
        }
        const existingItem = cart.items.find((i) => String(i.productId) === String(ad._id));
        const newQuantity = existingItem
            ? existingItem.quantity + quantity
            : quantity;
        await this.validateAdAndStock(adId, newQuantity);
        const update = existingItem
            ? { $set: { "items.$.quantity": newQuantity } }
            : { $push: { items: { productId: ad._id, quantity } } };
        const filter = existingItem
            ? { userId, sellerId, "items.productId": ad._id }
            : { userId, sellerId };
        const updated = await cart_schema_1.Cart.findOneAndUpdate(filter, update, {
            new: true,
        }).populate("items.productId sellerId");
        return updated;
    }
    async updateItemQuantity(userId, adId, quantity) {
        if (!quantity || quantity < 1) {
            throw new Error("Quantity must be at least 1");
        }
        const ad = await this.validateAdAndStock(adId, quantity);
        const sellerId = ad.userId;
        const cart = await cart_schema_1.Cart.findOne({
            userId,
            sellerId,
            "items.productId": ad._id,
        });
        if (!cart) {
            throw new Error("Cart item not found");
        }
        const updated = await cart_schema_1.Cart.findOneAndUpdate({ userId, sellerId, "items.productId": ad._id }, { $set: { "items.$.quantity": quantity } }, { new: true }).populate("items.productId sellerId");
        return updated;
    }
    async removeItem(userId, adId) {
        const ad = await ad_schema_1.default.findById(adId);
        if (!ad) {
            throw new Error("Product not found");
        }
        const sellerId = ad.userId;
        const updated = await cart_schema_1.Cart.findOneAndUpdate({ userId, sellerId }, { $pull: { items: { productId: ad._id } } }, { new: true }).populate("items.productId sellerId");
        if (!updated) {
            throw new Error("Cart not found");
        }
        return updated;
    }
}
exports.CartService = CartService;
