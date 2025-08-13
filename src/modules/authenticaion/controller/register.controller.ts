import { Message } from './../../../../node_modules/@smithy/eventstream-codec/dist-types/Message.d';
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

import users from "../../../Schema/User/user.schema";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber, password, name } = req.body;

    // Validate required fields
    if (!email && !phoneNumber) {
      return res
        .status(400)
        .json({ message: "Email or phone number is required" });
    }

    console.log(
      "Registering user with email:",
      email,
      "and phone number:",
      phoneNumber
    );

    var existingUser;


    if (email ) {
      existingUser = await users.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "this email already exists" });
      }
    }

    if (phoneNumber ) {
      existingUser = await users.findOne({ phoneNumber });
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "this phone number already exists" });
      }
    }

    console.log("No existing user found, proceeding with registration");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    // Check if username already exists and generate a unique one
    const now = new Date();
    let timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;
    let username = `${name.toLowerCase().replace(/\s+/g, "")}${timestamp}`;
    let usernameExists = await users.findOne({ username });

    // If username exists, add random number as fallback
    while (usernameExists) {
      timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}${Math.floor(
        Math.random() * 100
      )}`;
      username = `${name.toLowerCase().replace(/\s+/g, "")}${timestamp}`;
      usernameExists = await users.findOne({ username });
    }

    const newUser = await users.create({
      phoneNumber: phoneNumber || '',
      username,
      email,
      name,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: process.env.JWT_EXPIRATION || "1h",
      } as SignOptions
    );

    res.status(201).json({
      message: "User created successfully",
      user: { id: newUser._id, email: newUser.email, name: newUser.name },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
  return;
};
