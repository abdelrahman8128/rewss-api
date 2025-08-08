import { Request, Response, NextFunction } from "express";
import users from "../../../Schema/User/user.schema";
import resetPasswordTicket from "../../../Schema/ResetPasswordTicket/resetPasswordTicket.schema";
import bcrypt from "bcryptjs";

import asyncHandler from "express-async-handler";

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, phoneNumber, newPassword } = req.body;

      // Validate email or phone number
      if (!email && !phoneNumber) {
        res.status(400).json({ message: "Email or phone number is required" });
        return;
      }
      if (!newPassword) {
        res.status(400).json({ message: "New password is required" });
        return;
      }

      // Check if user exists
      // Create query object with only provided fields
      const query: { email?: string; phoneNumber?: string } = {};
      if (email) query.email = email;
      if (phoneNumber) query.phoneNumber = phoneNumber;

      // Find user with the query
      const user = await users.findOne(query);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Check if a reset password ticket already exists for this user
      const existingTicket = await resetPasswordTicket.findOne({
        userId: user._id,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      });

      if (!existingTicket) {
        res.status(404).json({ message: "No reset password ticket found" });
        return;
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await user.save();
      // Mark the reset password ticket as used
      existingTicket.isUsed = true;
      await existingTicket.save();

      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
