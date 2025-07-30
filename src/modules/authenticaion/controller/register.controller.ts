import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import users from "../../../Schema/User/user.schema";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber, password, name } = req.body;

    
   
    var existingUser;

    existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "this email already exists",});
    }

    existingUser = await users.findOne({ phoneNumber: phoneNumber });

    if (existingUser) {
      return res.status(409).json({ message: "this phone number already exists" ,});
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    // Check if username already exists and generate a unique one
    const now = new Date();
    let timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;
    let username = `${name.toLowerCase().replace(/\s+/g, '')}${timestamp}`;
    let usernameExists = await users.findOne({ username });
        
    // If username exists, add random number as fallback
    while (usernameExists) {
      timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}${Math.floor(Math.random() * 100)}`;
      username = `${name.toLowerCase().replace(/\s+/g, '')}${timestamp}`;
      usernameExists = await users.findOne({ username });
    }

    const newUser = await users.create({
      phoneNumber: phoneNumber,
      username,
      email,
      name,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({
      message: "User created successfully",
      user: { id: newUser._id, email: newUser.email, name: newUser.name },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
  return;
};
