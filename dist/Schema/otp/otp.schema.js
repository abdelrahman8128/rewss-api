"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OtpSchema = new mongoose_1.Schema({
    phoneNumber: { type: String, required: false, index: true },
    email: { type: String, required: false, index: true },
    otpType: { type: String, required: true, enum: ['phone', 'email'], index: true },
    otpCode: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    attempts: { type: Number, default: 0 },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
    purpose: { type: String, required: true, enum: ['registration', 'login', 'password_reset', 'verifying'] },
});
exports.default = (0, mongoose_1.model)('Otp', OtpSchema);
