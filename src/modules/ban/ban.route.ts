import express, { Router } from "express";
import {
  banUserController,
  unbanUserController,
  getBanHistoryController,
  getActiveBansController,
} from "./ban.controller";
import { authorize } from "../../Middleware/authrization/authrization.middleware";
import { userActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { BanUserDto, UnbanUserDto } from "./DTO/ban.dto";

const router: Router = express.Router();

// Ban a user (admin only)
router.post(
  "/ban-user",
  authorize(["admin", "super"]),
  validationMiddleware(BanUserDto),
  userActivityMiddleware("created"),
  banUserController
);

// Unban a user (admin only)
router.post(
  "/unban-user",
  authorize(["admin", "super"]),
  validationMiddleware(UnbanUserDto),
  userActivityMiddleware("updated"),
  unbanUserController
);

// Get user's ban history (admin only)
router.get(
  "/ban-history/:userId",
  authorize(["admin", "super"]),
  userActivityMiddleware("viewed"),
  getBanHistoryController
);

// Get all active bans (admin only)
router.get(
  "/active-bans",
  authorize(["admin", "super"]),
  userActivityMiddleware("viewed"),
  getActiveBansController
);

export default router;
