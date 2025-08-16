"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModelController = void 0;
const model_service_1 = require("./../service/model.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.createModelController = (0, express_async_handler_1.default)(async (req, res) => {
    const modelService = new model_service_1.ModelService();
    try {
        const createdModel = await modelService.create(req);
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "Model created successfully",
            data: createdModel,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
