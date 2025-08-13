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
        return await Category_schema_1.default.create({
            name: req.body.name,
            description: req.body.description,
        });
    }
    async updateCategory(req) {
        const existingCategory = await Category_schema_1.default.findById(req.params.id);
        if (!existingCategory) {
            throw new Error("Category not found");
        }
        if (req.body.name && req.body.name !== existingCategory.name) {
            const categoryWithSameName = await Category_schema_1.default.findOne({ name: req.body.name });
            if (categoryWithSameName) {
                throw new Error("Category with this name already exists");
            }
        }
        return await Category_schema_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
    }
}
exports.CategoryService = CategoryService;
