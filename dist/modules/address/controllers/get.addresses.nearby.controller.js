"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressesNearbyController = void 0;
const address_service_1 = require("../address.service");
const addressService = new address_service_1.AddressService();
const getAddressesNearbyController = async (req, res) => {
    try {
        const { latitude, longitude, radius } = req.query;
        if (!latitude || !longitude) {
            return res.status(400).json({
                message: "Latitude and longitude are required",
            });
        }
        const addresses = await addressService.getAddressesNearby(parseFloat(latitude), parseFloat(longitude), radius ? parseFloat(radius) : 10);
        return res.status(200).json({
            message: "Nearby addresses retrieved successfully",
            data: addresses,
            count: addresses.length,
        });
    }
    catch (error) {
        console.error("Error getting nearby addresses:", error);
        return res.status(500).json({
            message: error.message || "Failed to retrieve nearby addresses",
        });
    }
};
exports.getAddressesNearbyController = getAddressesNearbyController;
