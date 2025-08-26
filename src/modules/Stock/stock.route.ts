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
import { stockActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";

const router = Router();

// Get stock by ad ID (for sellers and admins)
router.get("/ad/:adId", authorize(["admin", "seller"]), stockActivityMiddleware("viewed"), getStockController);

// Update stock (for sellers and admins)
router.put("/ad/:adId", authorize(["admin", "seller"]), validationMiddleware(StockDto, true), stockActivityMiddleware("updated"), updateStockController);

// Reserve stock
router.post("/ad/:adId/reserve", authorize(["admin", "seller", "buyer"]), stockActivityMiddleware("reserved"), (req: any, res: any) => {
  // This would be implemented in the controller
  res.status(501).json({ success: false, message: "Reserve stock endpoint not implemented yet" });
});

// Buy stock
router.post("/ad/:adId/buy", authorize(["admin", "seller", "buyer"]), stockActivityMiddleware("bought"), (req: any, res: any) => {
  // This would be implemented in the controller
  res.status(501).json({ success: false, message: "Buy stock endpoint not implemented yet" });
});

// Get stock activity history
router.get("/ad/:adId/activity", authorize(["admin", "seller"]), stockActivityMiddleware("activity_viewed"), (req: any, res: any) => {
  // This would be implemented in the controller
  res.status(501).json({ success: false, message: "Stock activity endpoint not implemented yet" });
});

export default router;
