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

    // Get stock with ad details using aggregation
    const stockResult = await Stock.aggregate([
      { $match: { adId: new Types.ObjectId(adId) } },
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

    let stock: IStock;

    // Check if stock exists, if not create one
    if (!ad.stock) {
      // Create new stock record with values from request
      stock = await Stock.create({
        adId: new Types.ObjectId(adId),
        availableQuantity: stockData.availableQuantity || 0,
        reservedQuantity: stockData.reservedQuantity || 0,
        soldQuantity: stockData.soldQuantity || 0,
        minimumOrderQuantity: stockData.minimumOrderQuantity || 1,
      });

      // Update ad with stock reference
      await Ad.findByIdAndUpdate(adId, { stock: stock._id });

      // Log the creation activity
      await this.logActivity(
        stock._id,
        stock.adId,
        {
          userId: req.user._id,
          action: "created",
          description: `Stock created for ad: ${ad.title}`,
          reason: stockData.reason || "Stock creation during update",
          metadata: { 
            adTitle: ad.title,
            userRole: req.user.role,
            createdDuringUpdate: true
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
        []
      );

      // Return the newly created stock
      await stock.populate({
        path: "adId",
        select: "title description price"
      });

      return stock;
    }

    // Get existing stock
    const existingStock = await Stock.findById(ad.stock);
    if (!existingStock) {
      throw new Error("Stock record not found");
    }
    stock = existingStock;

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
