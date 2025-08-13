import { createBrand, listBrand,updateBrand ,deleteBrand} from "./brand.controller";
import express, { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { CreateBrandDto } from "./Dto/create.brand.dto";


const router: Router = express.Router();
router.get("/list-brands", listBrand);
router.post("/create-brand", authorize(["admin"]), validationMiddleware(CreateBrandDto), createBrand);
router.patch("/update-brand/:id", authorize(["admin"]), validationMiddleware(CreateBrandDto,true), updateBrand);
router.delete("/delete-brand/:id", authorize(["admin"]), deleteBrand);

export default router;
