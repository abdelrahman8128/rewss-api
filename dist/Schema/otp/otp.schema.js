"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const phoneOtpSchema = new mongoose_1.Schema({
    phoneNumber: { type: String, required: true },
    otpCode: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    attempts: { type: Number, default: 0 },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
});
exports.default = (0, mongoose_1.model)('PhoneOtp', phoneOtpSchema);
