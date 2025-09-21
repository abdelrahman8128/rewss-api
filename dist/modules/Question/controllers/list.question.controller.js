"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuestionsByAdController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const question_service_1 = __importDefault(require("../question.service"));
exports.listQuestionsByAdController = (0, express_async_handler_1.default)(async (req, res) => {
    const service = new question_service_1.default();
    const { adId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    try {
        const { items, total } = await service.listByAd(adId, Number(page), Number(limit));
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Questions fetched", data: { items, total } });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
