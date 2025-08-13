import { ModelService } from "./../service/model.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const deleteModel = asyncHandler(async (req: Request, res: Response) => {
  const modelService = new ModelService();

    const deletedModel = await modelService.deleteModel(req);
    if (deletedModel === false) {
       res.status(StatusCodes.NOT_FOUND).json({ message: "Model not found" });
    }else{
    res.status(StatusCodes.OK).json({
      message: "Model deleted successfully",
    });
  }
});
