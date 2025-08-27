import { Router } from "express";
import { getUserActivityHistoryController } from "./activity-log.controller";
// Removed stats and recent controllers
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";

const router = Router();

// Get user's activity history with filtering and pagination
router.get("/history", authMiddleware, getUserActivityHistoryController);
// Admin: get activity history for a specific user
router.get(
  "/history/:userId",
  authorize(["admin"]),
  getUserActivityHistoryController
);

// Removed /stats and /recent endpoints

// Removed entity and cleanup routes

export default router;
