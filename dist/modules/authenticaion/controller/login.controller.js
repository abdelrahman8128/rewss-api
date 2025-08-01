"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = void 0;
const user_schema_1 = __importDefault(require("../../../Schema/User/user.schema"));
const bcrypt = require("bcrypt");
const loginController = async (req, res) => {
    try {
        const { email, phoneNumber, password } = req.body;
        let User;
        if (email) {
            User = await user_schema_1.default.findOne({ email });
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
        const isPasswordValid = await bcrypt.compare(password, User.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        return res.status(200).json({ message: "Login successful" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error });
    }
};
exports.loginController = loginController;
