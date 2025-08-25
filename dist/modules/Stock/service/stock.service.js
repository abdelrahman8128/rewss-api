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
            availableQuantity: stockData.availableQuantity || 0,
            reservedQuantity: stockData.reservedQuantity || 0,
            soldQuantity: stockData.soldQuantity || 0,
            minimumOrderQuantity: stockData.minimumOrderQuantity || 1,
            status: stockData.status || 'available',
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
        if (adjustmentData.availableQuantity !== undefined && adjustmentData.availableQuantity !== stock.availableQuantity) {
            changes.push({ field: "availableQuantity", oldValue: stock.availableQuantity, newValue: adjustmentData.availableQuantity });
            stock.availableQuantity = adjustmentData.availableQuantity;
        }
        if (adjustmentData.reservedQuantity !== undefined && adjustmentData.reservedQuantity !== stock.reservedQuantity) {
            changes.push({ field: "reservedQuantity", oldValue: stock.reservedQuantity, newValue: adjustmentData.reservedQuantity });
            stock.reservedQuantity = adjustmentData.reservedQuantity;
        }
        if (adjustmentData.soldQuantity !== undefined && adjustmentData.soldQuantity !== stock.soldQuantity) {
            changes.push({ field: "soldQuantity", oldValue: stock.soldQuantity, newValue: adjustmentData.soldQuantity });
            stock.soldQuantity = adjustmentData.soldQuantity;
        }
        if (adjustmentData.minimumOrderQuantity !== undefined && adjustmentData.minimumOrderQuantity !== stock.minimumOrderQuantity) {
            changes.push({ field: "minimumOrderQuantity", oldValue: stock.minimumOrderQuantity, newValue: adjustmentData.minimumOrderQuantity });
            stock.minimumOrderQuantity = adjustmentData.minimumOrderQuantity;
        }
        if (adjustmentData.status !== undefined && adjustmentData.status !== stock.status) {
            changes.push({ field: "status", oldValue: stock.status, newValue: adjustmentData.status });
            stock.status = adjustmentData.status;
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
        if (stock.availableQuantity < quantity) {
            throw new Error("Insufficient stock available for reservation");
        }
        const previousAvailable = stock.availableQuantity;
        const previousReserved = stock.reservedQuantity;
        stock.availableQuantity -= quantity;
        stock.reservedQuantity += quantity;
        await stock.save();
        const changes = [
            { field: "availableQuantity", oldValue: previousAvailable, newValue: stock.availableQuantity },
            { field: "reservedQuantity", oldValue: previousReserved, newValue: stock.reservedQuantity },
        ];
        await this.logActivity(stockId, stock.adId, { ...logData, action: "reserved" }, changes);
        return stock;
    }
    async buyStock(stockId, quantity, logData) {
        const stock = await stock_schema_1.default.findById(stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }
        if (stock.reservedQuantity < quantity) {
            throw new Error("Insufficient reserved stock for purchase");
        }
        const previousReserved = stock.reservedQuantity;
        const previousSold = stock.soldQuantity;
        stock.reservedQuantity -= quantity;
        stock.soldQuantity += quantity;
        await stock.save();
        const changes = [
            { field: "reservedQuantity", oldValue: previousReserved, newValue: stock.reservedQuantity },
            { field: "soldQuantity", oldValue: previousSold, newValue: stock.soldQuantity },
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
