"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandService = void 0;
const brand_schema_1 = __importDefault(require("../../../Schema/Brand/brand.schema"));
const mongoose_1 = require("mongoose");
class BrandService {
    async create(data) {
        const name = data.name.trim();
        const exists = await brand_schema_1.default.findOne({ name });
        if (exists)
            throw new Error("Brand already exists");
        return await brand_schema_1.default.create({
            name,
            country: data.country.trim(),
            logo: data.logo.trim(),
        });
    }
    async getById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new Error("Invalid brand id");
        return brand_schema_1.default.findById(id);
    }
    async list(query = {}) {
        const { page = 1, limit = 20, search, country } = query;
        const filter = {};
        if (search) {
            filter.name = { $regex: search.trim(), $options: "i" };
        }
        if (country) {
            filter.country = { $regex: `^${country.trim()}$`, $options: "i" };
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            brand_schema_1.default.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            brand_schema_1.default.countDocuments(filter),
        ]);
        return {
            data,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit) || 1,
        };
    }
    async update(id, data) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new Error("Invalid brand id");
        const update = {};
        if (data.name) {
            const name = data.name.trim();
            const exists = await brand_schema_1.default.findOne({ name, _id: { $ne: id } });
            if (exists)
                throw new Error("Brand name already in use");
            update.name = name;
        }
        if (data.country)
            update.country = data.country.trim();
        if (data.logo)
            update.logo = data.logo.trim();
        if (!Object.keys(update).length)
            return brand_schema_1.default.findById(id);
        return brand_schema_1.default.findByIdAndUpdate(id, update, { new: true });
    }
    async delete(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new Error("Invalid brand id");
        const res = await brand_schema_1.default.findByIdAndDelete(id);
        return !!res;
    }
}
exports.BrandService = BrandService;
const brandService = new BrandService();
exports.default = brandService;
