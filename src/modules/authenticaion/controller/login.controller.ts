import users from "../../../Schema/User/user.schema";
import { Request, Response } from "express";
const bcrypt = require("bcrypt");

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber, password } = req.body;

    let User;

    if (email) {
      User = await users.findOne({ email });
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
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error });
  }
};
