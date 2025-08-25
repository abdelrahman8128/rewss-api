import { StockService } from "../service/stock.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import Ad from "../../../Schema/Ad/ad.schema";

/**
 * Comprehensive stock update for sellers
 * 
 * @description Allows sellers to update all stock data in a single API call
 * @route PUT /stock/seller/ad/:adId
 * @param {string} adId - The MongoDB ObjectId of the ad (URL parameter)
 * 
 * @requestBody {
 *   "availableQuantity": 150,     // Optional: Available quantity (>= 0)
 *   "reservedQuantity": 10,       // Optional: Reserved quantity (>= 0)
 *   "soldQuantity": 8,            // Optional: Sold quantity (>= 0)
 *   "minimumOrderQuantity": 5,    // Optional: Minimum order quantity (>= 1)
 *   "reason": "Inventory update"  // Optional: Reason for update
 * }
 * 
 * @note Status is automatically updated based on availableQuantity and minimumOrderQuantity
 * @note At least one quantity field must be provided
 * 
 * @returns {Object} Updated stock information with activity log
 * 
 * @example
 * // Request: PUT /stock/seller/ad/64a7b8c9d4e5f6789a0b1c2d
 * // Body:
 * {
 *   "availableQuantity": 150,
 *   "minimumOrderQuantity": 5,
 *   "reason": "Monthly inventory update"
 * }
 * 
 * // Response:
 * {
 *   "code": 200,
 *   "status": "Success",
 *   "message": "Stock updated successfully",
 *   "data": {
 *     "_id": "64a7b8c9d4e5f6789a0b1c2e",
 *     "adId": "64a7b8c9d4e5f6789a0b1c2d",
 *     "availableQuantity": 150,
 *     "reservedQuantity": 10,
 *     "soldQuantity": 8,
 *     "minimumOrderQuantity": 5,
 *     "status": "available",
 *     "createdAt": "2023-07-07T10:30:00.000Z",
 *     "updatedAt": "2023-07-07T16:20:00.000Z"
 *   }
 * }
 */
export const sellerUpdateStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stockService = new StockService();

  const { adId } = req.params;
  const { availableQuantity, reservedQuantity, soldQuantity, minimumOrderQuantity, reason } = req.body;
  const userId = (req as any).user._id;

  // Validate that at least one field is provided
  if (availableQuantity === undefined && reservedQuantity === undefined && 
      soldQuantity === undefined && minimumOrderQuantity === undefined) {
    res.status(StatusCodes.BAD_REQUEST).json({
      code: StatusCodes.BAD_REQUEST,
      status: "Bad Request",
      message: "At least one quantity field must be provided"
    });
    return;
  }

  // Check if ad exists and belongs to the seller
  const ad = await Ad.findById(adId);
  if (!ad) {
    res.status(StatusCodes.NOT_FOUND).json({
      code: StatusCodes.NOT_FOUND,
      status: "Not Found",
      message: "Ad not found"
    });
    return;
  }

  // Check if the ad belongs to the current user (seller)
  if (ad.userId.toString() !== userId.toString()) {
    res.status(StatusCodes.FORBIDDEN).json({
      code: StatusCodes.FORBIDDEN,
      status: "Forbidden",
      message: "You can only update stock for your own ads"
    });
    return;
  }

  if (!ad.stock) {
    res.status(StatusCodes.NOT_FOUND).json({
      code: StatusCodes.NOT_FOUND,
      status: "Not Found",
      message: "No stock record found for this ad"
    });
    return;
  }

  // Prepare adjustment data
  const adjustments = { 
    availableQuantity, 
    reservedQuantity, 
    soldQuantity,
    minimumOrderQuantity
  };

  const updatedStock = await stockService.adjustStock(ad.stock, adjustments, {
    userId,
    action: "adjusted",
    description: `Stock updated by seller for ad: ${ad.title}`,
    reason: reason || "Seller stock update",
    metadata: { 
      adTitle: ad.title, 
      adjustments,
      sellerUpdate: true 
    },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(StatusCodes.OK).json({
    code: StatusCodes.OK,
    status: "Success",
    message: "Stock updated successfully",
    data: updatedStock
  });
});
