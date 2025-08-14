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
    async update(req) {
        const existingCategory = await Category_schema_1.default.findById(req.params.id);
        if (!existingCategory) {
            throw new Error("Category not found");
        }
        if (req.body.name && req.body.name !== existingCategory.name) {
            const categoryWithSameName = await Category_schema_1.default.findOne({
                name: req.body.name,
            });
            if (categoryWithSameName) {
                throw new Error("Category with this name already exists");
            }
        }
        return await Category_schema_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
    }
    async delete(id) {
        const deletedCategory = await Category_schema_1.default.findByIdAndDelete(id).exec();
        if (!deletedCategory) {
            throw new Error("Category not found");
        }
        return deletedCategory;
    }
    async list(req) {
        const { page = 1, limit = 20, search } = req.query;
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Number(limit) || 20);
        const filter = {};
        if (search) {
            filter.name = { $regex: search.trim(), $options: "i" };
        }
        const skip = (pageNum - 1) * limitNum;
        const [agg] = await Category_schema_1.default.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    meta: [{ $count: "total" }],
                    data: [{ $skip: skip }, { $limit: limitNum }],
                },
            },
        ]);
        const data = agg?.data ?? [];
        const total = agg?.meta?.[0]?.total ?? 0;
        return {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum) || 1,
            data,
        };
    }
}
exports.CategoryService = CategoryService;
