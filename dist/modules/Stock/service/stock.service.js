"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const stock_schema_1 = __importDefault(require("../../../Schema/Stock/stock.schema"));
const ad_schema_1 = __importDefault(require("../../../Schema/Ad/ad.schema"));
const activity_log_schema_1 = __importDefault(require("../../../Schema/ActivityLog/activity-log.schema"));
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
        await this.logActivity(stock._id, adId, logData, []);
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
        const stock = await stock_schema_1.default.findOne({ adId }).populate({
            path: "adId",
            select: "title description price"
        });
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
        if (!ad.stock) {
            throw new Error("No stock record found for this ad");
        }
        const stock = await stock_schema_1.default.findById(ad.stock);
        if (!stock) {
            throw new Error("Stock record not found");
        }
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
        await this.logActivity(stock._id, stock.adId, {
            userId: req.user._id,
            action: "adjusted",
            description: `Stock updated for ad: ${ad.title}`,
            reason: stockData.reason || "Stock update",
            metadata: {
                adTitle: ad.title,
                changes,
                userRole: req.user.role
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        }, changes);
        await stock.populate({
            path: "adId",
            select: "title description price"
        });
        return stock;
    }
    async logActivity(stockId, adId, logData, changes = []) {
        await activity_log_schema_1.default.create({
            stockId,
            adId,
            userId: logData.userId,
            action: logData.action,
            description: logData.description,
            changes,
            reason: logData.reason,
            metadata: logData.metadata,
            ipAddress: logData.ipAddress,
            userAgent: logData.userAgent,
        });
    }
}
exports.StockService = StockService;
exports.default = StockService;
