import { ModelService } from "./../service/model.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const createModelController = asyncHandler(async (req: Request, res: Response) => {
  const modelService = new ModelService();

  try {
    const createdModel = await modelService.create(req);
    res.status(StatusCodes.CREATED).json({
      message: "Model created successfully",
      data: createdModel,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }
});
