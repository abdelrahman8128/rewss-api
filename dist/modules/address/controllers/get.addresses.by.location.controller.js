"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressesByLocationController = void 0;
const address_service_1 = require("../address.service");
const addressService = new address_service_1.AddressService();
const getAddressesByLocationController = async (req, res) => {
    try {
        const { country, gov, city } = req.query;
        const addresses = await addressService.getAddressesByLocation(country, gov, city);
        return res.status(200).json({
            message: "Addresses retrieved successfully",
            data: addresses,
            count: addresses.length,
        });
    }
    catch (error) {
        console.error("Error getting addresses by location:", error);
        return res.status(500).json({
            message: error.message || "Failed to retrieve addresses",
        });
    }
};
exports.getAddressesByLocationController = getAddressesByLocationController;
