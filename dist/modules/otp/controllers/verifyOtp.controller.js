"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const otp_schema_1 = __importDefault(require("../../../Schema/otp/otp.schema"));
const user_schema_1 = __importDefault(require("../../../Schema/User/user.schema"));
const crypto = require("crypto");
exports.verifyOtpController = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { phoneNumber, otpCode } = req.body;
        if (!phoneNumber || !otpCode) {
            res
                .status(400)
                .json({ message: "Phone number and OTP code are required" });
            return;
        }
        const otpRecord = await otp_schema_1.default.findOne({
            phoneNumber,
            isVerified: false,
            expiresAt: { $gt: new Date() },
            userId: req.user.id,
        });
        if (!otpRecord) {
            res.status(404).json({ message: "OTP not found or expired" });
            return;
        }
        const hashedOtp = crypto
            .createHash("sha256")
            .update(otpCode)
            .digest("hex");
        if (otpRecord.otpCode !== hashedOtp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            if (otpRecord.attempts >= 3) {
                res
                    .status(429)
                    .json({ message: "Too many attempts, please try again later" });
                return;
            }
            res.status(400).json({ message: "Invalid OTP code" });
            return;
        }
        if (new Date() > otpRecord.expiresAt) {
            res.status(410).json({ message: "OTP has expired" });
            return;
        }
        otpRecord.isVerified = true;
        await otpRecord.save();
        await user_schema_1.default.updateOne({ id: otpRecord.userId }, { $set: { isPhoneVerified: true, phoneNumber: otpRecord.phoneNumber } });
        res.status(200).json({ message: "OTP verified successfully" });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "An error occurred while verifying the OTP" });
    }
});
