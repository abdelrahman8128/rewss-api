"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressController = void 0;
const address_service_1 = require("../address.service");
const addressService = new address_service_1.AddressService();
const updateAddressController = async (req, res) => {
    try {
        const { addressId } = req.params;
        const updateData = req.body;
        const userId = req.user._id;
        const address = await addressService.updateAddress(addressId, userId, updateData);
        if (!address) {
            return res.status(404).json({
                message: "Address not found",
            });
        }
        return res.status(200).json({
            message: "Address updated successfully",
            data: address,
        });
    }
    catch (error) {
        console.error("Error updating address:", error);
        return res.status(400).json({
            message: error.message || "Failed to update address",
        });
    }
};
exports.updateAddressController = updateAddressController;
