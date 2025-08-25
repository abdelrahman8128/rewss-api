import Stock, { IStock } from "../../../Schema/Stock/stock.schema";
import Ad from "../../../Schema/Ad/ad.schema";
import ActivityLog from "../../../Schema/ActivityLog/activity-log.schema";
import { Types } from "mongoose";

export class StockService {
  
  async createStock(adId: Types.ObjectId, stockData: Partial<IStock>, logData: {
    userId: Types.ObjectId;
    action: "created" | "adjusted" | "reserved" | "bought";
    description: string;
    reason?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<IStock> {
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

  async getStockByAd(req: any): Promise<IStock> {
    const { adId } = req.params;
    
    // Check if ad exists
    const ad = await Ad.findById(adId);
    if (!ad) {
      throw new Error("Ad not found");
    }

    // Check authorization for sellers
    if (req.user.role === "seller" && ad.userId.toString() !== req.user._id.toString()) {
      throw new Error("You can only view stock for your own ads");
    }

    // Get stock with ad details
    const stock = await Stock.findOne({ adId }).populate({
      path: "adId",
      select: "title description price"
    });
    
    if (!stock) {
      throw new Error("Stock not found for this ad");
    }

    return stock;
  }

  async updateStock(req: any): Promise<IStock> {
    const { adId } = req.params;
    const stockData = req.body;
    
    // Check if ad exists and belongs to seller
    const ad = await Ad.findById(adId);
    if (!ad) {
      throw new Error("Ad not found");
    }

    if (req.user.role === "seller" && ad.userId.toString() !== req.user._id.toString()) {
      throw new Error("You can only update stock for your own ads");
    }

    if (!ad.stock) {
      throw new Error("No stock record found for this ad");
    }

    // Get current stock
    const stock = await Stock.findById(ad.stock);
    if (!stock) {
      throw new Error("Stock record not found");
    }

    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    // Track changes for activity log
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

    // Log the update activity
    await this.logActivity(
      stock._id,
      stock.adId,
      {
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
      },
      changes
    );

    // Return updated stock with ad details
    await stock.populate({
      path: "adId",
      select: "title description price"
    });

    return stock;
  }

  private async logActivity(
    stockId: Types.ObjectId,
    adId: Types.ObjectId,
    logData: {
      userId: Types.ObjectId;
      action: "created" | "adjusted" | "reserved" | "bought";
      description: string;
      reason?: string;
      metadata?: any;
      ipAddress?: string;
      userAgent?: string;
    },
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
}

export default StockService;
