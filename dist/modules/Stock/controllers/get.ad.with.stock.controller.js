"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdWithStock = void 0;
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ad_schema_1 = __importDefault(require("../../../Schema/Ad/ad.schema"));
exports.getAdWithStock = (0, express_async_handler_1.default)(async (req, res) => {
    const { adId } = req.params;
    const ad = await ad_schema_1.default.findById(adId).populate({
        path: 'stock',
        select: 'available reserved bought createdAt updatedAt'
    });
    if (!ad) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
            status: "Not Found",
            message: "Ad not found"
        });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        code: http_status_codes_1.StatusCodes.OK,
        status: "Success",
        data: ad
    });
});
