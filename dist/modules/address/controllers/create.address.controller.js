"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAddressController = void 0;
const address_service_1 = require("../address.service");
const addressService = new address_service_1.AddressService();
const createAddressController = async (req, res) => {
    try {
        const addressData = req.body;
        const userId = req.user._id;
        const address = await addressService.createAddress(userId, addressData);
        return res.status(201).json({
            message: "Address created successfully",
            data: address,
        });
    }
    catch (error) {
        console.error("Error creating address:", error);
        return res.status(400).json({
            message: error.message || "Failed to create address",
        });
    }
};
exports.createAddressController = createAddressController;
