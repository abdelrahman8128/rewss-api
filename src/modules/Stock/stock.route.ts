import { Router } from "express";
import { 
  getStockController,
  updateStockController
} from "./stock.controller";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { StockDto } from "./DTO/stock.dto";
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";

const router = Router();

// Get stock by ad ID (for sellers and admins)
router.get("/ad/:adId", authorize(["admin", "seller"]), getStockController);

// Update stock (for sellers and admins)
router.put("/ad/:adId", authorize(["admin", "seller"]), validationMiddleware(StockDto, true), updateStockController);

export default router;
