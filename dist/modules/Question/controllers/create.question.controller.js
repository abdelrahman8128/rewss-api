"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuestionController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const question_service_1 = __importDefault(require("../question.service"));
exports.createQuestionController = (0, express_async_handler_1.default)(async (req, res) => {
    const service = new question_service_1.default();
    const { adId } = req.params;
    const { content } = req.body;
    try {
        const created = await service.createQuestion(adId, content, {
            _id: req.user._id,
            role: req.user.role,
        });
        res
            .status(http_status_codes_1.StatusCodes.CREATED)
            .json({ message: "Question created", data: created });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
