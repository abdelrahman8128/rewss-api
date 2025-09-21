"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../../Middleware/validation/validation.middleware");
const authrization_middleware_1 = require("../../Middleware/authrization/authrization.middleware");
const question_controller_1 = require("./question.controller");
const question_dto_1 = require("./DTO/question.dto");
const router = express_1.default.Router();
router.get("/ad/:adId", question_controller_1.listQuestionsByAdController);
router.post("/ad/:adId", (0, authrization_middleware_1.authorize)(["user"]), (0, validation_middleware_1.validationMiddleware)(question_dto_1.CreateQuestionDto), question_controller_1.createQuestionController);
router.patch("/:questionId", (0, authrization_middleware_1.authorize)(["user"]), (0, validation_middleware_1.validationMiddleware)(question_dto_1.EditQuestionDto, true), question_controller_1.editQuestionController);
router.delete("/:questionId", (0, authrization_middleware_1.authorize)(["admin", "user"]), question_controller_1.deleteQuestionController);
router.post("/:questionId/answer", (0, authrization_middleware_1.authorize)(["seller"]), (0, validation_middleware_1.validationMiddleware)(question_dto_1.AnswerQuestionDto), question_controller_1.answerQuestionController);
router.patch("/:questionId/answer", (0, authrization_middleware_1.authorize)(["seller", "admin"]), (0, validation_middleware_1.validationMiddleware)(question_dto_1.EditAnswerDto, true), question_controller_1.editAnswerController);
exports.default = router;
