"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelService = void 0;
const model_schema_1 = __importDefault(require("../../../Schema/Model/model.schema"));
const mongoose_1 = require("mongoose");
const brand_schema_1 = __importDefault(require("../../../Schema/Brand/brand.schema"));
class ModelService {
    async create(req) {
        const { name, brand } = req.body;
        this.validateBrand(brand);
        const model = await model_schema_1.default.create({
            name,
            brand,
        });
        return model.populate("brand", "name");
    }
    async getById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new Error("Invalid model id");
        return model_schema_1.default.findById(id).populate("brand", "name");
    }
    async list(req) {
        const { page = 1, limit = 20, search } = req.query;
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Number(limit) || 20);
        const skip = (pageNum - 1) * limitNum;
        const filter = {};
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }
        const models = await model_schema_1.default.aggregate([
            { $match: filter },
            { $skip: skip },
            { $limit: limitNum },
            {
                $lookup: {
                    from: "brands",
                    localField: "brand",
                    foreignField: "_id",
                    as: "brandInfo"
                }
            },
            { $unwind: "$brandInfo" },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    brand: {
                        _id: "$brandInfo._id",
                        name: "$brandInfo.name",
                        logo: "$brandInfo.logo"
                    },
                }
            }
        ]);
        return {
            page: pageNum,
            limit: limitNum,
            total: models.length,
            pages: Math.ceil(models.length / limitNum),
            data: models
        };
    }
    async deleteModel(req) {
        if (!req.params.id)
            throw new Error("Model ID is required");
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new Error("Invalid model id");
        const res = await model_schema_1.default.findByIdAndDelete(id);
        return !!res;
    }
    async update(req) {
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new Error("Invalid model id");
        const { name, brand } = req.body;
        if (brand) {
            await this.validateBrand(brand);
        }
        const updatedModel = await model_schema_1.default.findByIdAndUpdate(id, { name, brand }, { new: true }).populate("brand", "name");
        if (!updatedModel)
            throw new Error("Model not found");
        return updatedModel;
    }
    async listModelByBrand(req) {
        const { brandId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(brandId))
            throw new Error("Invalid brand id");
        const { page = 1, limit = 20, search } = req.query;
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Number(limit) || 20);
        const skip = (pageNum - 1) * limitNum;
        const filter = { brand: brandId };
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }
        const total = await model_schema_1.default.countDocuments(filter);
        const models = await model_schema_1.default.find(filter)
            .populate("brand", "name")
            .skip(skip)
            .limit(limitNum);
        return {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
            data: models
        };
    }
    async validateBrand(brandId) {
        if (!mongoose_1.Types.ObjectId.isValid(brandId))
            throw new Error("Invalid brand id");
        const brandExists = await brand_schema_1.default.exists({ _id: brandId });
        if (!brandExists)
            throw new Error("Brand not found");
    }
}
exports.ModelService = ModelService;
