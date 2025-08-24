import { StockService } from "../service/stock.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import Ad from "../../../Schema/Ad/ad.schema";

/**
 * Reserve stock units for an ad
 * 
 * @description Moves specified quantity from available to reserved stock for order processing
 * @route POST /stock/ad/:adId/reserve
 * @param {string} adId - The MongoDB ObjectId of the ad (URL parameter)
 * 
 * @requestBody {
 *   "quantity": 5,        // Required: Number of units to reserve (> 0)
 *   "orderId": "ORD123", // Optional: Order ID for tracking
 *   "reason": "Customer order"  // Optional: Reason for reservation
 * }
 * 
 * @returns {Object} Updated stock information with activity log
 * 
 * @example
 * // Request: POST /stock/ad/64a7b8c9d4e5f6789a0b1c2d/reserve
 * // Body:
 * {
 *   "quantity": 5,
 *   "orderId": "ORD-2023-001",
 *   "reason": "Customer purchase order"
 * }
 * 
 * // Response:
 * {
 *   "code": 200,
 *   "status": "Success",
 *   "message": "Successfully reserved 5 units",
 *   "data": {
 *     "_id": "64a7b8c9d4e5f6789a0b1c2e",
 *     "adId": "64a7b8c9d4e5f6789a0b1c2d",
 *     "available": 45,
 *     "reserved": 15,
 *     "bought": 8,
 *     "updatedAt": "2023-07-07T16:30:00.000Z"
 *   }
 * }
 */
export const reserveStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

  const updatedStock = await stockService.reserveStock(
    ad.stock,
    quantity,
    {
      userId,
      action: "reserved",
      description: `Reserved ${quantity} units for ad: ${ad.title}`,
      reason: reason || "Order placement",
      metadata: { adTitle: ad.title, quantity, orderId },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    }
  );

  res.status(StatusCodes.OK).json({
    code: StatusCodes.OK,
    status: "Success",
    message: `Successfully reserved ${quantity} units`,
    data: updatedStock
  });
});
