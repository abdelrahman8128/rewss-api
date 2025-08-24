import { StockService } from "../service/stock.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import Ad from "../../../Schema/Ad/ad.schema";

/**
 * Get ad details with populated stock information
 * 
 * @description Retrieves complete ad information along with its associated stock details
 * @route GET /stock/ad/:adId/details
 * @param {string} adId - The MongoDB ObjectId of the ad (URL parameter)
 * 
 * @returns {Object} Complete ad information with populated stock data including:
 *   - All ad fields (title, description, price, etc.)
 *   - stock: Populated stock object with available, reserved, bought quantities
 * 
 * @example
 * // Request: GET /stock/ad/64a7b8c9d4e5f6789a0b1c2d/details
 * // Response:
 * {
 *   "code": 200,
 *   "status": "Success",
 *   "data": {
 *     "ad": {
 *       "_id": "64a7b8c9d4e5f6789a0b1c2d",
 *       "title": "iPhone 14 Pro",
 *       "description": "Latest iPhone model",
 *       "price": 999,
 *       "stock": {
 *         "_id": "64a7b8c9d4e5f6789a0b1c2e",
 *         "available": 50,
 *         "reserved": 10,
 *         "bought": 5,
 *         "createdAt": "2023-07-07T10:30:00.000Z",
 *         "updatedAt": "2023-07-07T15:45:00.000Z"
 *       }
 *     }
 *   }
 * }
 */
export const getAdWithStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { adId } = req.params;
  
  const ad = await Ad.findById(adId).populate({
    path: 'stock',
    select: 'available reserved bought createdAt updatedAt'
  });
  
  if (!ad) {
    res.status(StatusCodes.NOT_FOUND).json({
      code: StatusCodes.NOT_FOUND,
      status: "Not Found",
      message: "Ad not found"
    });
    return;
  }

  res.status(StatusCodes.OK).json({
    code: StatusCodes.OK,
    status: "Success",
    data: ad
  });
});
