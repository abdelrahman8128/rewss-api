import { StockService } from "../service/stock.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import Ad from "../../../Schema/Ad/ad.schema";

/**
 * Adjust stock quantities for an ad
 * 
 * @description Manually adjusts stock quantities (available, reserved, bought) for a specific ad
 * @route PUT /stock/ad/:adId/adjust
 * @param {string} adId - The MongoDB ObjectId of the ad (URL parameter)
 * 
 * @requestBody {
 *   "available": 150,     // Optional: New available quantity (>= 0)
 *   "reserved": 10,      // Optional: New reserved quantity (>= 0)
 *   "bought": 8,         // Optional: New bought quantity (>= 0)
 *   "reason": "Inventory recount"  // Optional: Reason for adjustment
 * }
 * 
 * @note At least one quantity field (available, reserved, or bought) must be provided
 * 
 * @returns {Object} Updated stock information with activity log
 * 
 * @example
 * // Request: PUT /stock/ad/64a7b8c9d4e5f6789a0b1c2d/adjust
 * // Body:
 * {
 *   "available": 150,
 *   "reserved": 10,
 *   "reason": "Inventory recount after audit"
 * }
 * 
 * // Response:
 * {
 *   "code": 200,
 *   "status": "Success",
 *   "message": "Stock adjusted successfully",
 *   "data": {
 *     "_id": "64a7b8c9d4e5f6789a0b1c2e",
 *     "adId": "64a7b8c9d4e5f6789a0b1c2d",
 *     "available": 150,
 *     "reserved": 10,
 *     "bought": 8,
 *     "createdAt": "2023-07-07T10:30:00.000Z",
 *     "updatedAt": "2023-07-07T16:20:00.000Z"
 *   }
 * }
 */
export const adjustStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stockService = new StockService();

  const { adId } = req.params;
  const { available, reserved, bought, reason } = req.body;
  const userId = (req as any).user._id;

  // Validate that at least one field is provided
  if (available === undefined && reserved === undefined && bought === undefined) {
    res.status(StatusCodes.BAD_REQUEST).json({
      code: StatusCodes.BAD_REQUEST,
      status: "Bad Request",
      message: "At least one quantity field (available, reserved, bought) must be provided"
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

  const adjustments = { available, reserved, bought };
  const updatedStock = await stockService.adjustStock(ad.stock, adjustments, {
    userId,
    action: "adjusted",
    description: `Stock adjusted for ad: ${ad.title}`,
    reason: reason || "Manual adjustment",
    metadata: { adTitle: ad.title, adjustments },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(StatusCodes.OK).json({
    code: StatusCodes.OK,
    status: "Success",
    message: "Stock adjusted successfully",
    data: updatedStock
  });
});
