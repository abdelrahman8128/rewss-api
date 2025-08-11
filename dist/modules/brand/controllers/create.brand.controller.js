"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrand = void 0;
const brand_service_1 = require("./../service/brand.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.createBrand = (0, express_async_handler_1.default)(async (req, res) => {
    const brandService = new brand_service_1.BrandService();
    const brandData = req.body;
    try {
        const createdBrand = await brandService.create(brandData);
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "Brand created successfully",
            data: createdBrand,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
