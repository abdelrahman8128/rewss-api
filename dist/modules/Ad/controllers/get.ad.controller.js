"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdController = void 0;
const ad_service_1 = __importDefault(require("../ad.service"));
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.getAdController = (0, express_async_handler_1.default)(async (req, res) => {
    const adService = new ad_service_1.default();
    const { id } = req.params;
    try {
        const ad = await adService.getById(id);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Ad retrieved successfully",
            data: ad,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                success: false,
                message: error.message,
            });
        }
    }
});
