"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordController = void 0;
const user_schema_1 = __importDefault(require("../../../Schema/User/user.schema"));
const resetPasswordTicket_schema_1 = __importDefault(require("../../../Schema/ResetPasswordTicket/resetPasswordTicket.schema"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.resetPasswordController = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const { email, phoneNumber, newPassword } = req.body;
        if (!email && !phoneNumber) {
            res.status(400).json({ message: "Email or phone number is required" });
            return;
        }
        if (!newPassword) {
            res.status(400).json({ message: "New password is required" });
            return;
        }
        const query = {};
        if (email)
            query.email = email;
        if (phoneNumber)
            query.phoneNumber = phoneNumber;
        const user = await user_schema_1.default.findOne(query);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const existingTicket = await resetPasswordTicket_schema_1.default.findOne({
            userId: user._id,
            isUsed: false,
            expiresAt: { $gt: new Date() },
        });
        if (!existingTicket) {
            res.status(404).json({ message: "No reset password ticket found" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        existingTicket.isUsed = true;
        await existingTicket.save();
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
