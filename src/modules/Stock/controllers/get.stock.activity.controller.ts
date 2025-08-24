import { StockService } from "../service/stock.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import Ad from "../../../Schema/Ad/ad.schema";

/**
 * Get stock activity history for an ad
 * 
 * @description Retrieves the complete activity log for stock operations on a specific ad
 * @route GET /stock/ad/:adId/activity
 * @param {string} adId - The MongoDB ObjectId of the ad (URL parameter)
 * @param {number} limit - Optional query parameter: Maximum number of activities to return (default: 50)
 * @param {number} offset - Optional query parameter: Number of activities to skip for pagination (default: 0)
 * 
 * @returns {Object} Activity log with pagination information
 * 
 * @example
 * // Request: GET /stock/ad/64a7b8c9d4e5f6789a0b1c2d/activity?limit=10&offset=0
 * 
 * // Response:
 * {
 *   "code": 200,
 *   "status": "Success",
 *   "data": {
 *     "activities": [
 *       {
 *         "_id": "64a7b8c9d4e5f6789a0b1c2f",
 *         "stockId": "64a7b8c9d4e5f6789a0b1c2e",
 *         "userId": "64a7b8c9d4e5f6789a0b1c30",
 *         "action": "reserved",
 *         "description": "Reserved 5 units for ad: iPhone 14 Pro",
 *         "reason": "Customer order",
 *         "changes": {
 *           "available": { "before": 50, "after": 45 },
 *           "reserved": { "before": 10, "after": 15 }
 *         },
 *         "metadata": {
 *           "adTitle": "iPhone 14 Pro",
 *           "quantity": 5,
 *           "orderId": "ORD-2023-001"
 *         },
 *         "createdAt": "2023-07-07T16:30:00.000Z"
 *       }
 *     ],
 *     "pagination": {
 *       "limit": 10,
 *       "offset": 0,
 *       "total": 1
 *     }
 *   }
 * }
 */
export const getStockActivity = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stockService = new StockService();

  const { adId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  const ad = await Ad.findById(adId);
  if (!ad || !ad.stock) {
    res.status(StatusCodes.NOT_FOUND).json({
      code: StatusCodes.NOT_FOUND,
      status: "Not Found",
      message: "Ad or stock not found"
    });
    return;
  }

  const activities = await stockService.getStockActivity(ad.stock, limit, offset);

  res.status(StatusCodes.OK).json({
    code: StatusCodes.OK,
    status: "Success",
    data: {
      activities,
      pagination: {
        limit,
        offset,
        total: activities.length
      }
    }
  });
});
