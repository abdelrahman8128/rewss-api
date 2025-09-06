"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressStatsController = void 0;
const address_service_1 = require("../address.service");
const addressService = new address_service_1.AddressService();
const getAddressStatsController = async (req, res) => {
    try {
        const stats = await addressService.getAddressStats();
        return res.status(200).json({
            message: "Address statistics retrieved successfully",
            data: stats,
        });
    }
    catch (error) {
        console.error("Error getting address statistics:", error);
        return res.status(500).json({
            message: error.message || "Failed to retrieve address statistics",
        });
    }
};
exports.getAddressStatsController = getAddressStatsController;
