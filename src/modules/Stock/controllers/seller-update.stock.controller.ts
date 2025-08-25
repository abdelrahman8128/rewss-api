import { StockService } from "../service/stock.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const updateStockController = asyncHandler(async (req: Request, res: Response) => {
  const stockService = new StockService();

  try {
    const updatedStock = await stockService.updateStock(req);
    res.status(StatusCodes.OK).json({
      message: "Stock updated successfully",
      data: updatedStock,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }
});
