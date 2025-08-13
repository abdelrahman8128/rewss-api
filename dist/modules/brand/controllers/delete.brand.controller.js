"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBrand = void 0;
const brand_service_1 = require("./../service/brand.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.deleteBrand = (0, express_async_handler_1.default)(async (req, res) => {
    const brandService = new brand_service_1.BrandService();
    try {
        const deleted = await brandService.delete(req.params.id);
        if (deleted) {
            res.status(http_status_codes_1.StatusCodes.OK).json({ message: "Brand deleted successfully" });
        }
        else {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: "Brand not found" });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
});
