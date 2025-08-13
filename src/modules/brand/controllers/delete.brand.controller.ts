import { BrandService } from "./../service/brand.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  const brandService = new BrandService();

  try {
    const deleted = await brandService.delete(req.params.id);
    if (deleted) {
      res.status(StatusCodes.OK).json({ message: "Brand deleted successfully" });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Brand not found" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
});
