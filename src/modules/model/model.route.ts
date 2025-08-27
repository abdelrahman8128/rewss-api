import {
  createModelController,
  listModelController,
  deleteModelController,
  updateModelController,
  listModelByBrandController,
} from "./model.controller";
import express, { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { CreateModelDto } from "./Dto/create.model.dto";
import { genericActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";

const router: Router = express.Router();

router.get(
  "/list-model",
  genericActivityMiddleware("other", "list_viewed"),
  listModelController
);
router.get(
  "/list-model-by-brand/:brandId",
  genericActivityMiddleware("other", "list_viewed"),
  listModelByBrandController
);
router.post(
  "/create-model",
  authorize(["admin"]),
  validationMiddleware(CreateModelDto),
  genericActivityMiddleware("other", "created"),
  createModelController
);
router.patch(
  "/update-model/:id",
  authorize(["admin"]),
  genericActivityMiddleware("other", "updated"),
  updateModelController
);
router.delete(
  "/delete-model/:id",
  authorize(["admin"]),
  genericActivityMiddleware("other", "deleted"),
  deleteModelController
);

export default router;
