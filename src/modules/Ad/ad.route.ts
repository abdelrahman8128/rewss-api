import { createAdController,updateAdController } from "./ad.controller";
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

// Get ad details
router.get(
  "/:id",
  authMiddleware,
  adActivityMiddleware("viewed"),
  (req: any, res: any) => {
    res.status(501).json({ success: false, message: "Get ad endpoint not implemented yet" });
  }
);

// List ads
router.get(
  "/",
  authMiddleware,
  adActivityMiddleware("list_viewed"),
  (req: any, res: any) => {
    res.status(501).json({ success: false, message: "List ads endpoint not implemented yet" });
  }
);
// router.delete("/delete-ad/:id", authorize(["admin"]), deleteAd);

export default router;
