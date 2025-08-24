import { Router } from "express";
import { 
  getStockByAdId,
  getAdWithStock,
  createStock,
  adjustStock,
  reserveStock,
  buyStock,
  getStockActivity
} from "./stock.controller";

const router = Router();

// Get stock by ad ID
router.get("/ad/:adId", getStockByAdId);

// Get ad with stock details
router.get("/ad/:adId/details", getAdWithStock);

// Adjust stock quantities
router.put("/ad/:adId/adjust", adjustStock);

// Reserve stock
router.post("/ad/:adId/reserve", reserveStock);

// Buy stock (convert reserved to bought)
router.post("/ad/:adId/buy", buyStock);

// Get stock activity history
router.get("/ad/:adId/activity", getStockActivity);

// Create stock for an ad
router.post("/ad/:adId", createStock);

export default router;
