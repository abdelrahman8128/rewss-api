import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import QuestionService from "../question.service";

export const listQuestionsByAdController = asyncHandler(
  async (req: Request, res: Response) => {
    const service = new QuestionService();
    const { adId } = req.params;
    const { page = 1, limit = 20 } = req.query as any;

    try {
      const { items, total } = await service.listByAd(
        adId,
        Number(page),
        Number(limit)
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Questions fetched", data: { items, total } });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
      }
    }
  }
);
