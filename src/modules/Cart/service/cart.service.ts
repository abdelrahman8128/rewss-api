import { Cart, ICart } from "../../../Schema/cart/cart.schema";

export class CartService {
  async createCart(cart: ICart) {
    const newCart = new Cart(cart);
    const savedCart = await newCart.save();
    return savedCart;
  }
}
