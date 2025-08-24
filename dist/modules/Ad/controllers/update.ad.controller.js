"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdController = void 0;
const ad_service_1 = require("../ad.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.updateAdController = (0, express_async_handler_1.default)(async (req, res) => {
    const adService = new ad_service_1.AdService();
    try {
        const updatedAd = await adService.update(req);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Ad updated successfully",
            data: updatedAd,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
