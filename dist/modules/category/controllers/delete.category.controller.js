"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryController = void 0;
const category_service_1 = require("./../service/category.service");
const http_status_codes_1 = require("http-status-codes");
const deleteCategoryController = async (req, res) => {
    const { id } = req.params;
    try {
        const categoryService = new category_service_1.CategoryService();
        const category = await categoryService.delete(id);
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Category deleted successfully", category });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to delete category" });
    }
};
exports.deleteCategoryController = deleteCategoryController;
