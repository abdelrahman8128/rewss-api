"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingSchema = void 0;
const mongoose_1 = require("mongoose");
const RatingSchema = new mongoose_1.Schema({
    adId: { type: String, required: true },
    sellerId: { type: String, required: true },
    buyerId: { type: String, required: true },
    orderId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, {
    timestamps: true,
});
exports.RatingSchema = RatingSchema;
