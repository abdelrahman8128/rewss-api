"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: false, unique: true, trim: true },
    phoneCode: { type: String, required: false, trim: true },
    isPhoneVerified: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["active", "inactive", "pending", "ban", "deleted", "blocked"],
        default: "pending",
    },
    role: { type: String, enum: ["user", "seller", "admin", "super"], default: "user" },
    createdAt: { type: Date, default: Date.now, index: true },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)("User", UserSchema);
