"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unbanUserController = void 0;
const ban_service_1 = require("../ban.service");
const banService = new ban_service_1.BanService();
const unbanUserController = async (req, res) => {
    try {
        const { userId } = req.body;
        const adminId = req.user._id;
        const result = await banService.unbanUser(userId, adminId);
        return res.status(200).json({
            message: "User unbanned successfully",
            data: {
                ban: result.ban,
                user: result.user,
            },
        });
    }
    catch (error) {
        console.error("Error unbanning user:", error);
        return res.status(400).json({
            message: error.message || "Failed to unban user",
        });
    }
};
exports.unbanUserController = unbanUserController;
