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
 *   "code": 200,
 *   "status": "Success",
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
export const getStockByAdId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stockService = new StockService();

  const { adId } = req.params;
  const stock = await stockService.getStockByAdId(new Types.ObjectId(adId));
  
  if (!stock) {
    res.status(StatusCodes.NOT_FOUND).json({
      code: StatusCodes.NOT_FOUND,
      status: "Not Found",
      message: "Stock not found for this ad"
    });
    return;
  }

  res.status(StatusCodes.OK).json({
    code: StatusCodes.OK,
    status: "Success",
    data: stock
  });
});
