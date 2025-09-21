import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import QuestionService from "../question.service";

export const editQuestionController = asyncHandler(
  async (req: Request, res: Response) => {
    const service = new QuestionService();
    const { questionId } = req.params as any;
    const { content } = req.body as any;

    try {
      const updated = await service.editQuestion(
        questionId,
        content,
        (req as any).user._id
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Question updated", data: updated });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
      }
    }
  }
);
