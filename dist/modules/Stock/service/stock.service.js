"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const stock_schema_1 = __importDefault(require("../../../Schema/Stock/stock.schema"));
const activity_log_schema_1 = __importDefault(require("../../../Schema/ActivityLog/activity-log.schema"));
class StockService {
    async createStock(adId, stockData, logData) {
        const existingStock = await stock_schema_1.default.findOne({ adId });
        if (existingStock) {
            throw new Error("Stock already exists for this ad");
        }
        const stock = await stock_schema_1.default.create({
            adId,
            available: stockData.available || 0,
            reserved: stockData.reserved || 0,
            bought: stockData.bought || 0,
        });
        await this.logActivity(stock._id, adId, logData, []);
        return stock;
    }
    async getStockByAdId(adId) {
        return await stock_schema_1.default.findOne({ adId });
    }
    async getStockById(stockId) {
        return await stock_schema_1.default.findById(stockId);
    }
    async adjustStock(stockId, adjustmentData, logData) {
        const stock = await stock_schema_1.default.findById(stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }
        const changes = [];
        if (adjustmentData.available !== undefined && adjustmentData.available !== stock.available) {
            changes.push({ field: "available", oldValue: stock.available, newValue: adjustmentData.available });
            stock.available = adjustmentData.available;
        }
        if (adjustmentData.reserved !== undefined && adjustmentData.reserved !== stock.reserved) {
            changes.push({ field: "reserved", oldValue: stock.reserved, newValue: adjustmentData.reserved });
            stock.reserved = adjustmentData.reserved;
        }
        if (adjustmentData.bought !== undefined && adjustmentData.bought !== stock.bought) {
            changes.push({ field: "bought", oldValue: stock.bought, newValue: adjustmentData.bought });
            stock.bought = adjustmentData.bought;
        }
        await stock.save();
        await this.logActivity(stockId, stock.adId, { ...logData, action: "adjusted" }, changes);
        return stock;
    }
    async reserveStock(stockId, quantity, logData) {
        const stock = await stock_schema_1.default.findById(stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }
        if (stock.available < quantity) {
            throw new Error("Insufficient stock available for reservation");
        }
        const previousAvailable = stock.available;
        const previousReserved = stock.reserved;
        stock.available -= quantity;
        stock.reserved += quantity;
        await stock.save();
        const changes = [
            { field: "available", oldValue: previousAvailable, newValue: stock.available },
            { field: "reserved", oldValue: previousReserved, newValue: stock.reserved },
        ];
        await this.logActivity(stockId, stock.adId, { ...logData, action: "reserved" }, changes);
        return stock;
    }
    async buyStock(stockId, quantity, logData) {
        const stock = await stock_schema_1.default.findById(stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }
        if (stock.reserved < quantity) {
            throw new Error("Insufficient reserved stock for purchase");
        }
        const previousReserved = stock.reserved;
        const previousBought = stock.bought;
        stock.reserved -= quantity;
        stock.bought += quantity;
        await stock.save();
        const changes = [
            { field: "reserved", oldValue: previousReserved, newValue: stock.reserved },
            { field: "bought", oldValue: previousBought, newValue: stock.bought },
        ];
        await this.logActivity(stockId, stock.adId, { ...logData, action: "bought" }, changes);
        return stock;
    }
    async getStockActivity(stockId, limit = 50, offset = 0) {
        return await activity_log_schema_1.default.find({ stockId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(offset);
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
    async deleteStock(stockId, logData) {
        const stock = await stock_schema_1.default.findById(stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }
        await this.logActivity(stockId, stock.adId, { ...logData, action: "adjusted", description: "Stock record deleted" }, [{ field: "deleted", oldValue: false, newValue: true }]);
        await stock_schema_1.default.findByIdAndDelete(stockId);
        return true;
    }
}
exports.StockService = StockService;
exports.default = StockService;
