"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockUserController = void 0;
const ban_service_1 = require("../ban.service");
const banService = new ban_service_1.BanService();
const blockUserController = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await banService.toggleUserBlock(userId);
        const message = result.action === "blocked"
            ? "User blocked successfully"
            : "User unblocked successfully";
        res.status(200).json({
            message,
            data: result.user,
            action: result.action,
        });
    }
    catch (error) {
        console.error("Error toggling user block status:", error);
        res.status(400).json({
            message: error.message || "Failed to toggle user block status",
        });
    }
};
exports.blockUserController = blockUserController;
