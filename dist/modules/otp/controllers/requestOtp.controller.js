"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOtpController = void 0;
const otp_schema_1 = __importDefault(require("../../../Schema/otp/otp.schema"));
const crypto = require("crypto");
const requestOtpController = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        if (!email && !phoneNumber) {
            return res
                .status(409)
                .json({ message: "Email or phone number is required" });
        }
        const plainOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Generated OTP:", plainOtpCode);
        const hashedOtp = crypto
            .createHash("sha256")
            .update(plainOtpCode)
            .digest("hex");
        await otp_schema_1.default.create({
            phoneNumber,
            otpCode: hashedOtp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            isVerified: false,
            attempts: 0,
            plainOtp: plainOtpCode,
        });
        return res.status(201).json({ message: "OTP sent successfully" });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "An error occurred while processing your request" });
    }
};
exports.requestOtpController = requestOtpController;
