"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerUpdateStock = void 0;
const stock_service_1 = require("../service/stock.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ad_schema_1 = __importDefault(require("../../../Schema/Ad/ad.schema"));
exports.sellerUpdateStock = (0, express_async_handler_1.default)(async (req, res) => {
    const stockService = new stock_service_1.StockService();
    const { adId } = req.params;
    const { availableQuantity, reservedQuantity, soldQuantity, minimumOrderQuantity, reason } = req.body;
    const userId = req.user._id;
    if (availableQuantity === undefined && reservedQuantity === undefined &&
        soldQuantity === undefined && minimumOrderQuantity === undefined) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            status: "Bad Request",
            message: "At least one quantity field must be provided"
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
    if (ad.userId.toString() !== userId.toString()) {
        res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
            code: http_status_codes_1.StatusCodes.FORBIDDEN,
            status: "Forbidden",
            message: "You can only update stock for your own ads"
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
    const adjustments = {
        availableQuantity,
        reservedQuantity,
        soldQuantity,
        minimumOrderQuantity
    };
    const updatedStock = await stockService.adjustStock(ad.stock, adjustments, {
        userId,
        action: "adjusted",
        description: `Stock updated by seller for ad: ${ad.title}`,
        reason: reason || "Seller stock update",
        metadata: {
            adTitle: ad.title,
            adjustments,
            sellerUpdate: true
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        code: http_status_codes_1.StatusCodes.OK,
        status: "Success",
        message: "Stock updated successfully",
        data: updatedStock
    });
});
