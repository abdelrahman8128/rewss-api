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
exports.AdService = void 0;
const ad_schema_1 = __importDefault(require("../../Schema/Ad/ad.schema"));
const s3_service_1 = require("../../service/s3.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Ad_image_schema_1 = __importDefault(require("../../Schema/AdImage/Ad.image.schema"));
const model_schema_1 = __importDefault(require("../../Schema/Model/model.schema"));
const mongoose_1 = require("mongoose");
const stock_service_1 = __importDefault(require("../Stock/service/stock.service"));
class AdService {
    constructor() {
        this.stockService = new stock_service_1.default();
    }
    async list(req) {
        const { search, model, seller, stockStatus, condition, category, minPrice, maxPrice, sortBy = "date", sortOrder = "desc", page = 1, limit = 20, } = req.query || {};
        const filter = {};
        if (search) {
            const regex = new RegExp(String(search), "i");
            filter.$or = [{ title: regex }, { slug: regex }, { description: regex }];
        }
        if (category) {
            try {
                filter.category = new mongoose_1.Types.ObjectId(String(category));
            }
            catch (_) { }
        }
        if (model) {
            try {
                filter["models.model"] = new mongoose_1.Types.ObjectId(String(model));
            }
            catch (_) { }
        }
        if (seller) {
            try {
                filter.userId = new mongoose_1.Types.ObjectId(String(seller));
            }
            catch (_) { }
        }
        if (stockStatus) {
            filter.stockStatus = String(stockStatus);
        }
        if (condition) {
            filter.condition = String(condition);
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
        }
        const sort = {};
        const sortField = String(sortBy) === "price" ? "price" : "createdAt";
        sort[sortField] = String(sortOrder) === "asc" ? 1 : -1;
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = (pageNumber - 1) * pageSize;
        const [items, total] = await Promise.all([
            ad_schema_1.default.find(filter)
                .select("-album -models._id")
                .populate([
                { path: "thumbnail", select: "imageUrl" },
                {
                    path: "models.model",
                    select: "-_id -createdAt -updatedAt -__v",
                    populate: { path: "brand", select: "name logo -_id" },
                },
                {
                    path: "stock",
                    select: "totalQuantity availableQuantity reservedQuantity soldQuantity status location minimumStockLevel",
                },
                { path: "category" },
            ])
                .sort(sort)
                .skip(skip)
                .limit(pageSize),
            ad_schema_1.default.countDocuments(filter),
        ]);
        return {
            items,
            page: pageNumber,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize) || 1,
        };
    }
    async create(req) {
        const albumFiles = Array.isArray(req.files)
            ? req.files.filter((f) => f.fieldname === "album")
            : [];
        const thumbnailFile = Array.isArray(req.files)
            ? req.files.find((f) => f.fieldname === "thumbnail")
            : null;
        if (albumFiles.length < 1) {
            throw new Error(" album images are required");
        }
        if (!thumbnailFile) {
            throw new Error("A thumbnail image is required");
        }
        const adData = req.body;
        const verifiedModels = await this.verifyModels(adData.model);
        const ad = await ad_schema_1.default.create({
            userId: req.user._id,
            title: adData.title,
            description: adData.description,
            price: adData.price,
            condition: adData.condition,
            models: verifiedModels,
            manufacturedCountry: adData.manufacturedCountry,
            ...(adData.category ? { category: adData.category } : {}),
        });
        const thumbnailImageData = await this.saveImage(thumbnailFile, ad._id.toString());
        const thumbnailImage = await Ad_image_schema_1.default.create({
            adId: ad._id,
            imageId: thumbnailImageData.key,
            imageUrl: thumbnailImageData.url,
        });
        ad.thumbnail = new mongoose_1.Types.ObjectId(thumbnailImage._id.toString());
        for (const imageFile of albumFiles) {
            const imageData = await this.saveImage(imageFile, ad._id.toString());
            const adImage = await Ad_image_schema_1.default.create({
                adId: ad._id,
                imageId: imageData.key,
                imageUrl: imageData.url,
            });
            ad.album.push(new mongoose_1.Types.ObjectId(adImage._id.toString()));
        }
        const stockData = {
            availableQuantity: adData.availableStock || 0,
            reservedQuantity: 0,
            soldQuantity: 0,
            minimumOrderQuantity: adData.minimumStockQuantity || 1,
            status: "available",
        };
        const stock = await this.stockService.createStock(ad._id, stockData, {
            userId: req.user._id,
            description: `Initial stock created for ad: ${ad.title}`,
            reason: "Ad creation",
            metadata: { adTitle: ad.title },
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
        });
        ad.stock = stock._id;
        await ad.save();
        await ad.populate([
            { path: "album", select: "imageUrl" },
            {
                path: "models.model",
                populate: { path: "brand", select: "name logo -_id" },
            },
            {
                path: "thumbnail",
                select: "imageUrl",
            },
            {
                path: "stock",
                select: "totalQuantity availableQuantity reservedQuantity soldQuantity status location minimumStockLevel",
            },
        ]);
        return ad;
    }
    async update(req) {
        const adId = req.params.id;
        const ad = await ad_schema_1.default.findById(adId);
        if (!ad) {
            throw new Error("Ad not found");
        }
        if (req.user.role == "seller" &&
            ad.userId.toString() !== req.user._id.toString()) {
            throw new Error("You are not authorized to update this ad");
        }
        const adData = req.body;
        const albumFiles = Array.isArray(req.files)
            ? req.files.filter((f) => f.fieldname === "album")
            : [];
        const thumbnailFile = Array.isArray(req.files)
            ? req.files.find((f) => f.fieldname === "thumbnail")
            : null;
        if (thumbnailFile) {
            const oldThumbnail = await Ad_image_schema_1.default.findById(ad.thumbnail);
            if (oldThumbnail) {
                const s3Service = new s3_service_1.S3Service();
                await s3Service.delete(oldThumbnail.imageId);
                await oldThumbnail.deleteOne();
            }
        }
        if (albumFiles.length || req.body.album) {
            const oldAlbumImages = await Ad_image_schema_1.default.find({ adId: ad._id });
            const s3Service = new s3_service_1.S3Service();
            const oldAlbumImagesToRemove = oldAlbumImages.filter((i) => !req.body.album?.includes(i._id.toString()));
            await Promise.all(oldAlbumImagesToRemove.map(async (i) => {
                await s3Service.delete(i.imageId);
                await i.deleteOne();
            }));
        }
        if (thumbnailFile) {
            const thumbnailImageData = await this.saveImage(thumbnailFile, ad._id.toString());
            const thumbnailImage = await Ad_image_schema_1.default.create({
                adId: ad._id,
                imageId: thumbnailImageData.key,
                imageUrl: thumbnailImageData.url,
            });
            ad.thumbnail = new mongoose_1.Types.ObjectId(thumbnailImage._id.toString());
        }
        if (albumFiles.length) {
            const imagesPromises = albumFiles.map(async (file) => {
                const imageData = await this.saveImage(file, ad._id.toString());
                const image = await Ad_image_schema_1.default.create({
                    adId: ad._id,
                    imageId: imageData.key,
                    imageUrl: imageData.url,
                });
                return image;
            });
            const images = await Promise.all(imagesPromises);
            ad.album = [...ad.album, ...images.map((i) => i._id)];
        }
        if (adData.title)
            ad.title = adData.title;
        if (adData.description)
            ad.description = adData.description;
        if (adData.price)
            ad.price = adData.price;
        if (adData.condition)
            ad.condition = adData.condition;
        if (adData.manufacturedCountry)
            ad.manufacturedCountry = adData.manufacturedCountry;
        if (adData.model) {
            const verifiedModels = await this.verifyModels(adData.model);
            ad.models = verifiedModels;
        }
        if (adData.category) {
            ad.category = new mongoose_1.Types.ObjectId(adData.category);
        }
        await ad.save();
        await ad.populate([
            { path: "album", select: "imageUrl " },
            {
                path: "models.model",
                populate: { path: "brand", select: "name logo -_id" },
            },
            {
                path: "thumbnail",
                select: "imageUrl",
            },
            {
                path: "stock",
                select: "totalQuantity availableQuantity reservedQuantity soldQuantity status location minimumStockLevel",
            },
        ]);
        return ad;
    }
    async saveImage(file, adId) {
        if (!file) {
            throw new Error("image file is required");
        }
        if (!file.mimetype.startsWith("image/")) {
            throw new Error("File must be an image");
        }
        const uploadDir = path.join(__dirname, "../../../uploads/ads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const fileName = `${adId}-${Date.now()}.${file.mimetype.split("/")[1]}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        try {
            const sharp = (await import("sharp")).default;
            let pipeline = sharp(filePath).rotate();
            switch (file.mimetype) {
                case "image/jpeg":
                case "image/jpg":
                    pipeline = pipeline.jpeg({ quality: 70, mozjpeg: true });
                    break;
                case "image/png":
                    pipeline = pipeline.png({ compressionLevel: 9, quality: 70 });
                    break;
                case "image/webp":
                    pipeline = pipeline.webp({ quality: 70 });
                    break;
                case "image/avif":
                    pipeline = pipeline.avif({ quality: 70 });
                    break;
                default:
                    break;
            }
            const optimizedBuffer = await pipeline.toBuffer();
            fs.writeFileSync(filePath, optimizedBuffer);
        }
        catch (err) {
            console.warn("Logo optimization failed, proceeding with original file:", err);
        }
        const s3Service = new s3_service_1.S3Service();
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: `ads/${fileName}`,
            Body: fs.createReadStream(filePath),
            ContentType: file.mimetype,
            ACL: "public-read",
        };
        const uploadResult = await s3Service.upload(params);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return uploadResult;
    }
    async verifyModels(models) {
        return (await Promise.all(models.map(async (model) => {
            const existsModel = await model_schema_1.default.findById(model);
            if (existsModel) {
                return { model: new mongoose_1.Types.ObjectId(model) };
            }
            return null;
        }))).filter(Boolean);
    }
}
exports.AdService = AdService;
exports.default = AdService;
