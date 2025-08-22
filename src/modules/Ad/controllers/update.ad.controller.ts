import { AdService } from "../ad.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";


export const updateAdController = asyncHandler(async (req: Request, res: Response) => {
    const adService = new AdService();

    try {
        const updatedAd = await adService.update(req);
        res.status(StatusCodes.OK).json({
            message: "Ad updated successfully",
            data: updatedAd,
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});