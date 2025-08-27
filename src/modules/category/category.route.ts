import {
  createCategory,
  updateCategoryController,
  deleteCategoryController,
  listCategoryController,
} from "./category.controller";
import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { CreateCategoryDto } from "./Dto/category.dto";
import { genericActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";

const router: Router = Router();

router.post(
  "/create-category",
  authorize(["admin"]),
  validationMiddleware(CreateCategoryDto),
  genericActivityMiddleware("other", "created"),
  createCategory
);
router.patch(
  "/update-category/:id",
  authorize(["admin"]),
  validationMiddleware(CreateCategoryDto, true),
  genericActivityMiddleware("other", "updated"),
  updateCategoryController
);
router.delete(
  "/delete-category/:id",
  authorize(["admin"]),
  genericActivityMiddleware("other", "deleted"),
  deleteCategoryController
);

//router.get("/category/:id", getCategoryByIdController);

router.get(
  "/list-category",
  genericActivityMiddleware("other", "list_viewed"),
  listCategoryController
);

export default router;
