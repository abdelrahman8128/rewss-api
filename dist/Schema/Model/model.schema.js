"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ModelSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Model name is required"],
        trim: true,
        index: true,
    },
    brand: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Brand",
        required: [true, "Brand ID is required"],
        index: true,
    },
}, {
    timestamps: true,
});
ModelSchema.index({ name: 1, brand: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("Model", ModelSchema);
