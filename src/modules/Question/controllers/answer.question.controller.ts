import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import QuestionService from "../question.service";

export const answerQuestionController = asyncHandler(
  async (req: Request, res: Response) => {
    const service = new QuestionService();
    const { questionId } = req.params as any;
    const { content } = req.body as any;

    try {
      const updated = await service.answerQuestion(questionId, content, {
        _id: (req as any).user._id,
        role: (req as any).user.role,
      });
      res
        .status(StatusCodes.OK)
        .json({ message: "Answer added", data: updated });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
      }
    }
  }
);
