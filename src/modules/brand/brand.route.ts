import {
  createBrand,
  listBrand,
  updateBrand,
  deleteBrand,
} from "./brand.controller";
import express, { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { CreateBrandDto } from "./Dto/create.brand.dto";
import { genericActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";

const router: Router = express.Router();
router.get(
  "/list-brands",
  genericActivityMiddleware("other", "list_viewed"),
  listBrand
);
router.post(
  "/create-brand",
  authorize(["admin"]),
  validationMiddleware(CreateBrandDto),
  genericActivityMiddleware("other", "created"),
  createBrand
);
router.patch(
  "/update-brand/:id",
  authorize(["admin"]),
  validationMiddleware(CreateBrandDto, true),
  genericActivityMiddleware("other", "updated"),
  updateBrand
);
router.delete(
  "/delete-brand/:id",
  authorize(["admin"]),
  genericActivityMiddleware("other", "deleted"),
  deleteBrand
);

export default router;
