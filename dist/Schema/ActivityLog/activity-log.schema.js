"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ActivityLogSchema = new mongoose_1.Schema({
    stockId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Stock",
        required: [true, "Stock reference is required"],
        index: true,
    },
    adId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Ad",
        required: [true, "Ad reference is required"],
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"],
        index: true,
    },
    action: {
        type: String,
        enum: ["created", "updated", "restocked", "reserved", "sold", "cancelled", "returned", "adjusted"],
        required: [true, "Action is required"],
        index: true,
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
    },
    changes: [
        {
            field: {
                type: String,
                required: true,
            },
            oldValue: {
                type: mongoose_1.Schema.Types.Mixed,
            },
            newValue: {
                type: mongoose_1.Schema.Types.Mixed,
            },
        },
    ],
    quantityChange: {
        type: Number,
    },
    previousQuantity: {
        type: Number,
        min: [0, "Previous quantity cannot be negative"],
    },
    newQuantity: {
        type: Number,
        min: [0, "New quantity cannot be negative"],
    },
    reason: {
        type: String,
        trim: true,
        maxlength: [200, "Reason cannot exceed 200 characters"],
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    ipAddress: {
        type: String,
        trim: true,
    },
    userAgent: {
        type: String,
        trim: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
ActivityLogSchema.index({ stockId: 1, createdAt: -1 });
ActivityLogSchema.index({ adId: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ stockId: 1, action: 1, createdAt: -1 });
exports.default = (0, mongoose_1.model)("ActivityLog", ActivityLogSchema);
