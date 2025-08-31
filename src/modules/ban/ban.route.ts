import express, { Router } from "express";
import {
  banUserController,
  blockUserController,
  unbanUserController,
  getBanHistoryController,
  getActiveBansController,
} from "./ban.controller";
import { authorize } from "../../Middleware/authrization/authrization.middleware";
import { userActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { BanUserDto, UnbanUserDto } from "./DTO/ban.dto";

const router: Router = express.Router();

// Toggle user block status (admin only) - switches between blocked and active
router.post(
  "/toggle-user-block/:userId",
  authorize(["admin", "super"]),
  userActivityMiddleware("updated"),
  blockUserController
);

// Ban a user (admin only) - original ban functionality
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
