"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingSellersController = void 0;
const admin_service_1 = __importDefault(require("../admin.service"));
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.getPendingSellersController = (0, express_async_handler_1.default)(async (req, res) => {
    const adminService = new admin_service_1.default();
    try {
        const result = await adminService.getPendingSellers(req.query);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Pending sellers retrieved successfully",
            data: result,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
});
