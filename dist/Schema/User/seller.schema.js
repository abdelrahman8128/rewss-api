"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_schema_1 = __importDefault(require("./user.schema"));
const SellerSchema = new mongoose_1.Schema({
    physicalAddress: { type: String, required: false },
    logo: { type: String, required: false },
    storePhotos: {
        type: [String],
        required: false,
    },
});
exports.default = user_schema_1.default.discriminator("seller", SellerSchema);
