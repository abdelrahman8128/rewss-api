import { StockService } from "../service/stock.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import Ad from "../../../Schema/Ad/ad.schema";

/**
 * Buy reserved stock units for an ad
 * 
 * @description Converts specified quantity from reserved to bought stock (completes the purchase)
 * @route POST /stock/ad/:adId/buy
 * @param {string} adId - The MongoDB ObjectId of the ad (URL parameter)
 * 
 * @requestBody {
 *   "quantity": 3,        // Required: Number of reserved units to buy (> 0)
 *   "orderId": "ORD123", // Optional: Order ID for tracking
 *   "reason": "Order completion"  // Optional: Reason for purchase
 * }
 * 
 * @returns {Object} Updated stock information with activity log
 * 
 * @example
 * // Request: POST /stock/ad/64a7b8c9d4e5f6789a0b1c2d/buy
 * // Body:
 * {
 *   "quantity": 3,
 *   "orderId": "ORD-2023-001",
 *   "reason": "Customer payment completed"
 * }
 * 
 * // Response:
 * {
 *   "code": 200,
 *   "status": "Success",
 *   "message": "Successfully bought 3 units",
 *   "data": {
 *     "_id": "64a7b8c9d4e5f6789a0b1c2e",
 *     "adId": "64a7b8c9d4e5f6789a0b1c2d",
 *     "available": 45,
 *     "reserved": 12,
 *     "bought": 11,
 *     "updatedAt": "2023-07-07T17:15:00.000Z"
 *   }
 * }
 */
export const buyStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stockService = new StockService();

  const { adId } = req.params;
  const { quantity, orderId, reason } = req.body;
  const userId = (req as any).user._id;

  if (!quantity || quantity <= 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      code: StatusCodes.BAD_REQUEST,
      status: "Bad Request",
      message: "Valid quantity is required"
    });
    return;
  }

  const ad = await Ad.findById(adId);
  if (!ad) {
    res.status(StatusCodes.NOT_FOUND).json({
      code: StatusCodes.NOT_FOUND,
      status: "Not Found",
      message: "Ad not found"
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

  const updatedStock = await stockService.buyStock(
    ad.stock,
    quantity,
    {
      userId,
      action: "bought",
      description: `Bought ${quantity} units for ad: ${ad.title}`,
      reason: reason || "Order completion",
      metadata: { adTitle: ad.title, quantity, orderId },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    }
  );

  res.status(StatusCodes.OK).json({
    code: StatusCodes.OK,
    status: "Success",
    message: `Successfully bought ${quantity} units`,
    data: updatedStock
  });
});
