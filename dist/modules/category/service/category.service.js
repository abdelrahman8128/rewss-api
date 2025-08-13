"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const Category_schema_1 = __importDefault(require("../../../Schema/Category/Category.schema"));
class CategoryService {
    async create(req) {
        const existingCategory = await Category_schema_1.default.findOne({ name: req.body.name });
        if (existingCategory) {
            throw new Error("Category already exists");
        }
        const category = new Category_schema_1.default({
            name: req.body.name,
        });
        category.save();
    }
    async updateCategory(id, data) {
        const existingCategory = await Category_schema_1.default.findById(id);
        if (!existingCategory) {
            throw new Error("Category not found");
        }
        if (data.name && data.name !== existingCategory.name) {
            const categoryWithSameName = await Category_schema_1.default.findOne({ name: data.name });
            if (categoryWithSameName) {
                throw new Error("Category with this name already exists");
            }
        }
        await Category_schema_1.default.findByIdAndUpdate(id, data, { new: true });
    }
}
exports.CategoryService = CategoryService;
