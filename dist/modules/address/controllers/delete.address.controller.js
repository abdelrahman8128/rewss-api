"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddressController = void 0;
const address_service_1 = require("../address.service");
const addressService = new address_service_1.AddressService();
const deleteAddressController = async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.user._id;
        const deleted = await addressService.deleteAddress(addressId, userId);
        if (!deleted) {
            return res.status(404).json({
                message: "Address not found",
            });
        }
        return res.status(200).json({
            message: "Address deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting address:", error);
        return res.status(500).json({
            message: error.message || "Failed to delete address",
        });
    }
};
exports.deleteAddressController = deleteAddressController;
