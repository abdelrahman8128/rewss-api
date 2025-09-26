import { Cart, ICart } from "../../../Schema/cart/cart.schema";
import User from "../../../Schema/User/user.schema";
import Ad from "../../../Schema/Ad/ad.schema";
import Stock from "../../../Schema/Stock/stock.schema";

export class CartService {
  private async validateAdAndStock(adId: string, requestedQuantity: number) {
    const ad = await Ad.findById(adId);
    if (!ad) {
      throw new Error("Product not found");
    }
    if (ad.status !== "active") {
      throw new Error("Product is not active");
    }

    // If ad has stock linked, validate against it
    if (ad.stock) {
      const stock = await Stock.findOne({ adId: ad._id });
      if (!stock) {
        throw new Error("Stock record not found for product");
      }
      if (requestedQuantity < stock.minimumOrderQuantity) {
        throw new Error(
          `Minimum order quantity is ${stock.minimumOrderQuantity}`
        );
      }
      if (requestedQuantity > stock.availableQuantity) {
        throw new Error("Requested quantity exceeds available stock");
      }
      if (stock.status === "out_of_stock") {
        throw new Error("Product is out of stock");
      }
    } else {
      if (ad.stockStatus === "out_of_stock") {
        throw new Error("Product is out of stock");
      }
    }

    return ad;
  }
  async createCart(userId: string, cart: ICart) {
    // Validate that the user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate that the seller exists
    const seller = await User.findById(cart.sellerId);
    if (!seller) {
      throw new Error("Seller not found");
    }

    // Check if cart already exists for this user and seller
    const existingCart = await Cart.findOne({
      userId: userId,
      sellerId: cart.sellerId,
    });
    if (existingCart) {
      throw new Error("Cart already exists");
    }

    // Ensure the cart has items before creating
    if (!cart.items || cart.items.length === 0) {
      throw new Error("Cart must contain at least one item");
    }

    const newCart = new Cart({ ...cart, userId });
    const savedCart = await newCart.save();
    const populated = await Cart.findById(savedCart._id).populate(
      "items.productId sellerId"
    );
    return populated as any;
  }
  async getCart(userId: string) {
    const cart = await Cart.findOne({ userId })
      .sort({ updatedAt: -1 })
      .populate("items.productId sellerId");
    return cart;
  }
  async listCarts(userId: string) {
    const carts = await Cart.find({ userId })
      .sort({ updatedAt: -1 })
      .populate("items.productId sellerId");
    return carts;
  }
  async getCartBySeller(userId: string, sellerId: string) {
    const cart = await Cart.findOne({ userId, sellerId })
      .sort({ updatedAt: -1 })
      .populate("items.productId sellerId");
    return cart;
  }
  async updateCart(cart: ICart) {
    // Check if cart exists before updating
    const existingCart = await Cart.findOne({ userId: cart.userId });
    if (!existingCart) {
      throw new Error("Cart not found");
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { userId: cart.userId },
      cart,
      {
        new: true,
      }
    ).populate("items.productId sellerId");
    return updatedCart;
  }
  async deleteCart(userId: string) {
    // Check if cart exists before deleting
    const existingCart = await Cart.findOne({ userId });
    if (!existingCart) {
      throw new Error("Cart not found");
    }

    await Cart.findOneAndDelete({ userId });
  }

  async deleteCartBySeller(userId: string, sellerId: string) {
    const existingCart = await Cart.findOne({ userId, sellerId });
    if (!existingCart) {
      throw new Error("Cart not found");
    }
    await Cart.findOneAndDelete({ userId, sellerId });
  }

  async addItem(userId: string, adId: string, quantity: number) {
    if (!quantity || quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    const ad = await this.validateAdAndStock(adId, quantity);
    const sellerId = ad.userId;

    let cart = await Cart.findOne({ userId, sellerId }).sort({ updatedAt: -1 });

    if (!cart) {
      const created = new Cart({
        userId,
        sellerId,
        items: [{ productId: ad._id, quantity }],
      });
      const saved = await created.save();
      const populated = await Cart.findById(saved._id).populate(
        "items.productId sellerId"
      );
      return populated as any;
    }

    const existingItem = cart.items.find(
      (i: any) => String(i.productId) === String(ad._id)
    );
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

    const updated = await Cart.findOneAndUpdate(filter, update, {
      new: true,
    }).populate("items.productId sellerId");
    return updated as any;
  }

  async updateItemQuantity(userId: string, adId: string, quantity: number) {
    if (!quantity || quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    const ad = await this.validateAdAndStock(adId, quantity);
    const sellerId = ad.userId;

    const cart = await Cart.findOne({
      userId,
      sellerId,
      "items.productId": ad._id,
    });
    if (!cart) {
      throw new Error("Cart item not found");
    }

    const updated = await Cart.findOneAndUpdate(
      { userId, sellerId, "items.productId": ad._id },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    ).populate("items.productId sellerId");

    return updated as any;
  }

  async removeItem(userId: string, adId: string) {
    const ad = await Ad.findById(adId);
    if (!ad) {
      throw new Error("Product not found");
    }
    const sellerId = ad.userId;

    const updated = await Cart.findOneAndUpdate(
      { userId, sellerId },
      { $pull: { items: { productId: ad._id } } },
      { new: true }
    ).populate("items.productId sellerId");

    if (!updated) {
      throw new Error("Cart not found");
    }

    return updated as any;
  }
}
