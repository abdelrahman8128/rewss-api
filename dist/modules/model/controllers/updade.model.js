"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateModel = void 0;
const model_service_1 = require("./../service/model.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.updateModel = (0, express_async_handler_1.default)(async (req, res) => {
    const modelService = new model_service_1.ModelService();
    try {
        const updatedModel = await modelService.update(req);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Model updated successfully",
            data: updatedModel,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
