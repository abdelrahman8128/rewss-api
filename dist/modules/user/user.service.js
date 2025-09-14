"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_schema_1 = __importDefault(require("../../Schema/User/user.schema"));
const ad_schema_1 = __importDefault(require("../../Schema/Ad/ad.schema"));
const mongoose_1 = require("mongoose");
const seller_schema_1 = __importDefault(require("../../Schema/User/seller.schema"));
const s3_service_1 = require("../../service/s3.service");
const sharp_1 = __importDefault(require("sharp"));
class UserService {
    async getUserData(userId, includePassword = false) {
        const selectFields = includePassword ? "password" : "";
        const user = (await user_schema_1.default.findById(userId).select(selectFields));
        if (!user) {
            throw new Error("User not found");
        }
        if (user.role === "seller") {
            return user;
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
    async searchUsers(query) {
        const pageNumber = Math.max(1, Number(query?.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(query?.limit) || 20));
        const skip = (pageNumber - 1) * pageSize;
        const filter = {};
        if (query.search) {
            const searchRegex = new RegExp(query.search, "i");
            filter.$or = [
                { phoneNumber: searchRegex },
                { email: searchRegex },
                { username: searchRegex },
            ];
        }
        if (query.status) {
            filter.status = query.status;
        }
        if (query.role) {
            filter.role = query.role;
        }
        const [users, total] = await Promise.all([
            user_schema_1.default.find(filter)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize),
            user_schema_1.default.countDocuments(filter),
        ]);
        return {
            users,
            page: pageNumber,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize) || 1,
        };
    }
    async updateUser(userId, payload, files) {
        if (payload.email) {
            payload.isEmailVerified = false;
        }
        if (payload.phoneNumber) {
            payload.isPhoneVerified = false;
        }
        let user = await user_schema_1.default.findByIdAndUpdate(userId, payload, {
            new: true,
        });
        if (!user) {
            throw new Error("User not found");
        }
        const storePhotosFiles = [];
        for (const f of files) {
            if (f.fieldname === "avatar") {
                await this.changeAvatar(userId, f);
            }
            if (user.role === "seller") {
                if (f.fieldname === "logo") {
                    await this.changeLogo(userId, f);
                }
                if (f.fieldname === "storePhoto") {
                    storePhotosFiles.push(f);
                }
            }
        }
        if (storePhotosFiles.length > 0) {
            await this.changeStorePhotos(userId, storePhotosFiles, payload.storePhoto);
        }
        const updatedUser = await user_schema_1.default.findById(userId);
        return updatedUser;
    }
    async changeAvatar(userId, avatar) {
        try {
            const user = await user_schema_1.default.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            const s3Service = new s3_service_1.S3Service();
            if (user.avatar?.imageId) {
                await s3Service.delete(user.avatar.imageId);
            }
            const compressedBuffer = await (0, sharp_1.default)(avatar.buffer)
                .resize(300, 300, {
                fit: "cover",
                position: "center",
            })
                .jpeg({
                quality: 70,
                progressive: true,
            })
                .toBuffer();
            const newImage = await s3Service.upload({
                Bucket: process.env.S3_BUCKET,
                Key: `users/avatar/${userId}-${Date.now()}.jpg`,
                Body: compressedBuffer,
                ContentType: "image/jpeg",
                ACL: "public-read",
            });
            user.avatar = {
                imageId: newImage.key,
                imageUrl: newImage.url,
            };
            await user.save();
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    async changeLogo(userId, logo) {
        try {
            const seller = await seller_schema_1.default.findById(userId);
            if (!seller) {
                throw new Error("Seller not found");
            }
            const s3Service = new s3_service_1.S3Service();
            if (seller.logo?.imageId) {
                await s3Service.delete(seller.logo.imageId);
            }
            const compressedBuffer = await (0, sharp_1.default)(logo.buffer)
                .resize(300, 300, {
                fit: "cover",
                position: "center",
            })
                .jpeg({
                quality: 70,
                progressive: true,
            })
                .toBuffer();
            const newImage = await s3Service.upload({
                Bucket: process.env.S3_BUCKET,
                Key: `users/logo/${userId}-${Date.now()}.jpg`,
                Body: compressedBuffer,
                ContentType: "image/jpeg",
                ACL: "public-read",
            });
            seller.logo = {
                imageId: newImage.key,
                imageUrl: newImage.url,
            };
            await seller.save();
            return seller;
        }
        catch (error) {
            throw error;
        }
    }
    async changeStorePhotos(userId, storePhotos, existingPhotoKeys) {
        try {
            const seller = await seller_schema_1.default.findById(userId);
            if (!seller) {
                throw new Error("Seller not found");
            }
            console.log("existingPhotoKeys", existingPhotoKeys);
            const s3Service = new s3_service_1.S3Service();
            const photosToKeep = [];
            const photosToDelete = [];
            if (seller.storePhotos && seller.storePhotos.length > 0) {
                for (const photo of seller.storePhotos) {
                    if (photo._id) {
                        if (existingPhotoKeys &&
                            existingPhotoKeys.includes(photo._id.toString())) {
                            photosToKeep.push(photo);
                        }
                        else {
                            photosToDelete.push(photo);
                        }
                    }
                }
            }
            for (const photo of photosToDelete) {
                if (photo.imageId) {
                    await s3Service.delete(photo.imageId);
                }
            }
            const newProcessedPhotos = [];
            for (const photo of storePhotos) {
                const compressedBuffer = await (0, sharp_1.default)(photo.buffer)
                    .jpeg({
                    quality: 70,
                    progressive: true,
                })
                    .toBuffer();
                const newImage = await s3Service.upload({
                    Bucket: process.env.S3_BUCKET,
                    Key: `users/sellers/${seller.username}/storePhotos/${userId}-${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 11)}.jpg`,
                    Body: compressedBuffer,
                    ContentType: "image/jpeg",
                    ACL: "public-read",
                });
                newProcessedPhotos.push({
                    _id: new mongoose_1.Types.ObjectId(),
                    imageId: newImage.key,
                    imageUrl: newImage.url,
                });
            }
            seller.storePhotos = [...photosToKeep, ...newProcessedPhotos];
            await seller.save();
            return seller;
        }
        catch (error) {
            throw error;
        }
    }
    async setSellerPhysicalAddress(sellerId, addressData) {
        const seller = await seller_schema_1.default.findById(sellerId);
        if (!seller) {
            throw new Error("Seller not found");
        }
        if (seller.role !== "seller") {
            throw new Error("User is not a seller");
        }
        seller.physicalAddress = addressData;
        await seller.save();
        return seller;
    }
}
exports.UserService = UserService;
