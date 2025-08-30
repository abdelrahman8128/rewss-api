"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveBansController = void 0;
const ban_service_1 = require("../ban.service");
const banService = new ban_service_1.BanService();
const getActiveBansController = async (req, res) => {
    try {
        const activeBans = await banService.getActiveBans();
        return res.status(200).json({
            message: "Active bans retrieved successfully",
            data: activeBans,
        });
    }
    catch (error) {
        console.error("Error getting active bans:", error);
        return res.status(400).json({
            message: error.message || "Failed to get active bans",
        });
    }
};
exports.getActiveBansController = getActiveBansController;
