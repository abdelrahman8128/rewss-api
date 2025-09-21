import express, { Router } from "express";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { authorize } from "../../Middleware/authrization/authrization.middleware";
import {
  listQuestionsByAdController,
  createQuestionController,
  editQuestionController,
  deleteQuestionController,
  answerQuestionController,
  editAnswerController,
} from "./question.controller";
import {
  AnswerQuestionDto,
  CreateQuestionDto,
  EditAnswerDto,
  EditQuestionDto,
} from "./DTO/question.dto";

const router: Router = express.Router();

// List questions for an ad (public)
router.get("/ad/:adId", listQuestionsByAdController);

// Create question (user only)
router.post(
  "/ad/:adId",
  authorize(["user"]),
  validationMiddleware(CreateQuestionDto),
  createQuestionController
);

// Edit own question if not answered (user)
router.patch(
  "/:questionId",
  authorize(["user"]),
  validationMiddleware(EditQuestionDto, true),
  editQuestionController
);

// Delete question: admin or user (own, not answered)
router.delete(
  "/:questionId",
  authorize(["admin", "user"]),
  deleteQuestionController
);

// Answer question (seller only — must own the ad)
router.post(
  "/:questionId/answer",
  authorize(["seller"]),
  validationMiddleware(AnswerQuestionDto),
  answerQuestionController
);

// Edit answer (seller or admin)
router.patch(
  "/:questionId/answer",
  authorize(["seller", "admin"]),
  validationMiddleware(EditAnswerDto, true),
  editAnswerController
);

export default router;
