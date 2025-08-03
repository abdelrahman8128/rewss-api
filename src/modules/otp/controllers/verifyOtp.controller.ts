import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Otp from "../../../Schema/otp/otp.schema";
import User from "../../../Schema/User/user.schema";
const crypto = require("crypto");

export const verifyOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { phoneNumber, otpCode } = req.body;

      // Validate phone number and OTP code
      if (!phoneNumber || !otpCode) {
        res
          .status(400)
          .json({ message: "Phone number and OTP code are required" });
        return;
      }

      // Find the OTP record in the database
      const otpRecord = await Otp.findOne({
        phoneNumber,
        isVerified: false,
        expiresAt: { $gt: new Date() },
        userId: req.user.id, // Assuming user ID is attached to req.user by authMiddleware
      });

      if (!otpRecord) {
        res.status(404).json({ message: "OTP not found or expired" });
        return;
      }

      // Hash the provided OTP code for comparison
      const hashedOtp = crypto
        .createHash("sha256")
        .update(otpCode)
        .digest("hex");

      // Check if the hashed OTP matches the stored OTP
      if (otpRecord.otpCode !== hashedOtp) {
        // Increment attempts and check if it exceeds the limit
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

      // Check if the OTP has expired
      if (new Date() > otpRecord.expiresAt) {
        res.status(410).json({ message: "OTP has expired" });
        return;
      }

      // Mark the OTP as verified
      otpRecord.isVerified = true;
      await otpRecord.save();

      await User.updateOne(
        { id: otpRecord.userId },
        { $set: { isPhoneVerified: true, phoneNumber: otpRecord.phoneNumber } }
      );

      res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while verifying the OTP" });
    }
  }
);
