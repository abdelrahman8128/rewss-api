"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_schema_1 = __importDefault(require("../../Schema/User/user.schema"));
class AdminService {
    async createSeller(req) {
        const { email, phoneNumber, password, name } = req.body || {};
        if (!email && !phoneNumber) {
            throw new Error("Email or phone number is required");
        }
        if (email) {
            const existsEmail = await user_schema_1.default.findOne({ email });
            if (existsEmail) {
                throw new Error("This email already exists");
            }
        }
        if (phoneNumber) {
            const existsPhone = await user_schema_1.default.findOne({ phoneNumber });
            if (existsPhone) {
                throw new Error("This phone number already exists");
            }
        }
        const plainPassword = password || this.generateRandomPassword(12);
        const hashedPassword = await bcryptjs_1.default.hash(plainPassword, 10);
        const now = new Date();
        let timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;
        const base = String(name || email || phoneNumber || "seller")
            .toLowerCase()
            .replace(/\s+/g, "");
        let username = `${base}${timestamp}`;
        let usernameExists = await user_schema_1.default.findOne({ username });
        while (usernameExists) {
            timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}${Math.floor(Math.random() * 100)}`;
            username = `${base}${timestamp}`;
            usernameExists = await user_schema_1.default.findOne({ username });
        }
        const newSeller = await user_schema_1.default.create({
            username,
            name: name || base,
            email,
            phoneNumber: phoneNumber || undefined,
            password: hashedPassword,
            role: "seller",
            status: "active",
            isEmailVerified: !!email,
            isPhoneVerified: !!phoneNumber,
        });
        return { newSeller, plainPassword };
    }
    generateRandomPassword(length = 12) {
        const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const lower = "abcdefghijkmnopqrstuvwxyz";
        const digits = "23456789";
        const symbols = "!@#$%^&*-_+=?";
        const all = upper + lower + digits + symbols;
        const picks = [
            upper[Math.floor(Math.random() * upper.length)],
            lower[Math.floor(Math.random() * lower.length)],
            digits[Math.floor(Math.random() * digits.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
        ];
        for (let i = picks.length; i < length; i++) {
            picks.push(all[Math.floor(Math.random() * all.length)]);
        }
        for (let i = picks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [picks[i], picks[j]] = [picks[j], picks[i]];
        }
        return picks.join("");
    }
}
exports.default = AdminService;
