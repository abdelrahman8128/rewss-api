"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeAdStatusController = void 0;
const admin_service_1 = __importDefault(require("../admin.service"));
const changeAdStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const service = new admin_service_1.default();
        const ad = await service.changeAdStatus(id, String(status));
        return res.status(200).json({ success: true, ad });
    }
    catch (error) {
        return res
            .status(400)
            .json({
            success: false,
            message: error?.message || "Failed to update status",
        });
    }
};
exports.changeAdStatusController = changeAdStatusController;
