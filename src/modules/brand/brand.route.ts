import { createBrand, listBrand,updateBrand } from "./brand.controller";
import express, { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { CreateBrandDto } from "./Dto/create.brand";

const router: Router = express.Router();
router.post("/create-brand", validationMiddleware(CreateBrandDto), createBrand);
router.get("/list-brands", listBrand);
router.patch("/update-brand/:id", validationMiddleware(CreateBrandDto), updateBrand);

export default router;
