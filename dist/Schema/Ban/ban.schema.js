"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BanSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    bannedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reason: {
        type: String,
        required: false,
        trim: true,
    },
    banStartDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    banEndDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, {
    timestamps: true,
});
BanSchema.index({ userId: 1, isActive: 1 });
BanSchema.index({ banEndDate: 1, isActive: 1 });
exports.default = (0, mongoose_1.model)("Ban", BanSchema);
