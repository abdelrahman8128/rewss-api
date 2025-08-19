import { listBrand } from "../../brand/controllers/list.brand.controller";
import { ModelService } from "../service/model.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const listModelByBrandController = asyncHandler(
  async (req: Request, res: Response) => {
    const modelService = new ModelService();

    try {
      const models = await modelService.listModelByBrand(req);
      res.status(StatusCodes.OK).json(models);
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "An unexpected error occurred" });
      }
    }
  }
);
