import { BrandService } from "./../service/brand.service";
import { Request, Response } from "express";
import Brand from "../../../Schema/Brand/brand.schema";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const brandService = new BrandService();

  const brandData = req.body;
  try {
    const createdBrand = await brandService.create(brandData);
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }
});
