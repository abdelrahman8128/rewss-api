"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStock = void 0;
const stock_service_1 = require("../service/stock.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ad_schema_1 = __importDefault(require("../../../Schema/Ad/ad.schema"));
const mongoose_1 = require("mongoose");
exports.createStock = (0, express_async_handler_1.default)(async (req, res) => {
    const stockService = new stock_service_1.StockService();
    const { adId } = req.params;
    const { available, reserved, bought } = req.body;
    const userId = req.user._id;
    if (available === undefined || available < 0) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            status: "Bad Request",
            message: "Available quantity is required and must be non-negative"
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
    if (ad.stock) {
        res.status(http_status_codes_1.StatusCodes.CONFLICT).json({
            code: http_status_codes_1.StatusCodes.CONFLICT,
            status: "Conflict",
            message: "Stock already exists for this ad"
        });
        return;
    }
    const stockData = {
        available: available || 0,
        reserved: reserved || 0,
        bought: bought || 0
    };
    const newStock = await stockService.createStock(new mongoose_1.Types.ObjectId(adId), stockData, {
        userId,
        action: "created",
        description: `Initial stock created for ad: ${ad.title}`,
        reason: "Stock initialization",
        metadata: { adTitle: ad.title, initialStock: stockData },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        code: http_status_codes_1.StatusCodes.CREATED,
        status: "Created",
        message: "Stock created successfully",
        data: newStock
    });
});
