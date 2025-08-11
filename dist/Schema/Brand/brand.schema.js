"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BrandSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Brand name is required'],
        unique: true,
        trim: true,
        index: true,
    },
    country: {
        type: String,
        required: [true, 'Country of origin is required'],
        trim: true,
        index: true,
    },
    logo: {
        type: String,
        required: [true, 'Logo URL is required'],
    },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('Brand', BrandSchema);
