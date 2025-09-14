import express, { Router } from "express";
import {
  createSellerController,
  changeAdStatusController,
  listAdminAdsController,
} from "./admin.controller";
import { getPendingSellersController } from "./controllers/get-pending-sellers.controller";
import { searchUsersController } from "../user/user.controller";
import {
  banUserController,
  unbanUserController,
  getBanHistoryController,
  getActiveBansController,
} from "../ban/ban.controller";
import { authorize } from "../../Middleware/authrization/authrization.middleware";
import { userActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { BanUserDto, UnbanUserDto } from "../ban/DTO/ban.dto";
import { SearchUsersDto } from "../user/DTO/search.users.dto";

const router: Router = express.Router();

router.post(
  "/create-seller",
  authorize(["admin", "super"]),
  userActivityMiddleware("created"),
  createSellerController
);

router.patch(
  "/ad/:id/status",
  authorize(["admin", "super"]),
  userActivityMiddleware("updated"),
  changeAdStatusController
);

router.get(
  "/ads",
  authorize(["admin", "super"]),
  userActivityMiddleware("viewed"),
  listAdminAdsController
);

// Search users with filters (admin only)
router.get(
  "/search-users",
  authorize(["admin", "super"]),
  validationMiddleware(SearchUsersDto),
  userActivityMiddleware("viewed"),
  searchUsersController
);

// Ban management routes
router.post(
  "/ban-user",
  authorize(["admin", "super"]),
  validationMiddleware(BanUserDto),
  userActivityMiddleware("created"),
  banUserController
);

router.post(
  "/unban-user",
  authorize(["admin", "super"]),
  validationMiddleware(UnbanUserDto),
  userActivityMiddleware("updated"),
  unbanUserController
);

router.get(
  "/ban-history/:userId",
  authorize(["admin", "super"]),
  userActivityMiddleware("viewed"),
  getBanHistoryController
);

router.get(
  "/active-bans",
  authorize(["admin", "super"]),
  userActivityMiddleware("viewed"),
  getActiveBansController
);

// Get pending sellers for admin review
router.get(
  "/pending-sellers",
  authorize(["admin", "super"]),
  userActivityMiddleware("viewed"),
  getPendingSellersController
);

export default router;
