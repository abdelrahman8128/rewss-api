"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const stock_schema_1 = __importDefault(require("../../Schema/Stock/stock.schema"));
const activity_log_schema_1 = __importDefault(require("../../Schema/ActivityLog/activity-log.schema"));
class StockService {
    async createStock(adId, stockData, logData) {
        const existingStock = await stock_schema_1.default.findOne({ adId });
        if (existingStock) {
            throw new Error("Stock already exists for this ad");
        }
        const stock = await stock_schema_1.default.create({
            adId,
            ...stockData,
        });
        await this.logActivity(stock._id, adId, logData, [], stock.availableQuantity);
        return stock;
    }
    async getStockByAdId(adId) {
        return await stock_schema_1.default.findOne({ adId });
    }
    async getStockById(stockId) {
        return await stock_schema_1.default.findById(stockId);
    }
    async updateStock(stockId, updateData, logData) {
        const stock = await stock_schema_1.default.findById(stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }
        const previousQuantity = stock.availableQuantity;
        const changes = [];
        Object.keys(updateData).forEach((key) => {
            const oldValue = stock[key];
            const newValue = updateData[key];
            if (oldValue !== newValue) {
                changes.push({ field: key, oldValue, newValue });
            }
        });
        Object.assign(stock, updateData);
        await stock.save();
        await this.logActivity(stockId, stock.adId, logData, changes, stock.availableQuantity, previousQuantity);
        return stock;
    }
    async restockItem(stockId, quantity, logData) {
        const stock = await stock_schema_1.default.findById(stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }
        const previousQuantity = stock.availableQuantity;
        const previousTotal = stock.totalQuantity;
        stock.totalQuantity += quantity;
        stock.availableQuantity += quantity;
        stock.lastRestockedAt = new Date();
        await stock.save();
        const changes = [
            { field: "totalQuantity", oldValue: previousTotal, newValue: stock.totalQuantity },
            { field: "availableQuantity", oldValue: previousQuantity, newValue: stock.availableQuantity },
            { field: "lastRestockedAt", oldValue: null, newValue: stock.lastRestockedAt },
        ];
        await this.logActivity(stockId, stock.adId, { ...logData, action: "restocked" }, changes, stock.availableQuantity, previousQuantity, quantity);
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
        await this.logActivity(stockId, stock.adId, { ...logData, action: "reserved" }, changes, stock.availableQuantity, previousAvailable, -quantity);
        return stock;
    }
    async sellStock(stockId, quantity, logData) {
        const stock = await stock_schema_1.default.findById(stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }
        if (stock.reservedQuantity < quantity) {
            throw new Error("Insufficient reserved stock for sale");
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
        await this.logActivity(stockId, stock.adId, { ...logData, action: "sold" }, changes, stock.availableQuantity, stock.availableQuantity, quantity);
        return stock;
    }
    async cancelReservation(stockId, quantity, logData) {
        const stock = await stock_schema_1.default.findById(stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }
        if (stock.reservedQuantity < quantity) {
            throw new Error("Cannot cancel more than reserved quantity");
        }
        const previousAvailable = stock.availableQuantity;
        const previousReserved = stock.reservedQuantity;
        stock.availableQuantity += quantity;
        stock.reservedQuantity -= quantity;
        await stock.save();
        const changes = [
            { field: "availableQuantity", oldValue: previousAvailable, newValue: stock.availableQuantity },
            { field: "reservedQuantity", oldValue: previousReserved, newValue: stock.reservedQuantity },
        ];
        await this.logActivity(stockId, stock.adId, { ...logData, action: "cancelled" }, changes, stock.availableQuantity, previousAvailable, quantity);
        return stock;
    }
    async adjustStock(stockId, newQuantity, logData) {
        const stock = await stock_schema_1.default.findById(stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }
        const previousAvailable = stock.availableQuantity;
        const previousTotal = stock.totalQuantity;
        const difference = newQuantity - stock.availableQuantity;
        stock.availableQuantity = newQuantity;
        stock.totalQuantity = stock.reservedQuantity + stock.soldQuantity + newQuantity;
        await stock.save();
        const changes = [
            { field: "availableQuantity", oldValue: previousAvailable, newValue: stock.availableQuantity },
            { field: "totalQuantity", oldValue: previousTotal, newValue: stock.totalQuantity },
        ];
        await this.logActivity(stockId, stock.adId, { ...logData, action: "adjusted" }, changes, stock.availableQuantity, previousAvailable, difference);
        return stock;
    }
    async getStockActivity(stockId, limit = 50, offset = 0) {
        return await activity_log_schema_1.default.find({ stockId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(offset);
    }
    async getLowStockItems(threshold) {
        const query = threshold
            ? { availableQuantity: { $lte: threshold } }
            : { status: "low_stock" };
        return await stock_schema_1.default.find(query)
            .populate("adId", "title price")
            .sort({ availableQuantity: 1 });
    }
    async getOutOfStockItems() {
        return await stock_schema_1.default.find({ status: "out_of_stock" })
            .populate("adId", "title price")
            .sort({ updatedAt: -1 });
    }
    async logActivity(stockId, adId, logData, changes = [], newQuantity, previousQuantity, quantityChange) {
        await activity_log_schema_1.default.create({
            stockId,
            adId,
            userId: logData.userId,
            action: logData.action,
            description: logData.description,
            changes,
            quantityChange,
            previousQuantity,
            newQuantity,
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
        await this.logActivity(stockId, stock.adId, { ...logData, action: "updated", description: "Stock record deleted" }, [{ field: "deleted", oldValue: false, newValue: true }], 0, stock.availableQuantity);
        await stock_schema_1.default.findByIdAndDelete(stockId);
        return true;
    }
}
exports.StockService = StockService;
exports.default = StockService;
