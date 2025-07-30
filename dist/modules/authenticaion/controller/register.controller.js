"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_schema_1 = __importDefault(require("../../../Schema/User/user.schema"));
const registerController = async (req, res) => {
    try {
        const { email, phoneNumber, password, name } = req.body;
        var existingUser;
        existingUser = await user_schema_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "this email already exists", });
        }
        existingUser = await user_schema_1.default.findOne({ phoneNumber: phoneNumber });
        if (existingUser) {
            return res.status(409).json({ message: "this phone number already exists", });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const now = new Date();
        let timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;
        let username = `${name.toLowerCase().replace(/\s+/g, '')}${timestamp}`;
        let usernameExists = await user_schema_1.default.findOne({ username });
        while (usernameExists) {
            timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}${Math.floor(Math.random() * 100)}`;
            username = `${name.toLowerCase().replace(/\s+/g, '')}${timestamp}`;
            usernameExists = await user_schema_1.default.findOne({ username });
        }
        const newUser = await user_schema_1.default.create({
            phoneNumber: phoneNumber,
            username,
            email,
            name,
            password: hashedPassword,
        });
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET || "secret", {
            expiresIn: "1h",
        });
        res.status(201).json({
            message: "User created successfully",
            user: { id: newUser._id, email: newUser.email, name: newUser.name },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
    return;
};
exports.registerController = registerController;
