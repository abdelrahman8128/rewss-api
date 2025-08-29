"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_schema_1 = __importDefault(require("../../Schema/User/user.schema"));
const ad_schema_1 = __importDefault(require("../../Schema/Ad/ad.schema"));
const mongoose_1 = require("mongoose");
class UserService {
    async getUserData(userId) {
        const user = await user_schema_1.default.findById(userId).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    async toggleFavorites(userId, adId) {
        const ad = await ad_schema_1.default.findById(adId);
        if (!ad) {
            throw new Error("Ad not found");
        }
        const user = await user_schema_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const adObjectId = new mongoose_1.Types.ObjectId(String(adId));
        const isInFavorites = user.favorites.includes(adObjectId);
        let updatedUser;
        let message;
        let action;
        if (isInFavorites) {
            updatedUser = (await user_schema_1.default.findByIdAndUpdate(userId, { $pull: { favorites: adId } }, { new: true }).select("-password"));
            message = "Ad removed from favorites successfully";
            action = "removed";
        }
        else {
            updatedUser = (await user_schema_1.default.findByIdAndUpdate(userId, { $push: { favorites: adId } }, { new: true }).select("-password"));
            message = "Ad added to favorites successfully";
            action = "added";
        }
        if (!updatedUser) {
            throw new Error("Failed to update user favorites");
        }
        return { user: updatedUser, message, action };
    }
    async listFavorites(userId, query) {
        const user = await user_schema_1.default.findById(userId).select("favorites");
        if (!user) {
            throw new Error("User not found");
        }
        const pageNumber = Math.max(1, Number(query?.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(query?.limit) || 20));
        const skip = (pageNumber - 1) * pageSize;
        const filter = { _id: { $in: user.favorites } };
        const [items, total] = await Promise.all([
            ad_schema_1.default.find(filter)
                .select("-album -models._id")
                .populate([
                { path: "thumbnail", select: "imageUrl" },
                {
                    path: "models.model",
                    select: "-_id -createdAt -updatedAt -__v",
                    populate: { path: "brand", select: "name logo -_id" },
                },
                { path: "category" },
            ])
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize),
            ad_schema_1.default.countDocuments(filter),
        ]);
        return {
            items,
            page: pageNumber,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize) || 1,
        };
    }
    async removeFromFavorites(userId, adId) {
        const user = await user_schema_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (!user.favorites.includes(new mongoose_1.Types.ObjectId(String(adId)))) {
            throw new Error("Ad not in favorites");
        }
        const updatedUser = await user_schema_1.default.findByIdAndUpdate(userId, { $pull: { favorites: adId } }, { new: true }).select("-password");
        if (!updatedUser) {
            throw new Error("Failed to update user favorites");
        }
        return updatedUser;
    }
}
exports.UserService = UserService;
