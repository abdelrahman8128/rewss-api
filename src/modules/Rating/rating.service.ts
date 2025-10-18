import { Model } from "mongoose";
import { IRating } from "../../Schema/Rating/rating.schema";
import Ad from "../../Schema/Ad/ad.schema";
import User from "../../Schema/User/user.schema";

export class RatingService {
  private ratingModel: Model<IRating>;

  constructor() {
    // Initialize the model - this will be set up properly in the main app
    this.ratingModel = require("mongoose").model(
      "Rating",
      require("../../Schema/Rating/rating.schema").RatingSchema
    );
  }

  async createRating(ratingData: Partial<IRating>): Promise<IRating> {
    const rating = new this.ratingModel(ratingData);
    const savedRating = await rating.save();

    // Update cached ratings for the ad and seller
    await this.updateCachedRatings(savedRating.adId, savedRating.sellerId);

    return savedRating;
  }

  async getRatingsByAd(adId: string): Promise<IRating[]> {
    return this.ratingModel.find({ adId }).exec();
  }

  async getRatingsBySeller(sellerId: string): Promise<IRating[]> {
    return this.ratingModel.find({ sellerId }).exec();
  }

  async getRatingsByBuyer(buyerId: string): Promise<IRating[]> {
    return this.ratingModel.find({ buyerId }).exec();
  }

  async updateRating(
    ratingId: string,
    updateData: Partial<IRating>
  ): Promise<IRating | null> {
    const updatedRating = await this.ratingModel
      .findByIdAndUpdate(ratingId, updateData, { new: true })
      .exec();

    if (updatedRating) {
      // Update cached ratings for the ad and seller
      await this.updateCachedRatings(
        updatedRating.adId,
        updatedRating.sellerId
      );
    }

    return updatedRating;
  }

  async deleteRating(ratingId: string): Promise<IRating | null> {
    const deletedRating = await this.ratingModel
      .findByIdAndDelete(ratingId)
      .exec();

    if (deletedRating) {
      // Update cached ratings for the ad and seller
      await this.updateCachedRatings(
        deletedRating.adId,
        deletedRating.sellerId
      );
    }

    return deletedRating;
  }

  async calculateProductRating(
    adId: string
  ): Promise<{ averageRating: number; totalRatings: number }> {
    // Get all buyer ratings for this specific product/ad
    const ratings = await this.ratingModel.find({ adId }).exec();

    if (ratings.length === 0) {
      return { averageRating: 0, totalRatings: 0 };
    }

    // Calculate average rating from all buyer ratings for this product
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings: ratings.length,
    };
  }

  async calculateSellerRating(
    sellerId: string
  ): Promise<{ averageRating: number; totalRatings: number }> {
    // Get all ratings for all products/ads that belong to this seller
    const ratings = await this.ratingModel.find({ sellerId }).exec();

    if (ratings.length === 0) {
      return { averageRating: 0, totalRatings: 0 };
    }

    // Calculate average rating from all buyer ratings across all seller's products
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings: ratings.length,
    };
  }

  async getProductWithRating(adId: string): Promise<any> {
    const ratingData = await this.calculateProductRating(adId);
    return {
      adId,
      ...ratingData,
    };
  }

  async getSellerWithRating(sellerId: string): Promise<any> {
    const ratingData = await this.calculateSellerRating(sellerId);
    return {
      sellerId,
      ...ratingData,
    };
  }

  // Update cached ratings in Ad and User documents
  private async updateCachedRatings(
    adId: string,
    sellerId: string
  ): Promise<void> {
    try {
      // Update ad rating cache
      const adRatingData = await this.calculateProductRating(adId);
      await Ad.findByIdAndUpdate(adId, {
        rating: adRatingData,
      });

      // Update seller rating cache
      const sellerRatingData = await this.calculateSellerRating(sellerId);
      await User.findByIdAndUpdate(sellerId, {
        rating: sellerRatingData,
      });
    } catch (error) {
      console.error("Error updating cached ratings:", error);
    }
  }

  // Get cached rating for a product (from Ad document)
  async getCachedProductRating(
    adId: string
  ): Promise<{ averageRating: number; totalRatings: number }> {
    const ad = await Ad.findById(adId).select("rating");
    if (ad && ad.rating) {
      return {
        averageRating: ad.rating.averageRating,
        totalRatings: ad.rating.totalRatings,
      };
    }
    return { averageRating: 0, totalRatings: 0 };
  }

  // Get cached rating for a seller (from User document)
  async getCachedSellerRating(
    sellerId: string
  ): Promise<{ averageRating: number; totalRatings: number }> {
    const user = await User.findById(sellerId).select("rating");
    if (user && (user as any).rating) {
      return {
        averageRating: (user as any).rating.averageRating,
        totalRatings: (user as any).rating.totalRatings,
      };
    }
    return { averageRating: 0, totalRatings: 0 };
  }

  // Recalculate all ratings for existing data (useful for migration)
  async recalculateAllRatings(): Promise<void> {
    try {
      // Get all ads and recalculate their ratings
      const ads = await Ad.find({}).select("_id");
      for (const ad of ads) {
        const ratingData = await this.calculateProductRating(ad._id.toString());
        await Ad.findByIdAndUpdate(ad._id, { rating: ratingData });
      }

      // Get all sellers and recalculate their ratings
      const sellers = await User.find({ role: "seller" }).select("_id");
      for (const seller of sellers) {
        const ratingData = await this.calculateSellerRating(
          (seller._id as any).toString()
        );
        await User.findByIdAndUpdate(seller._id, { rating: ratingData });
      }

      console.log("All ratings recalculated successfully");
    } catch (error) {
      console.error("Error recalculating all ratings:", error);
      throw error;
    }
  }
}
