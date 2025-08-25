import { StockService } from "../service/stock.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import { Types } from "mongoose";

/**
 * Get stock information for a specific ad
 * 
 * @description Retrieves the stock details (available, reserved, bought quantities) for a specific ad
 * @route GET /stock/ad/:adId
 * @param {string} adId - The MongoDB ObjectId of the ad (URL parameter)
 * 
 * @returns {Object} Stock information including:
 *   - available: Number of available units
 *   - reserved: Number of reserved units
 *   - bought: Number of bought units
 *   - adId: Reference to the associated ad
 *   - createdAt: Stock creation timestamp
 *   - updatedAt: Last update timestamp
 * 
 * @example
 * // Request: GET /stock/ad/64a7b8c9d4e5f6789a0b1c2d
 * // Response:
 * {
 *   "message": "Stock retrieved successfully",
 *   "data": {
 *     "_id": "64a7b8c9d4e5f6789a0b1c2e",
 *     "adId": "64a7b8c9d4e5f6789a0b1c2d",
 *     "available": 50,
 *     "reserved": 10,
 *     "bought": 5,
 *     "createdAt": "2023-07-07T10:30:00.000Z",
 *     "updatedAt": "2023-07-07T15:45:00.000Z"
 *   }
 * }
 */
export const getStockController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stockService = new StockService();

  try {
    const stock = await stockService.getStockByAd(req);
    res.status(StatusCodes.OK).json({
      message: "Stock retrieved successfully",
      data: stock,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }
});
