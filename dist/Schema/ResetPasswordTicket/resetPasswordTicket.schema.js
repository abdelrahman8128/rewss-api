"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const resetPasswordTicketSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
});
resetPasswordTicketSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};
exports.default = (0, mongoose_1.model)("ResetPasswordTicket", resetPasswordTicketSchema);
