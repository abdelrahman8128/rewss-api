"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBrand = void 0;
const brand_service_1 = require("./../service/brand.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.listBrand = (0, express_async_handler_1.default)(async (req, res) => {
    const brandService = new brand_service_1.BrandService();
    try {
        const brands = await brandService.list(req.query);
        res.status(http_status_codes_1.StatusCodes.OK).json(brands);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
