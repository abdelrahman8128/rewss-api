import {createCategory,updateCategoryController} from './category.controller';
import { Router } from 'express';   
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { CreateCategoryDto } from "./Dto/create.category.dto";

const router: Router = Router();

router.post("/create-category", validationMiddleware(CreateCategoryDto), createCategory);
router.patch("/update-category/:id", authorize(["admin"]), validationMiddleware(CreateCategoryDto,true), updateCategoryController);

export default router;
