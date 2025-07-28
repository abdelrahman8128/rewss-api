"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_schema_1 = __importDefault(require("../../../Schema/User/user.schema"));
const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await user_schema_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user in the database
        const newUser = await user_schema_1.default.create({ email, name, password: hashedPassword });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1h',
        });
        res.status(201).json({
            message: 'User created successfully',
            user: { id: newUser._id, email: newUser.email, name: newUser.name },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.signup = signup;
