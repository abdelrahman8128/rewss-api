import Stock, { IStock } from "../../../Schema/Stock/stock.schema";
import ActivityLog from "../../../Schema/ActivityLog/activity-log.schema";
import { Types } from "mongoose";

export interface StockAdjustmentData {
  availableQuantity?: number;
  reservedQuantity?: number;
  soldQuantity?: number;
  minimumOrderQuantity?: number;
  status?: 'available' | 'out_of_stock' | 'low_stock';
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
      availableQuantity: stockData.availableQuantity || 0,
      reservedQuantity: stockData.reservedQuantity || 0,
      soldQuantity: stockData.soldQuantity || 0,
      minimumOrderQuantity: stockData.minimumOrderQuantity || 1,
      status: stockData.status || 'available',
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
