"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.banUserController = void 0;
const ban_service_1 = require("../ban.service");
const banService = new ban_service_1.BanService();
const banUserController = async (req, res) => {
    try {
        const { userId, banDays, reason } = req.body;
        const adminId = req.user._id;
        const result = await banService.banUser(userId, adminId, banDays, reason);
        return res.status(200).json({
            message: "User banned successfully",
            data: {
                ban: result.ban,
                user: result.user,
            },
        });
    }
    catch (error) {
        console.error("Error banning user:", error);
        return res.status(400).json({
            message: error.message || "Failed to ban user",
        });
    }
};
exports.banUserController = banUserController;
