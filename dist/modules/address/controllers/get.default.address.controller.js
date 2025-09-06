"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultAddressController = void 0;
const address_service_1 = require("../address.service");
const addressService = new address_service_1.AddressService();
const getDefaultAddressController = async (req, res) => {
    try {
        const userId = req.user._id;
        const address = await addressService.getDefaultAddress(userId);
        if (!address) {
            return res.status(404).json({
                message: "No default address found",
            });
        }
        return res.status(200).json({
            message: "Default address retrieved successfully",
            data: address,
        });
    }
    catch (error) {
        console.error("Error getting default address:", error);
        return res.status(500).json({
            message: error.message || "Failed to retrieve default address",
        });
    }
};
exports.getDefaultAddressController = getDefaultAddressController;
