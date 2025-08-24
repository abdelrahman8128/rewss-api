"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockByAdId = void 0;
const stock_service_1 = require("../service/stock.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = require("mongoose");
exports.getStockByAdId = (0, express_async_handler_1.default)(async (req, res) => {
    const stockService = new stock_service_1.StockService();
    const { adId } = req.params;
    const stock = await stockService.getStockByAdId(new mongoose_1.Types.ObjectId(adId));
    if (!stock) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
            status: "Not Found",
            message: "Stock not found for this ad"
        });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        code: http_status_codes_1.StatusCodes.OK,
        status: "Success",
        data: stock
    });
});
