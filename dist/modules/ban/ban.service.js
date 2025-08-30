"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanService = void 0;
const ban_schema_1 = __importDefault(require("../../Schema/Ban/ban.schema"));
const user_schema_1 = __importDefault(require("../../Schema/User/user.schema"));
const mongoose_1 = require("mongoose");
class BanService {
    async banUser(userId, bannedBy, banDays, reason) {
        const user = await user_schema_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const existingBan = await ban_schema_1.default.findOne({
            userId: new mongoose_1.Types.ObjectId(userId),
            isActive: true,
        });
        if (existingBan) {
            throw new Error("User is already banned");
        }
        const banEndDate = new Date();
        banEndDate.setDate(banEndDate.getDate() + banDays);
        const ban = new ban_schema_1.default({
            userId: new mongoose_1.Types.ObjectId(userId),
            bannedBy: new mongoose_1.Types.ObjectId(bannedBy),
            reason,
            banStartDate: new Date(),
            banEndDate,
            isActive: true,
        });
        await ban.save();
        const updatedUser = await user_schema_1.default.findByIdAndUpdate(userId, { status: "ban" }, { new: true }).select("-password");
        if (!updatedUser) {
            throw new Error("Failed to update user status");
        }
        return { ban, user: updatedUser };
    }
    async unbanUser(userId, unbannedBy) {
        const user = await user_schema_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const ban = await ban_schema_1.default.findOne({
            userId: new mongoose_1.Types.ObjectId(userId),
            isActive: true,
        });
        if (!ban) {
            throw new Error("User is not banned");
        }
        ban.isActive = false;
        await ban.save();
        const updatedUser = await user_schema_1.default.findByIdAndUpdate(userId, { status: "active" }, { new: true }).select("-password");
        if (!updatedUser) {
            throw new Error("Failed to update user status");
        }
        return { ban, user: updatedUser };
    }
    async isUserBanned(userId) {
        const ban = await ban_schema_1.default.findOne({
            userId: new mongoose_1.Types.ObjectId(userId),
            isActive: true,
        });
        if (!ban) {
            return { isBanned: false };
        }
        if (new Date() > ban.banEndDate) {
            ban.isActive = false;
            await ban.save();
            await user_schema_1.default.findByIdAndUpdate(userId, { status: "active" });
            return { isBanned: false };
        }
        return { isBanned: true, ban };
    }
    async getUserBanHistory(userId) {
        return await ban_schema_1.default.find({
            userId: new mongoose_1.Types.ObjectId(userId),
        })
            .populate("bannedBy", "username name")
            .sort({ createdAt: -1 });
    }
    async getActiveBans() {
        return await ban_schema_1.default.find({ isActive: true })
            .populate("userId", "username name email")
            .populate("bannedBy", "username name")
            .sort({ createdAt: -1 });
    }
    async cleanupExpiredBans() {
        const expiredBans = await ban_schema_1.default.find({
            isActive: true,
            banEndDate: { $lt: new Date() },
        });
        if (expiredBans.length === 0) {
            return { cleaned: 0 };
        }
        const userIds = expiredBans.map((ban) => ban.userId);
        await ban_schema_1.default.updateMany({ _id: { $in: expiredBans.map((ban) => ban._id) } }, { isActive: false });
        await user_schema_1.default.updateMany({ _id: { $in: userIds } }, { status: "active" });
        return { cleaned: expiredBans.length };
    }
}
exports.BanService = BanService;
