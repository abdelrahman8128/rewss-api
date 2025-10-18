"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingService = void 0;
const ad_schema_1 = __importDefault(require("../../Schema/Ad/ad.schema"));
const user_schema_1 = __importDefault(require("../../Schema/User/user.schema"));
class RatingService {
    constructor() {
        this.ratingModel = require("mongoose").model("Rating", require("../../Schema/Rating/rating.schema").RatingSchema);
    }
    async createRating(ratingData) {
        const rating = new this.ratingModel(ratingData);
        const savedRating = await rating.save();
        await this.updateCachedRatings(savedRating.adId, savedRating.sellerId);
        return savedRating;
    }
    async getRatingsByAd(adId) {
        return this.ratingModel.find({ adId }).exec();
    }
    async getRatingsBySeller(sellerId) {
        return this.ratingModel.find({ sellerId }).exec();
    }
    async getRatingsByBuyer(buyerId) {
        return this.ratingModel.find({ buyerId }).exec();
    }
    async updateRating(ratingId, updateData) {
        const updatedRating = await this.ratingModel
            .findByIdAndUpdate(ratingId, updateData, { new: true })
            .exec();
        if (updatedRating) {
            await this.updateCachedRatings(updatedRating.adId, updatedRating.sellerId);
        }
        return updatedRating;
    }
    async deleteRating(ratingId) {
        const deletedRating = await this.ratingModel
            .findByIdAndDelete(ratingId)
            .exec();
        if (deletedRating) {
            await this.updateCachedRatings(deletedRating.adId, deletedRating.sellerId);
        }
        return deletedRating;
    }
    async calculateProductRating(adId) {
        const ratings = await this.ratingModel.find({ adId }).exec();
        if (ratings.length === 0) {
            return { averageRating: 0, totalRatings: 0 };
        }
        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = totalRating / ratings.length;
        return {
            averageRating: Math.round(averageRating * 10) / 10,
            totalRatings: ratings.length,
        };
    }
    async calculateSellerRating(sellerId) {
        const ratings = await this.ratingModel.find({ sellerId }).exec();
        if (ratings.length === 0) {
            return { averageRating: 0, totalRatings: 0 };
        }
        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = totalRating / ratings.length;
        return {
            averageRating: Math.round(averageRating * 10) / 10,
            totalRatings: ratings.length,
        };
    }
    async getProductWithRating(adId) {
        const ratingData = await this.calculateProductRating(adId);
        return {
            adId,
            ...ratingData,
        };
    }
    async getSellerWithRating(sellerId) {
        const ratingData = await this.calculateSellerRating(sellerId);
        return {
            sellerId,
            ...ratingData,
        };
    }
    async updateCachedRatings(adId, sellerId) {
        try {
            const adRatingData = await this.calculateProductRating(adId);
            await ad_schema_1.default.findByIdAndUpdate(adId, {
                rating: adRatingData,
            });
            const sellerRatingData = await this.calculateSellerRating(sellerId);
            await user_schema_1.default.findByIdAndUpdate(sellerId, {
                rating: sellerRatingData,
            });
        }
        catch (error) {
            console.error("Error updating cached ratings:", error);
        }
    }
    async getCachedProductRating(adId) {
        const ad = await ad_schema_1.default.findById(adId).select("rating");
        if (ad && ad.rating) {
            return {
                averageRating: ad.rating.averageRating,
                totalRatings: ad.rating.totalRatings,
            };
        }
        return { averageRating: 0, totalRatings: 0 };
    }
    async getCachedSellerRating(sellerId) {
        const user = await user_schema_1.default.findById(sellerId).select("rating");
        if (user && user.rating) {
            return {
                averageRating: user.rating.averageRating,
                totalRatings: user.rating.totalRatings,
            };
        }
        return { averageRating: 0, totalRatings: 0 };
    }
    async recalculateAllRatings() {
        try {
            const ads = await ad_schema_1.default.find({}).select("_id");
            for (const ad of ads) {
                const ratingData = await this.calculateProductRating(ad._id.toString());
                await ad_schema_1.default.findByIdAndUpdate(ad._id, { rating: ratingData });
            }
            const sellers = await user_schema_1.default.find({ role: "seller" }).select("_id");
            for (const seller of sellers) {
                const ratingData = await this.calculateSellerRating(seller._id.toString());
                await user_schema_1.default.findByIdAndUpdate(seller._id, { rating: ratingData });
            }
            console.log("All ratings recalculated successfully");
        }
        catch (error) {
            console.error("Error recalculating all ratings:", error);
            throw error;
        }
    }
}
exports.RatingService = RatingService;
