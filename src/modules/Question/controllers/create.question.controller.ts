import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import QuestionService from "../question.service";

export const createQuestionController = asyncHandler(
  async (req: Request, res: Response) => {
    const service = new QuestionService();
    const { adId } = req.params as any;
    const { content } = req.body as any;

    try {
      const created = await service.createQuestion(adId, content, {
        _id: (req as any).user._id,
        role: (req as any).user.role,
      });
      res
        .status(StatusCodes.CREATED)
        .json({ message: "Question created", data: created });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
      }
    }
  }
);
