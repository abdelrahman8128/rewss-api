"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategoryController = void 0;
const category_service_1 = require("../service/category.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const listCategoryController = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const categoryService = new category_service_1.CategoryService();
        const categories = await categoryService.list(req);
        res.status(http_status_codes_1.StatusCodes.OK).json(categories);
    }
    catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to retrieve categories" });
    }
});
exports.listCategoryController = listCategoryController;
