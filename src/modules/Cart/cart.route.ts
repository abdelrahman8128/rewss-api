import { Router } from "express";
import { authMiddleware } from "../../Middleware/authrization/authrization.middleware";
import {
  addItemToCartController,
  updateCartItemQuantityController,
  removeItemFromCartController,
  getLastCartController,
  listCartsController,
  getCartBySellerController,
  deleteCartBySellerController,
  getCartByIdController,
} from "./cart.controller";

const router = Router();

// List all carts for a user
router.get("/", authMiddleware, listCartsController);
// Get latest cart (fallback/compat)
router.get("/latest", authMiddleware, getLastCartController);
// Get a cart for a specific seller: /cart/by-seller?sellerId=...
router.get("/by-seller", authMiddleware, getCartBySellerController);
// Get a cart by id
router.get(":id", authMiddleware, getCartByIdController);
router.post("/item", authMiddleware, addItemToCartController);
router.patch("/item", authMiddleware, updateCartItemQuantityController);
router.delete("/item/:AdId", authMiddleware, removeItemFromCartController);
// Delete a cart by seller: /cart/by-seller?sellerId=...
router.delete("/by-seller", authMiddleware, deleteCartBySellerController);
// Remove item from a specific cart by id

export default router;
