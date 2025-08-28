import express, { Router } from "express";
import {
  createSellerController,
  changeAdStatusController,
  listAdminAdsController,
} from "./admin.controller";
import { authorize } from "../../Middleware/authrization/authrization.middleware";
import { userActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";

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

export default router;
