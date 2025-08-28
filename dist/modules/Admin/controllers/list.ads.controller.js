"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdminAdsController = void 0;
const admin_service_1 = __importDefault(require("../admin.service"));
const listAdminAdsController = async (req, res) => {
    try {
        const service = new admin_service_1.default();
        const result = await service.listAds(req);
        return res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        return res
            .status(400)
            .json({
            success: false,
            message: error?.message || "Failed to list ads",
        });
    }
};
exports.listAdminAdsController = listAdminAdsController;
