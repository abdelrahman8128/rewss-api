import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import QuestionService from "../question.service";

export const deleteQuestionController = asyncHandler(
  async (req: Request, res: Response) => {
    const service = new QuestionService();
    const { questionId } = req.params as any;

    try {
      const result = await service.deleteQuestion(questionId, {
        _id: (req as any).user._id,
        role: (req as any).user.role,
      });
      res
        .status(StatusCodes.OK)
        .json({ message: "Question deleted", data: result });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
      }
    }
  }
);
