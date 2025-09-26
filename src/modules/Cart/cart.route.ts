import { Router } from "express";
import { authMiddleware } from "../../Middleware/authrization/authrization.middleware";
import {
  addItemToCartController,
  updateCartItemQuantityController,
  removeItemFromCartController,
  getCartController,
  listCartsController,
  getCartBySellerController,
  deleteCartBySellerController,
} from "./cart.controller";

const router = Router();

// List all carts for a user
router.get("/", authMiddleware, listCartsController);
// Get latest cart (fallback/compat)
router.get("/latest", authMiddleware, getCartController);
// Get a cart for a specific seller: /cart/by-seller?sellerId=...
router.get("/by-seller", authMiddleware, getCartBySellerController);
router.post("/item", authMiddleware, addItemToCartController);
router.patch("/item", authMiddleware, updateCartItemQuantityController);
router.delete("/item", authMiddleware, removeItemFromCartController);
// Delete a cart by seller: /cart/by-seller?sellerId=...
router.delete("/by-seller", authMiddleware, deleteCartBySellerController);

export default router;
