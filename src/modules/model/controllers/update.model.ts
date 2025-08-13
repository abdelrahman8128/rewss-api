import { ModelService } from "../service/model.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const updateModel = asyncHandler(async (req: Request, res: Response) => {
    const modelService = new ModelService();

    try {
        const updatedModel = await modelService.update(req);
        res.status(StatusCodes.OK).json({
            message: "Model updated successfully",
            data: updatedModel,
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
