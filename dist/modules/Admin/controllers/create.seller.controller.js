"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSellerController = void 0;
const admin_service_1 = __importDefault(require("../admin.service"));
const createSellerController = async (req, res) => {
    try {
        const service = new admin_service_1.default();
        const { newSeller, plainPassword } = await service.createSeller(req);
        return res.status(201).json({
            success: true,
            message: "Seller account created successfully",
            seller: newSeller,
            password: plainPassword,
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, message: error?.message || "Internal error" });
    }
};
exports.createSellerController = createSellerController;
