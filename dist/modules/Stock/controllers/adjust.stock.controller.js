"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStock = void 0;
const stock_service_1 = require("../service/stock.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ad_schema_1 = __importDefault(require("../../../Schema/Ad/ad.schema"));
exports.adjustStock = (0, express_async_handler_1.default)(async (req, res) => {
    const stockService = new stock_service_1.StockService();
    const { adId } = req.params;
    const { available, reserved, bought, reason } = req.body;
    const userId = req.user._id;
    if (available === undefined && reserved === undefined && bought === undefined) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            status: "Bad Request",
            message: "At least one quantity field (available, reserved, bought) must be provided"
        });
        return;
    }
    const ad = await ad_schema_1.default.findById(adId);
    if (!ad) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
            status: "Not Found",
            message: "Ad not found"
        });
        return;
    }
    if (!ad.stock) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
            status: "Not Found",
            message: "No stock record found for this ad"
        });
        return;
    }
    const adjustments = { available, reserved, bought };
    const updatedStock = await stockService.adjustStock(ad.stock, adjustments, {
        userId,
        action: "adjusted",
        description: `Stock adjusted for ad: ${ad.title}`,
        reason: reason || "Manual adjustment",
        metadata: { adTitle: ad.title, adjustments },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        code: http_status_codes_1.StatusCodes.OK,
        status: "Success",
        message: "Stock adjusted successfully",
        data: updatedStock
    });
});
