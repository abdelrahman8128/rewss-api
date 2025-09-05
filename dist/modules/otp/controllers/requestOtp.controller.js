"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOtpController = void 0;
const otp_schema_1 = __importDefault(require("../../../Schema/otp/otp.schema"));
const crypto = require("crypto");
const user_schema_1 = __importDefault(require("../../../Schema/User/user.schema"));
const authrization_middleware_1 = require("../../../Middleware/authrization/authrization.middleware");
const requestOtpController = async (req, res, next) => {
    try {
        const { email, phoneNumber, purpose } = req.body;
        if (!email && !phoneNumber) {
            return res
                .status(409)
                .json({ message: "Email or phone number is required" });
        }
        if (!purpose ||
            !["registration", "login", "password_reset", "verifying"].includes(purpose)) {
            return res.status(400).json({ message: "Invalid purpose specified" });
        }
        if (purpose === "password_reset") {
            const query = {};
            if (email)
                query.email = email;
            if (phoneNumber)
                query.phoneNumber = phoneNumber;
            const user = await user_schema_1.default.findOne(query);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            req.user = user;
        }
        else if (purpose === "verifying") {
            try {
                await (0, authrization_middleware_1.authMiddleware)(req, res, () => { });
                if (!req.user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const existingOtp = await otp_schema_1.default.findOne({
                    userId: req.user.id,
                    isVerified: false,
                    expiresAt: { $gt: new Date() },
                });
                if (existingOtp) {
                    return res
                        .status(409)
                        .json({ message: "OTP already exists for this user" });
                }
            }
            catch (err) {
                return res.json({ err });
            }
        }
        const plainOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Generated OTP:", plainOtpCode);
        const hashedOtp = crypto
            .createHash("sha256")
            .update("000000")
            .digest("hex");
        await otp_schema_1.default.create({
            phoneNumber: phoneNumber ? phoneNumber : "",
            email: email ? email : "",
            otpType: phoneNumber ? "phone" : "email",
            otpCode: hashedOtp,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            isVerified: false,
            attempts: 0,
            purpose: purpose,
            userId: req.user._id,
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
