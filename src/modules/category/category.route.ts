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

const router: Router = Router();

router.post(
  "/create-category",
  authorize(["admin"]),
  validationMiddleware(CreateCategoryDto),
  createCategory
);
router.patch(
  "/update-category/:id",
  authorize(["admin"]),
  validationMiddleware(CreateCategoryDto, true),
  updateCategoryController
);
router.delete(
  "/delete-category/:id",
  authorize(["admin"]),
  deleteCategoryController
);

//router.get("/category/:id", getCategoryByIdController);

router.get("/list-category", listCategoryController);

export default router;
