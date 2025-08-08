"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpController = void 0;
const express_async_handler_1 = __importDefault(
  require("express-async-handler")
);
const otp_schema_1 = __importDefault(require("../../../Schema/otp/otp.schema"));
const user_schema_1 = __importDefault(
  require("../../../Schema/User/user.schema")
);
const crypto = require("crypto");
const resetPasswordTicket_schema_1 = __importDefault(
  require("../../../Schema/ResetPasswordTicket/resetPasswordTicket.schema")
);
const authrization_middleware_1 = require("../../../Middleware/authrization/authrization.middleware");
exports.verifyOtpController = (0, express_async_handler_1.default)(
  async (req, res, next) => {
    try {
      const { phoneNumber, email, otpCode } = req.body;
      if ((!phoneNumber && !email) || !otpCode) {
        res
          .status(400)
          .json({ message: "Phone number or email and OTP code are required" });
        return;
      }
      const otpRecord = await otp_schema_1.default.findOne({
        phoneNumber: phoneNumber ? phoneNumber : "",
        email: email ? email : "",
        isVerified: false,
        expiresAt: { $gt: new Date() },
      });
      if (!otpRecord) {
        res.status(404).json({ message: "OTP not found or expired" });
        return;
      }
      console.log(otpRecord);
      if (otpRecord.purpose === "verifying") {
        (0, authrization_middleware_1.authMiddleware)(req, res, next);
        if (!req.user) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }
        if (otpRecord.userId.toString() !== req.user.id) {
          res.status(403).json({ message: "Forbidden" });
          return;
        }
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
      otpRecord.isVerified = true;
      await otpRecord.save();
      if (otpRecord.purpose === "verifying") {
        if (otpRecord.otpType === "phone") {
          await user_schema_1.default.updateOne(
            { _id: otpRecord.userId },
            {
              $set: {
                isPhoneVerified: true,
                phoneNumber: otpRecord.phoneNumber,
              },
            }
          );
        } else if (otpRecord.otpType === "email") {
          await user_schema_1.default.updateOne(
            { _id: otpRecord.userId },
            { $set: { isEmailVerified: true, email: otpRecord.email } }
          );
        }
      } else if (otpRecord.purpose === "password_reset") {
        await resetPasswordTicket_schema_1.default.create({
          userId: otpRecord.userId,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });
      }
      res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while verifying the OTP" });
    }
  }
);
