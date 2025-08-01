import { Request, Response } from "express";
//import { OtpService } from '../services/otp.service';
import Otp from "../../../Schema/otp/otp.schema"; // Assuming you have an OtpService to handle OTP logic
const crypto = require("crypto");

export const requestOtpController = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;

    // Validate email or phone number
    if (!email && !phoneNumber) {
      return res
        .status(409)
        .json({ message: "Email or phone number is required" });
    }

    if (email) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (phoneNumber) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    // Generate a random 6-digit OTP
    const plainOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before storing in the database
    // In a real implementation, you should use bcrypt or a similar library
    const hashedOtp = crypto
      .createHash("sha256")
      .update(plainOtpCode)
      .digest("hex");

      
    // Store the hashed OTP in the database
    await Otp.create({
      phoneNumber,
      otpCode: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
      isVerified: false,
      attempts: 0,
      plainOtp: plainOtpCode, // Store temporarily for sending to user, remove in production or use a better approach
    });

    // TODO: Send plainOtpCode to user via SMS or email

    return res.status(201).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request" });
  }
};
