import { Request, Response } from "express";
import AdService from "../ad.service";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const getAdController = asyncHandler(
  async (req: Request, res: Response) => {
    const adService = new AdService();
    const { id } = req.params;

    try {
      const ad = await adService.getById(id);
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Ad retrieved successfully",
        data: ad,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: error.message,
        });
      }
    }
  }
);

