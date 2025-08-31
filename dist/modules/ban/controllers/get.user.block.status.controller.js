"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBlockStatusController = void 0;
const ban_service_1 = require("../ban.service");
const banService = new ban_service_1.BanService();
const getUserBlockStatusController = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await banService.getUserBlockStatus(userId);
        res.status(200).json({
            message: "User block status retrieved successfully",
            data: {
                isBlocked: result.isBlocked,
                user: result.user,
            },
        });
    }
    catch (error) {
        console.error("Error getting user block status:", error);
        res.status(400).json({
            message: error.message || "Failed to get user block status",
        });
    }
};
exports.getUserBlockStatusController = getUserBlockStatusController;
