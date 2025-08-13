"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteModel = void 0;
const model_service_1 = require("./../service/model.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.deleteModel = (0, express_async_handler_1.default)(async (req, res) => {
    const modelService = new model_service_1.ModelService();
    try {
        const deletedModel = await modelService.deleteModel(req);
        if (deletedModel === false) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: "Model not found" });
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Model deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
        else {
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred" });
        }
    }
});
