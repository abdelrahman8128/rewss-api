"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFavoritesController = void 0;
const user_service_1 = require("../user.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.toggleFavoritesController = (0, express_async_handler_1.default)(async (req, res) => {
    const userService = new user_service_1.UserService();
    try {
        const userId = req.user?._id;
        const { adId } = req.params;
        if (!adId) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Ad ID is required",
            });
            return;
        }
        const result = await userService.toggleFavorites(userId, adId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: result.message,
            user: result.user,
            action: result.action,
        });
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
});
