"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugAuthController = void 0;
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.debugAuthController = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        console.log("=== DEBUG AUTH ===");
        console.log("Headers:", req.headers);
        console.log("Authorization header:", req.headers.authorization);
        console.log("User object:", req.user);
        console.log("User ID:", req.user?.id);
        console.log("User _ID:", req.user?._id);
        console.log("==================");
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Debug info logged",
            headers: req.headers,
            user: req.user,
            userId: req.user?.id,
            user_Id: req.user?._id,
        });
    }
    catch (error) {
        console.error("Debug auth error:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Debug error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
