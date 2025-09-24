import { Router } from "express";
import {
  getUserController,
  getUserByIdController,
  toggleFavoritesController,
  listFavoritesController,
  updateUserController,
  setSellerPhysicalAddressController,
  getPublicSellerController,
} from "./user.controller";
import { authMiddleware } from "../../Middleware/authrization/authrization.middleware";
import { userActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { UpdateUsersDto } from "./DTO/update.users.dto";
import { CreateSellerPhysicalAddressDto } from "./DTO/seller-physical-address.dto";

const router = Router();

// Get user data
router.get("/profile", authMiddleware, getUserController);

// List favorites
router.get("/favorites", authMiddleware, listFavoritesController);

// Toggle favorites (add if not present, remove if present)
router.put("/favorites/:adId", authMiddleware, toggleFavoritesController);

// Public seller profile (no auth)
router.get("/public/seller/:sellerId", getPublicSellerController);

// Get user data by ID (for viewing other user profiles)
router.get("/:userId", authMiddleware, getUserByIdController);

// Update user (user or seller)
router.patch(
  "/profile",
  authMiddleware,
  validationMiddleware(UpdateUsersDto, true),
  userActivityMiddleware("updated"),
  updateUserController
);

// Set seller physical address
router.post(
  "/seller/physical-address",
  authMiddleware,
  validationMiddleware(CreateSellerPhysicalAddressDto),
  userActivityMiddleware("created"),
  setSellerPhysicalAddressController
);

export default router;
