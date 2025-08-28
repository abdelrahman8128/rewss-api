"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdController = void 0;
const ad_service_1 = __importDefault(require("../ad.service"));
const listAdController = async (req, res) => {
    try {
        const adService = new ad_service_1.default();
        const result = await adService.list(req);
        res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        res
            .status(400)
            .json({
            success: false,
            message: error?.message || "Failed to list ads",
        });
    }
};
exports.listAdController = listAdController;
