"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerDataValidationMiddleware = void 0;
const seller_schema_1 = __importDefault(require("../../Schema/User/seller.schema"));
const sellerDataValidationMiddleware = async (req, res, next) => {
    try {
        if (req.user?.role !== "seller") {
            return next();
        }
        const sellerId = req.user._id;
        const seller = await seller_schema_1.default.findById(sellerId);
        if (!seller) {
            return next();
        }
        const hasLogo = seller.logo && seller.logo.imageId;
        const hasEnoughStorePhotos = seller.storePhotos && seller.storePhotos.length >= 2;
        let newStatus;
        if (!hasLogo || !hasEnoughStorePhotos) {
            newStatus = "uncompleted";
        }
        else {
            newStatus = "pending";
        }
        if (seller.requiredDataStatus !== newStatus) {
            await seller_schema_1.default.findByIdAndUpdate(sellerId, {
                requiredDataStatus: newStatus,
            });
            console.log(`Seller ${sellerId} data status updated to: ${newStatus}`);
        }
        next();
    }
    catch (error) {
        console.error("Error in seller data validation middleware:", error);
        next();
    }
};
exports.sellerDataValidationMiddleware = sellerDataValidationMiddleware;
