import { AdService } from "../ad.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const createAdController = asyncHandler(async (req: Request, res: Response) => {
    const adService = new AdService();

    try {
        const createdAd = await adService.create(req);
        res.status(StatusCodes.CREATED).json({
            message: "Ad created successfully",
            data: createdAd,
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});