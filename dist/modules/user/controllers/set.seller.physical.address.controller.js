"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSellerPhysicalAddressController = void 0;
const user_service_1 = require("../user.service");
const userService = new user_service_1.UserService();
const setSellerPhysicalAddressController = async (req, res) => {
    try {
        const addressData = req.body;
        const sellerId = req.user._id;
        const seller = await userService.setSellerPhysicalAddress(sellerId, addressData);
        return res.status(201).json({
            message: "Physical address set successfully",
            data: {
                seller,
            },
        });
    }
    catch (error) {
        console.error("Error setting seller physical address:", error);
        return res.status(400).json({
            message: error.message || "Failed to set physical address",
        });
    }
};
exports.setSellerPhysicalAddressController = setSellerPhysicalAddressController;
