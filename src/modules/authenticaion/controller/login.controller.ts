import users from "../../../Schema/User/user.schema";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber, password } = req.body;

    let User;

    if (email) {
      User = await users.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });
    } else if (phoneNumber) {
      User = await users.findOne({ phoneNumber });
    } else {
      return res
        .status(400)
        .json({ message: "Email or phone number is required" });
    }

    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, User.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "invalid data" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: User._id, username: User.username },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: process.env.JWT_EXPIRATION || "1h",
      } as SignOptions
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: User._id,
        email: User.email,
        name: User.name,
        phoneNumber: User.phoneNumber,
        username: User.username,
        role: User.role,
        status: User.status,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error });
  }
};
