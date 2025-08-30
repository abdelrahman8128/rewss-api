"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBanHistoryController = void 0;
const ban_service_1 = require("../ban.service");
const banService = new ban_service_1.BanService();
const getBanHistoryController = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }
        const banHistory = await banService.getUserBanHistory(userId);
        return res.status(200).json({
            message: "Ban history retrieved successfully",
            data: banHistory,
        });
    }
    catch (error) {
        console.error("Error getting ban history:", error);
        return res.status(400).json({
            message: error.message || "Failed to get ban history",
        });
    }
};
exports.getBanHistoryController = getBanHistoryController;
