import Stock, { IStock } from "../../../Schema/Stock/stock.schema";
import ActivityLog from "../../../Schema/ActivityLog/activity-log.schema";
import { Types } from "mongoose";

export interface StockAdjustmentData {
  available?: number;
  reserved?: number;
  bought?: number;
}

export interface ActivityLogData {
  userId: Types.ObjectId;
  action: "created" | "adjusted" | "reserved" | "bought";
  description: string;
  reason?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class StockService {
  
  async createStock(adId: Types.ObjectId, stockData: Partial<IStock>, logData: ActivityLogData): Promise<IStock> {
    // Check if stock already exists for this ad
    const existingStock = await Stock.findOne({ adId });
    if (existingStock) {
      throw new Error("Stock already exists for this ad");
    }

    const stock = await Stock.create({
      adId,
      available: stockData.available || 0,
      reserved: stockData.reserved || 0,
      bought: stockData.bought || 0,
    });

    // Log the creation activity
    await this.logActivity(stock._id, adId, logData, []);

    return stock;
  }

  async getStockByAdId(adId: Types.ObjectId): Promise<IStock | null> {
    return await Stock.findOne({ adId });
  }

  async getStockById(stockId: Types.ObjectId): Promise<IStock | null> {
    return await Stock.findById(stockId);
  }

  async adjustStock(stockId: Types.ObjectId, adjustmentData: StockAdjustmentData, logData: ActivityLogData): Promise<IStock> {
    const stock = await Stock.findById(stockId);
    if (!stock) {
      throw new Error("Stock not found");
    }

    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    // Track changes for activity log
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

    // Log the adjustment activity
    await this.logActivity(
      stockId,
      stock.adId,
      { ...logData, action: "adjusted" },
      changes
    );

    return stock;
  }

  async reserveStock(stockId: Types.ObjectId, quantity: number, logData: ActivityLogData): Promise<IStock> {
    const stock = await Stock.findById(stockId);
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

    // Log the reservation activity
    await this.logActivity(
      stockId,
      stock.adId,
      { ...logData, action: "reserved" },
      changes
    );

    return stock;
  }

  async buyStock(stockId: Types.ObjectId, quantity: number, logData: ActivityLogData): Promise<IStock> {
    const stock = await Stock.findById(stockId);
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

    // Log the purchase activity
    await this.logActivity(
      stockId,
      stock.adId,
      { ...logData, action: "bought" },
      changes
    );

    return stock;
  }

  async getStockActivity(stockId: Types.ObjectId, limit: number = 50, offset: number = 0) {
    return await ActivityLog.find({ stockId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
  }

  private async logActivity(
    stockId: Types.ObjectId,
    adId: Types.ObjectId,
    logData: ActivityLogData,
    changes: { field: string; oldValue: any; newValue: any }[] = []
  ) {
    await ActivityLog.create({
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

  async deleteStock(stockId: Types.ObjectId, logData: ActivityLogData): Promise<boolean> {
    const stock = await Stock.findById(stockId);
    if (!stock) {
      throw new Error("Stock not found");
    }

    // Log the deletion activity before deleting
    await this.logActivity(
      stockId,
      stock.adId,
      { ...logData, action: "adjusted", description: "Stock record deleted" },
      [{ field: "deleted", oldValue: false, newValue: true }]
    );

    await Stock.findByIdAndDelete(stockId);
    return true;
  }
}

export default StockService;
