import { Router } from "express";
import {
  getUserActivityHistoryController,
  getUserActivityStatsController,
  getRecentActivitiesController,
  getActivitiesByEntityController,
  logCustomActivityController,
  cleanupOldLogsController
} from "./activity-log.controller";
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";

const router = Router();

// Get user's activity history with filtering and pagination
router.get("/history", authMiddleware, getUserActivityHistoryController);

// Get user's activity statistics
router.get("/stats", authMiddleware, getUserActivityStatsController);

// Get recent activities for dashboard
router.get("/recent", authMiddleware, getRecentActivitiesController);

// Get activities by entity type
router.get("/entity/:entityType", authMiddleware, getActivitiesByEntityController);

// Log a custom activity
router.post("/log", authMiddleware, logCustomActivityController);

// Clean up old logs (admin only)
router.delete("/cleanup", authorize(["admin"]), cleanupOldLogsController);

export default router;
