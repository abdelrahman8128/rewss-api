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
class AdService {
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
        const verifiedModels = (await Promise.all(adData.model.map(async (model) => {
            const existsModel = await model_schema_1.default.findById(model);
            if (existsModel) {
                return { model };
            }
            return null;
        }))).filter(Boolean);
        const ad = await ad_schema_1.default.create({
            title: adData.title,
            description: adData.description,
            price: adData.price,
            condition: adData.condition,
            models: verifiedModels,
            manufacturedCountry: adData.manufacturedCountry,
        });
        const thumbnailImageData = await this.saveImage(thumbnailFile, ad._id.toString());
        const thumbnailImage = await Ad_image_schema_1.default.create({
            adId: ad._id,
            imageId: thumbnailImageData.key,
            imageUrl: thumbnailImageData.url,
        });
        ad.thumbnail = thumbnailImage._id;
        for (const imageFile of albumFiles) {
            const imageData = await this.saveImage(imageFile, ad._id.toString());
            const adImage = await Ad_image_schema_1.default.create({
                adId: ad._id,
                imageId: imageData.key,
                imageUrl: imageData.url,
            });
            ad.album.push(adImage._id);
        }
        await ad.save();
        await ad.populate([
            { path: "album", select: "imageUrl -_id" },
            {
                path: "models.model",
                populate: { path: "brand", select: "name logo -_id" },
            },
            {
                path: "thumbnail",
                select: "imageUrl -_id"
            }
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
        const logoFileName = `${adId}-logo-${Date.now()}.${file.mimetype.split("/")[1]}`;
        const logoPath = path.join(uploadDir, logoFileName);
        fs.writeFileSync(logoPath, file.buffer);
        try {
            const sharp = (await import("sharp")).default;
            let pipeline = sharp(logoPath).rotate();
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
            fs.writeFileSync(logoPath, optimizedBuffer);
        }
        catch (err) {
            console.warn("Logo optimization failed, proceeding with original file:", err);
        }
        const s3Service = new s3_service_1.S3Service();
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: `ads/${logoFileName}`,
            Body: fs.createReadStream(logoPath),
            ContentType: file.mimetype,
            ACL: "public-read",
        };
        const uploadResult = await s3Service.upload(params);
        if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
        }
        return uploadResult;
    }
}
exports.AdService = AdService;
exports.default = AdService;
