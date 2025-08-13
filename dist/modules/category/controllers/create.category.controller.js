"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = void 0;
const category_service_1 = require("./../service/category.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.createCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const categoryService = new category_service_1.CategoryService();
    try {
        const createdCategory = await categoryService.create(req);
        if (!createdCategory) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: "Category creation failed" });
        }
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "Category created successfully",
            data: createdCategory,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
