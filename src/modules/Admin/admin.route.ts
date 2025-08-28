import express, { Router } from "express";
import { createSellerController } from "./admin.controller";
import { authorize } from "../../Middleware/authrization/authrization.middleware";
import { userActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";

const router: Router = express.Router();

router.post(
  "/create-seller",
  authorize(["admin", "super"]),
  userActivityMiddleware("created"),
  createSellerController
);

export default router;
