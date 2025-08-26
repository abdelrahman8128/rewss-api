"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ActivityLogSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"],
        index: true,
    },
    action: {
        type: String,
        required: [true, "Action is required"],
        trim: true,
        maxlength: [200, "Action cannot exceed 200 characters"],
        index: true,
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 characters"],
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
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
exports.default = (0, mongoose_1.model)("ActivityLog", ActivityLogSchema);
