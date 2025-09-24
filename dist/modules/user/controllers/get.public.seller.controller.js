"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicSellerController = void 0;
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_service_1 = require("../user.service");
exports.getPublicSellerController = (0, express_async_handler_1.default)(async (req, res) => {
    const userService = new user_service_1.UserService();
    const { sellerId } = req.params;
    if (!sellerId) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Seller ID is required",
        });
        return;
    }
    const userData = (await userService.getUserData(sellerId));
    if (!userData || userData.role !== "seller") {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Seller not found",
        });
        return;
    }
    const publicSeller = {
        _id: userData._id,
        username: userData.username,
        name: userData.name,
        avatar: userData.avatar,
        role: userData.role,
        createdAt: userData.createdAt,
        logo: userData.logo,
        storePhotos: userData.storePhotos,
        physicalAddress: userData.physicalAddress,
        requiredDataStatus: userData.requiredDataStatus,
    };
    res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, data: publicSeller });
});
