"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandService = void 0;
const brand_schema_1 = __importDefault(require("../../../Schema/Brand/brand.schema"));
const mongoose_1 = require("mongoose");
const s3_service_1 = require("../../../service/s3.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class BrandService {
    async create(req) {
        const name = req.body.name.trim();
        const exists = await brand_schema_1.default.findOne({ name });
        if (exists)
            throw new Error("Brand already exists");
        const logoFileName = await this.saveLogo(req);
        return await brand_schema_1.default.create({
            name,
            logo: logoFileName,
        });
    }
    async getById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new Error("Invalid brand id");
        return brand_schema_1.default.findById(id);
    }
    async list(query = {}) {
        const { page = 1, limit = 20, search } = query;
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Number(limit) || 20);
        const filter = {};
        if (search) {
            filter.name = { $regex: search.trim(), $options: "i" };
        }
        const skip = (pageNum - 1) * limitNum;
        const [agg] = await brand_schema_1.default.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limitNum },
                        {
                            $project: {
                                name: 1,
                                logo: 1,
                                country: 1,
                                _id: 1,
                            },
                        },
                    ],
                    meta: [{ $count: "total" }],
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
    async update(req) {
        const id = req.params.id;
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new Error("Invalid brand id");
        const brand = await brand_schema_1.default.findById(id);
        if (!brand)
            throw new Error("Brand not found");
        const update = {};
        if (req.body.name) {
            const name = req.body.name.trim();
            const exists = await brand_schema_1.default.findOne({ name, _id: { $ne: id } });
            if (exists)
                throw new Error("Brand name already in use");
            update.name = name;
        }
        const file = Array.isArray(req.files)
            ? req.files.find((f) => f.fieldname === "logo")
            : null;
        if (file) {
            await this.deleteBrandLogo(id);
            const logoFileName = await this.saveLogo(req);
            update.logo = logoFileName;
        }
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
    async saveLogo(req) {
        const file = Array.isArray(req.files)
            ? req.files.find((f) => f.fieldname === "logo")
            : null;
        if (!file) {
            throw new Error("Logo file is required");
        }
        if (!file.mimetype.startsWith("image/")) {
            throw new Error("Logo must be an image");
        }
        const uploadDir = path.join(__dirname, "../../../uploads/brands");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const logoFileName = `${req.body.name}-logo-${Date.now()}.${file.mimetype.split("/")[1]}`;
        const logoPath = path.join(uploadDir, logoFileName);
        fs.writeFileSync(logoPath, file.buffer);
        try {
            const sharp = (await import("sharp")).default;
            const MAX_WIDTH = 80;
            const MAX_HEIGHT = 80;
            let pipeline = sharp(logoPath).rotate().resize({
                width: MAX_WIDTH,
                height: MAX_HEIGHT,
                fit: "inside",
                withoutEnlargement: true,
            });
            switch (file.mimetype) {
                case "image/jpeg":
                case "image/jpg":
                    pipeline = pipeline.jpeg({ quality: 50, mozjpeg: true });
                    break;
                case "image/png":
                    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
                    break;
                case "image/webp":
                    pipeline = pipeline.webp({ quality: 80 });
                    break;
                case "image/avif":
                    pipeline = pipeline.avif({ quality: 50 });
                    break;
                default:
                    break;
            }
            const optimizedBuffer = await pipeline.toBuffer();
            fs.writeFileSync(logoPath, optimizedBuffer);
        }
        catch (err) {
            console.warn("Logo optimization failed, proceeding with original file:", err);
        }
        const s3Service = new s3_service_1.S3Service();
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: `brands/${logoFileName}`,
            Body: fs.createReadStream(logoPath),
            ContentType: file.mimetype,
            ACL: "public-read",
        };
        const uploadResult = await s3Service.upload(params);
        console.log("S3 Upload Result:", uploadResult);
        if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
        }
        return uploadResult.url;
    }
    async deleteBrandLogo(id) {
        const brand = await brand_schema_1.default.findById(id);
        if (!brand || !brand.logo) {
            throw new Error("Brand not found or logo is missing");
        }
        const logoUrl = brand.logo;
        const urlParts = logoUrl.split(".com/");
        if (urlParts.length < 2) {
            throw new Error("Invalid logo URL format");
        }
        const logoKey = urlParts[1];
        console.log(`Deleted logo from S3: ${logoKey}`);
        const s3Service = new s3_service_1.S3Service();
        await s3Service.delete(logoKey);
        brand.logo = "";
        await brand.save();
        console.log(`Brand logo removed for brand ID: ${id}`);
        return true;
    }
}
exports.BrandService = BrandService;
const brandService = new BrandService();
exports.default = brandService;
