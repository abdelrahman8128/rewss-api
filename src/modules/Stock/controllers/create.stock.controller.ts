import { StockService } from "../service/stock.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import Ad from "../../../Schema/Ad/ad.schema";
import { Types } from "mongoose";

/**
 * Create initial stock for an ad
 * 
 * @description Creates a new stock record for an ad with initial quantities
 * @route POST /stock/ad/:adId
 * @param {string} adId - The MongoDB ObjectId of the ad (URL parameter)
 * 
 * @requestBody {
 *   "available": 100,     // Required: Number of available units (>= 0)
 *   "reserved": 0,       // Optional: Number of reserved units (>= 0, default: 0)
 *   "bought": 0          // Optional: Number of bought units (>= 0, default: 0)
 * }
 * 
 * @returns {Object} Created stock information with activity log
 * 
 * @example
 * // Request: POST /stock/ad/64a7b8c9d4e5f6789a0b1c2d
 * // Body:
 * {
 *   "available": 100,
 *   "reserved": 5,
 *   "bought": 2
 * }
 * 
 * // Response:
 * {
 *   "code": 201,
 *   "status": "Created",
 *   "message": "Stock created successfully",
 *   "data": {
 *     "_id": "64a7b8c9d4e5f6789a0b1c2e",
 *     "adId": "64a7b8c9d4e5f6789a0b1c2d",
 *     "available": 100,
 *     "reserved": 5,
 *     "bought": 2,
 *     "createdAt": "2023-07-07T10:30:00.000Z",
 *     "updatedAt": "2023-07-07T10:30:00.000Z"
 *   }
 * }
 */
export const createStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stockService = new StockService();

  const { adId } = req.params;
  const { available, reserved, bought } = req.body;
  const userId = (req as any).user._id;

  // Validate required fields
  if (available === undefined || available < 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      code: StatusCodes.BAD_REQUEST,
      status: "Bad Request",
      message: "Available quantity is required and must be non-negative"
    });
    return;
  }

  // Check if ad exists
  const ad = await Ad.findById(adId);
  if (!ad) {
    res.status(StatusCodes.NOT_FOUND).json({
      code: StatusCodes.NOT_FOUND,
      status: "Not Found",
      message: "Ad not found"
    });
    return;
  }

  // Check if stock already exists for this ad
  if (ad.stock) {
    res.status(StatusCodes.CONFLICT).json({
      code: StatusCodes.CONFLICT,
      status: "Conflict",
      message: "Stock already exists for this ad"
    });
    return;
  }

  const stockData = {
    available: available || 0,
    reserved: reserved || 0,
    bought: bought || 0
  };

  const newStock = await stockService.createStock(new Types.ObjectId(adId), stockData, {
    userId,
    action: "created",
    description: `Initial stock created for ad: ${ad.title}`,
    reason: "Stock initialization",
    metadata: { adTitle: ad.title, initialStock: stockData },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(StatusCodes.CREATED).json({
    code: StatusCodes.CREATED,
    status: "Created",
    message: "Stock created successfully",
    data: newStock
  });
});
