import { createBrand } from "./brand.controller";
import express, { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";
import { createBrandValidationRules } from "./middleware/create.brand.middleware";

const router: Router = express.Router();
router.post("/create-brand", createBrandValidationRules, createBrand);

export default router;
