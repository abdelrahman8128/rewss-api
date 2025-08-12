import { BrandService } from "./../service/brand.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const brandService = new BrandService();

  try {
    const updatedBrand = await brandService.update(req);
    res.status(StatusCodes.OK).json(updatedBrand);
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }
});
