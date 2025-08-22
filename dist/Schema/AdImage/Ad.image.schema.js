"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AdImageSchema = new mongoose_1.Schema({
    adId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Ad",
        required: [true, "Ad ID is required"],
        index: true,
    },
    imageId: {
        type: String,
        required: [true, "Image ID is required"],
        trim: true,
    },
    imageUrl: {
        type: String,
        required: [true, "Image URL is required"],
        trim: true,
    },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)("AdImage", AdImageSchema);
