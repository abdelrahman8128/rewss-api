"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockActivity = void 0;
const stock_service_1 = require("../service/stock.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ad_schema_1 = __importDefault(require("../../../Schema/Ad/ad.schema"));
exports.getStockActivity = (0, express_async_handler_1.default)(async (req, res) => {
    const stockService = new stock_service_1.StockService();
    const { adId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const ad = await ad_schema_1.default.findById(adId);
    if (!ad || !ad.stock) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
            status: "Not Found",
            message: "Ad or stock not found"
        });
        return;
    }
    const activities = await stockService.getStockActivity(ad.stock, limit, offset);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        code: http_status_codes_1.StatusCodes.OK,
        status: "Success",
        data: {
            activities,
            pagination: {
                limit,
                offset,
                total: activities.length
            }
        }
    });
});
