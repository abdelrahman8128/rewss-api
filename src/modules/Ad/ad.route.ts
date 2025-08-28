import {
  createAdController,
  updateAdController,
  listAdController,
} from "./ad.controller";
import express, { Router } from "express";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { CreateAdDto } from "./DTO/create.ad.dto";

import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";
import { adActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";

const router: Router = express.Router();

//router.get("/list-ads", listAd);
router.post(
  "/create-ad",
  authorize(["admin"]),
  validationMiddleware(CreateAdDto),
  adActivityMiddleware("created"),
  createAdController
);

router.patch(
  "/update-ad/:id",
  authorize(["admin", "seller"]),
  validationMiddleware(CreateAdDto, true),
  adActivityMiddleware("updated"),
  updateAdController
);

// List ads
router.get("/", adActivityMiddleware("list_viewed"), listAdController);
// router.delete("/delete-ad/:id", authorize(["admin"]), deleteAd);

export default router;
