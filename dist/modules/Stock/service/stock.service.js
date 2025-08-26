"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const stock_schema_1 = __importDefault(require("../../../Schema/Stock/stock.schema"));
const ad_schema_1 = __importDefault(require("../../../Schema/Ad/ad.schema"));
const activity_log_service_1 = __importDefault(require("../../ActivityLog/activity-log.service"));
const mongoose_1 = require("mongoose");
class StockService {
    async createStock(adId, stockData, logData) {
        const existingStock = await stock_schema_1.default.findOne({ adId });
        if (existingStock) {
            throw new Error("Stock already exists for this ad");
        }
        const stock = await stock_schema_1.default.create({
            adId,
            availableQuantity: stockData.availableQuantity || 0,
            reservedQuantity: stockData.reservedQuantity || 0,
            soldQuantity: stockData.soldQuantity || 0,
            minimumOrderQuantity: stockData.minimumOrderQuantity || 1,
            status: stockData.status || 'available',
        });
        await activity_log_service_1.default.logActivity(logData.userId, "stock_created", logData.description, { ...logData.metadata, stockId: stock._id, adId }, logData.ipAddress, logData.userAgent);
        return stock;
    }
    async getStockByAd(req) {
        const { adId } = req.params;
        const ad = await ad_schema_1.default.findById(adId);
        if (!ad) {
            throw new Error("Ad not found");
        }
        if (req.user.role === "seller" && ad.userId.toString() !== req.user._id.toString()) {
            throw new Error("You can only view stock for your own ads");
        }
        const stockResult = await stock_schema_1.default.aggregate([
            { $match: { adId: new mongoose_1.Types.ObjectId(adId) } },
            {
                $lookup: {
                    from: "ads",
                    localField: "adId",
                    foreignField: "_id",
                    as: "adDetails"
                }
            },
            { $unwind: "$adDetails" },
            {
                $lookup: {
                    from: "adimages",
                    localField: "adDetails.thumbnail",
                    foreignField: "_id",
                    as: "thumbnailImage"
                }
            },
            {
                $addFields: {
                    "adDetails.thumbnail": {
                        $ifNull: [
                            { $arrayElemAt: ["$thumbnailImage.imageUrl", 0] },
                            null
                        ]
                    }
                }
            },
            {
                $project: {
                    availableQuantity: 1,
                    reservedQuantity: 1,
                    soldQuantity: 1,
                    minimumOrderQuantity: 1,
                    status: 1,
                    adId: {
                        _id: "$adDetails._id",
                        title: "$adDetails.title",
                        description: "$adDetails.description",
                        price: "$adDetails.price",
                        thumbnail: "$adDetails.thumbnail"
                    }
                }
            }
        ]);
        const stock = stockResult[0];
        if (!stock) {
            throw new Error("Stock not found for this ad");
        }
        return stock;
    }
    async updateStock(req) {
        const { adId } = req.params;
        const stockData = req.body;
        const ad = await ad_schema_1.default.findById(adId);
        if (!ad) {
            throw new Error("Ad not found");
        }
        if (req.user.role === "seller" && ad.userId.toString() !== req.user._id.toString()) {
            throw new Error("You can only update stock for your own ads");
        }
        let stock;
        if (!ad.stock) {
            stock = await stock_schema_1.default.create({
                adId: new mongoose_1.Types.ObjectId(adId),
                availableQuantity: stockData.availableQuantity || 0,
                reservedQuantity: stockData.reservedQuantity || 0,
                soldQuantity: stockData.soldQuantity || 0,
                minimumOrderQuantity: stockData.minimumOrderQuantity || 1,
            });
            await ad_schema_1.default.findByIdAndUpdate(adId, { stock: stock._id });
            await activity_log_service_1.default.logActivity(req.user._id, "stock_created", `Stock created for ad: ${ad.title}`, {
                stockId: stock._id,
                adId: stock.adId,
                adTitle: ad.title,
                userRole: req.user.role,
                createdDuringUpdate: true,
                reason: stockData.reason || "Stock creation during update"
            }, req.ip, req.get('User-Agent'));
            await stock.populate({
                path: "adId",
                select: "title description price"
            });
            return stock;
        }
        const existingStock = await stock_schema_1.default.findById(ad.stock);
        if (!existingStock) {
            throw new Error("Stock record not found");
        }
        stock = existingStock;
        const changes = [];
        if (stockData.availableQuantity !== undefined && stockData.availableQuantity !== stock.availableQuantity) {
            changes.push({ field: "availableQuantity", oldValue: stock.availableQuantity, newValue: stockData.availableQuantity });
            stock.availableQuantity = stockData.availableQuantity;
        }
        if (stockData.reservedQuantity !== undefined && stockData.reservedQuantity !== stock.reservedQuantity) {
            changes.push({ field: "reservedQuantity", oldValue: stock.reservedQuantity, newValue: stockData.reservedQuantity });
            stock.reservedQuantity = stockData.reservedQuantity;
        }
        if (stockData.soldQuantity !== undefined && stockData.soldQuantity !== stock.soldQuantity) {
            changes.push({ field: "soldQuantity", oldValue: stock.soldQuantity, newValue: stockData.soldQuantity });
            stock.soldQuantity = stockData.soldQuantity;
        }
        if (stockData.minimumOrderQuantity !== undefined && stockData.minimumOrderQuantity !== stock.minimumOrderQuantity) {
            changes.push({ field: "minimumOrderQuantity", oldValue: stock.minimumOrderQuantity, newValue: stockData.minimumOrderQuantity });
            stock.minimumOrderQuantity = stockData.minimumOrderQuantity;
        }
        await stock.save();
        await activity_log_service_1.default.logActivity(req.user._id, "stock_updated", `Stock updated for ad: ${ad.title}`, {
            stockId: stock._id,
            adId: stock.adId,
            adTitle: ad.title,
            changes,
            userRole: req.user.role,
            reason: stockData.reason || "Stock update"
        }, req.ip, req.get('User-Agent'));
        await stock.populate({
            path: "adId",
            select: "title description price"
        });
        return stock;
    }
    async reserveStock(adId, quantity, userId, metadata, ipAddress, userAgent) {
        const stock = await stock_schema_1.default.findOne({ adId });
        if (!stock) {
            throw new Error("Stock not found for this ad");
        }
        if (stock.availableQuantity < quantity) {
            throw new Error("Insufficient available quantity");
        }
        const changes = [
            { field: "availableQuantity", oldValue: stock.availableQuantity, newValue: stock.availableQuantity - quantity },
            { field: "reservedQuantity", oldValue: stock.reservedQuantity, newValue: stock.reservedQuantity + quantity }
        ];
        stock.availableQuantity -= quantity;
        stock.reservedQuantity += quantity;
        await stock.save();
        await activity_log_service_1.default.logActivity(userId, "stock_reserved", `Reserved ${quantity} units of stock`, {
            stockId: stock._id,
            adId,
            quantity,
            changes,
            ...metadata
        }, ipAddress, userAgent);
        return stock;
    }
    async buyStock(adId, quantity, userId, metadata, ipAddress, userAgent) {
        const stock = await stock_schema_1.default.findOne({ adId });
        if (!stock) {
            throw new Error("Stock not found for this ad");
        }
        if (stock.reservedQuantity < quantity) {
            throw new Error("Insufficient reserved quantity");
        }
        const changes = [
            { field: "reservedQuantity", oldValue: stock.reservedQuantity, newValue: stock.reservedQuantity - quantity },
            { field: "soldQuantity", oldValue: stock.soldQuantity, newValue: stock.soldQuantity + quantity }
        ];
        stock.reservedQuantity -= quantity;
        stock.soldQuantity += quantity;
        await stock.save();
        await activity_log_service_1.default.logActivity(userId, "stock_purchased", `Purchased ${quantity} units of stock`, {
            stockId: stock._id,
            adId,
            quantity,
            changes,
            ...metadata
        }, ipAddress, userAgent);
        return stock;
    }
    async getStockActivity(adId, userId, page = 1, limit = 20) {
        const stock = await stock_schema_1.default.findOne({ adId });
        if (!stock) {
            throw new Error("Stock not found for this ad");
        }
        return activity_log_service_1.default.getUserActivityHistory(userId, {
            page,
            limit
        });
    }
}
exports.StockService = StockService;
exports.default = StockService;
