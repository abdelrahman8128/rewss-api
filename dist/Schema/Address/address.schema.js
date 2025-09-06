"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AddressSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    gov: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    region: {
        type: String,
        required: true,
        trim: true,
    },
    street: {
        type: String,
        required: true,
        trim: true,
    },
    building: {
        type: String,
        required: true,
        trim: true,
    },
    apartment: {
        type: String,
        required: true,
        trim: true,
    },
    coordinates: {
        latitude: {
            type: Number,
            required: false,
            min: -90,
            max: 90,
        },
        longitude: {
            type: Number,
            required: false,
            min: -180,
            max: 180,
        },
    },
    moreInfo: {
        type: String,
        required: false,
        trim: true,
        maxlength: 500,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
AddressSchema.index({ user: 1, country: 1, city: 1 });
AddressSchema.index({ coordinates: "2dsphere" });
AddressSchema.index({ user: 1, isDefault: 1 }, {
    unique: true,
    partialFilterExpression: { isDefault: true },
});
exports.default = (0, mongoose_1.model)("Address", AddressSchema);
