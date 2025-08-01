"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = void 0;
const user_schema_1 = __importDefault(require("../../../Schema/User/user.schema"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const loginController = async (req, res) => {
    try {
        const { email, phoneNumber, password } = req.body;
        let User;
        if (email) {
            User = await user_schema_1.default.findOne({
                email: { $regex: new RegExp(`^${email}$`, "i") },
            });
        }
        else if (phoneNumber) {
            User = await user_schema_1.default.findOne({ phoneNumber });
        }
        else {
            return res
                .status(400)
                .json({ message: "Email or phone number is required" });
        }
        if (!User) {
            return res.status(404).json({ message: "User not found" });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, User.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "invalid data" });
        }
        const token = jsonwebtoken_1.default.sign({ id: User._id, username: User.username, }, process.env.JWT_SECRET || "secret", {
            expiresIn: process.env.JWT_EXPIRATION || "1h",
        });
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error });
    }
};
exports.loginController = loginController;
