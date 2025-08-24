"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StockSchema = new mongoose_1.Schema({
    adId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Ad",
        required: [true, "Ad reference is required"],
        unique: true,
        index: true,
    },
    available: {
        type: Number,
        required: [true, "Available quantity is required"],
        min: [0, "Available quantity cannot be negative"],
        default: 0,
    },
    reserved: {
        type: Number,
        required: [true, "Reserved quantity is required"],
        min: [0, "Reserved quantity cannot be negative"],
        default: 0,
    },
    bought: {
        type: Number,
        required: [true, "Bought quantity is required"],
        min: [0, "Bought quantity cannot be negative"],
        default: 0,
    },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)("Stock", StockSchema);
