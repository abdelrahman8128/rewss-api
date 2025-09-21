"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerQuestionController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const question_service_1 = __importDefault(require("../question.service"));
exports.answerQuestionController = (0, express_async_handler_1.default)(async (req, res) => {
    const service = new question_service_1.default();
    const { questionId } = req.params;
    const { content } = req.body;
    try {
        const updated = await service.answerQuestion(questionId, content, {
            _id: req.user._id,
            role: req.user.role,
        });
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Answer added", data: updated });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
