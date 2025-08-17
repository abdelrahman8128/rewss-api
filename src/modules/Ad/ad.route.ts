import { createAdController } from "./ad.controller";
import express, { Router } from "express";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { CreateAdDto } from "./DTO/create.ad.dto";

import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";

const router: Router = express.Router();

//router.get("/list-ads", listAd);
router.post(
  "/create-ad",
  authorize(["admin"]),
  validationMiddleware(CreateAdDto),
  createAdController
);
// router.patch(
//   "/update-ad/:id",
//   authorize(["admin"]),
//   validationMiddleware(CreateAdDto, true),
//   updateAd
// );
// router.delete("/delete-ad/:id", authorize(["admin"]), deleteAd);

export default router;
