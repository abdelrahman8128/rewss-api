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
    availableQuantity: {
        type: Number,
        required: [true, "Available quantity is required"],
        min: [0, "Available quantity cannot be negative"],
        default: 0,
    },
    reservedQuantity: {
        type: Number,
        required: [true, "Reserved quantity is required"],
        min: [0, "Reserved quantity cannot be negative"],
        default: 0,
    },
    soldQuantity: {
        type: Number,
        required: [true, "Sold quantity is required"],
        min: [0, "Sold quantity cannot be negative"],
        default: 0,
    },
    minimumOrderQuantity: {
        type: Number,
        required: [true, "Minimum order quantity is required"],
        min: [0, "Minimum order quantity cannot be negative"],
        default: 1,
    },
    status: {
        type: String,
        enum: ['available', 'out_of_stock', 'low_stock'],
        default: 'available',
        required: [true, "Stock status is required"],
    },
}, {
    timestamps: true,
});
StockSchema.pre('save', function (next) {
    if (this.availableQuantity === 0) {
        this.status = 'out_of_stock';
    }
    else if (this.availableQuantity <= 3) {
        this.status = 'low_stock';
    }
    else {
        this.status = 'available';
    }
    next();
});
exports.default = (0, mongoose_1.model)("Stock", StockSchema);
