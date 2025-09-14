"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserController = void 0;
const user_service_1 = require("../user.service");
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.updateUserController = (0, express_async_handler_1.default)(async (req, res) => {
    const userService = new user_service_1.UserService();
    try {
        const updatedUser = await userService.updateUser(req.user._id, req.body, req.files);
        if (!updatedUser) {
            res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json({ message: "User not updated" });
            return;
        }
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "User updated successfully", data: updatedUser });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
