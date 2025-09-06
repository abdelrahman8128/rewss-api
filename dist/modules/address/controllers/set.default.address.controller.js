"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultAddressController = void 0;
const address_service_1 = require("../address.service");
const addressService = new address_service_1.AddressService();
const setDefaultAddressController = async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.user._id;
        const address = await addressService.setDefaultAddress(addressId, userId);
        if (!address) {
            return res.status(404).json({
                message: "Address not found",
            });
        }
        return res.status(200).json({
            message: "Default address set successfully",
            data: address,
        });
    }
    catch (error) {
        console.error("Error setting default address:", error);
        return res.status(400).json({
            message: error.message || "Failed to set default address",
        });
    }
};
exports.setDefaultAddressController = setDefaultAddressController;
