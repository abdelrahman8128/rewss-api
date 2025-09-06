"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAddressesController = void 0;
const address_service_1 = require("../address.service");
const addressService = new address_service_1.AddressService();
const getUserAddressesController = async (req, res) => {
    try {
        const userId = req.user._id;
        const addresses = await addressService.getUserAddresses(userId);
        return res.status(200).json({
            message: "Addresses retrieved successfully",
            data: addresses,
            count: addresses.length,
        });
    }
    catch (error) {
        console.error("Error getting user addresses:", error);
        return res.status(500).json({
            message: error.message || "Failed to retrieve addresses",
        });
    }
};
exports.getUserAddressesController = getUserAddressesController;
