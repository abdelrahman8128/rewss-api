"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryController = void 0;
const category_service_1 = require("./../service/category.service");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.updateCategoryController = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const categoryService = new category_service_1.CategoryService();
        const updatedCategory = await categoryService.update(req);
        res.status(200).json({ message: "Category updated successfully", data: updatedCategory });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
