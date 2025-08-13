import { ModelService } from "./../service/model.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const deleteModel = asyncHandler(async (req: Request, res: Response) => {
  const modelService = new ModelService();

  try {
    const deletedModel = await modelService.deleteModel(req);
    if (deletedModel === false) {
       res.status(StatusCodes.NOT_FOUND).json({ message: "Model not found" });
    }
    res.status(StatusCodes.OK).json({
      message: "Model deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred" });
    }
  }
});
