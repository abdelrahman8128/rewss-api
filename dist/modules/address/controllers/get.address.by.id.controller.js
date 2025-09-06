"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressByIdController = void 0;
const address_service_1 = require("../address.service");
const addressService = new address_service_1.AddressService();
const getAddressByIdController = async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.user._id;
        const address = await addressService.getAddressById(addressId, userId);
        if (!address) {
            return res.status(404).json({
                message: "Address not found",
            });
        }
        return res.status(200).json({
            message: "Address retrieved successfully",
            data: address,
        });
    }
    catch (error) {
        console.error("Error getting address by ID:", error);
        return res.status(500).json({
            message: error.message || "Failed to retrieve address",
        });
    }
};
exports.getAddressByIdController = getAddressByIdController;
