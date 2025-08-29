"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFavoritesController = void 0;
const user_service_1 = require("../user.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.listFavoritesController = (0, express_async_handler_1.default)(async (req, res) => {
    const userService = new user_service_1.UserService();
    try {
        const favorites = await userService.listFavorites(req.user._id, req.query);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            data: favorites,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }
});
