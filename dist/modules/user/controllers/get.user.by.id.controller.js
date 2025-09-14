"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByIdController = void 0;
const user_service_1 = require("../user.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const isSeller = (user) => {
    return user && user.role === "seller";
};
exports.getUserByIdController = (0, express_async_handler_1.default)(async (req, res) => {
    const userService = new user_service_1.UserService();
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "User ID is required",
            });
            return;
        }
        const userData = await userService.getUserData(userId);
        const publicUserData = {
            _id: userData._id,
            username: userData.username,
            name: userData.name,
            avatar: userData.avatar,
            role: userData.role,
            status: userData.status,
            createdAt: userData.createdAt,
            ...(isSeller(userData) && {
                logo: userData.logo,
                storePhotos: userData.storePhotos,
                physicalAddress: userData.physicalAddress,
                requiredDataStatus: userData.requiredDataStatus,
            }),
        };
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            data: publicUserData,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                success: false,
                message: error.message,
            });
        }
    }
});
