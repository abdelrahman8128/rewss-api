import { Router } from "express";
import {
  getUserController,
  toggleFavoritesController,
  listFavoritesController,
} from "./user.controller";
import { authMiddleware } from "../../Middleware/authrization/authrization.middleware";
import { userActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";

const router = Router();

// Get user data
router.get(
  "/profile",
  authMiddleware,
  getUserController
);

// Toggle favorites (add if not present, remove if present)
router.put(
  "/favorites/:adId",
  authMiddleware,
  toggleFavoritesController
);

// List favorites
router.get(
  "/favorites",
  authMiddleware,
  listFavoritesController
);

export default router;
