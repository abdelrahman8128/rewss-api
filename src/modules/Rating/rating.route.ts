import { Router } from "express";
import { RatingController } from "./rating.controller";

const router = Router();
const ratingController = new RatingController();

// Rating routes
router.post("/", ratingController.createRating.bind(ratingController));
router.get(
  "/product/:adId",
  ratingController.getProductRating.bind(ratingController)
);
router.get(
  "/seller/:sellerId",
  ratingController.getSellerRating.bind(ratingController)
);
router.get("/ad/:adId", ratingController.getRatingsByAd.bind(ratingController));
router.get(
  "/seller-ratings/:sellerId",
  ratingController.getRatingsBySeller.bind(ratingController)
);
router.get(
  "/buyer/:buyerId",
  ratingController.getRatingsByBuyer.bind(ratingController)
);
router.put("/:id", ratingController.updateRating.bind(ratingController));
router.delete("/:id", ratingController.deleteRating.bind(ratingController));

export default router;
