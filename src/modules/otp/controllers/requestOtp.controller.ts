import { Request, Response, NextFunction } from "express";
//import { OtpService } from '../services/otp.service';
import Otp from "../../../Schema/otp/otp.schema"; // Assuming you have an OtpService to handle OTP logic
const crypto = require("crypto");
import User from "../../../Schema/User/user.schema";
import { authMiddleware } from "../../../Middleware/authrization/authrization.middleware";

export const requestOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phoneNumber, purpose } = req.body;

    // Validate email or phone number
    if (!email && !phoneNumber) {
      return res
        .status(409)
        .json({ message: "Email or phone number is required" });
    }

    if (
      !purpose ||
      !["registration", "login", "password_reset", "verifying"].includes(
        purpose
      )
    ) {
      return res.status(400).json({ message: "Invalid purpose specified" });
    }

    if (purpose === "password_reset") {
      const query: { email?: string; phoneNumber?: string } = {};
      if (email) query.email = email;
      if (phoneNumber) query.phoneNumber = phoneNumber;

      // Find user with the query
      const user = await User.findOne(query);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      req.user = user; // Attach user to request for later use
    } else if (purpose === "verifying") {
      // Use a promise-based approach to handle the middleware
      try {
        await authMiddleware(req, res, () => {});

        // If middleware passes but no user is set, return error
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        // Check if the user already has an OTP record for verification
        const existingOtp = await Otp.findOne({
          userId: req.user.id,
          isVerified: false,
          expiresAt: { $gt: new Date() },
        });

        if (existingOtp) {
          return res
            .status(409)
            .json({ message: "OTP already exists for this user" });
        }
      } catch (err) {
        // The middleware already sent a response
        return res.json({ err });
      }
    }

    // Generate a random 6-digit OTP
    const plainOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before storing in the database

    console.log("Generated OTP:", plainOtpCode);
    const hashedOtp = crypto
      .createHash("sha256")
      .update("000000")
      .digest("hex");

    // Store the hashed OTP in the database
    await Otp.create({
      phoneNumber: phoneNumber ? phoneNumber : "",
      email: email ? email : "",
      otpType: phoneNumber ? "phone" : "email",
      otpCode: hashedOtp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // OTP valid for 15 minutes
      isVerified: false,
      attempts: 0,
      purpose: purpose,
      userId: req.user._id,
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
