"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AdSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        index: true,
    },
    title: {
        type: String,
        required: [true, "Ad title is required"],
        trim: true,
    },
    slug: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    models: [
        {
            model: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Model",
                required: [true, "Model is required"],
                index: true,
            },
        },
    ],
    condition: {
        type: String,
        required: [true, "Ad condition is required"],
        trim: true,
        index: true,
    },
    manufacturedCountry: {
        type: String,
        required: [true, "Manufactured country is required"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Ad description is required"],
        trim: true,
    },
    thumbnail: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "AdImage",
    },
    album: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "AdImage",
        },
    ],
    stock: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Stock",
        index: true,
    },
    stockStatus: {
        type: String,
        enum: ["available", "out_of_stock", "low_stock"],
        default: "available",
        index: true,
    },
    status: {
        type: String,
        enum: ["active", "pending", "deleted"],
        default: "pending",
        index: true,
    },
    price: {
        type: Number,
        required: [true, "Ad price is required"],
        min: [0, "Price cannot be negative"],
        index: true,
    }
}, {
    timestamps: true,
});
AdSchema.pre("save", async function (next) {
    if (this.isModified("title") ||
        this.isModified("status") ||
        this.isModified("condition") ||
        this.isModified("manufacturedCountry") ||
        this.isModified("models")) {
        const modelNames = await Promise.all(this.models.map(async (m) => {
            const modelDoc = await (0, mongoose_1.model)("Model").findById(m.model).exec();
            return modelDoc ? modelDoc.name : "";
        }));
        const slugParts = [
            this.title,
            this.status,
            this.condition,
            this.manufacturedCountry,
            ...modelNames,
        ];
        this.slug = slugParts
            .filter((part) => part)
            .map((part) => part.toLowerCase().replace(/\s+/g, "-"))
            .join("-");
    }
    next();
});
AdSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    if (Array.isArray(update)) {
        return next();
    }
    if (update?.title ||
        update?.status ||
        update?.condition ||
        update?.manufacturedCountry ||
        update?.models ||
        update?.$set?.title ||
        update?.$set?.status ||
        update?.$set?.condition ||
        update?.$set?.manufacturedCountry ||
        update?.$set?.models) {
        const title = update?.$set?.title ?? update?.title;
        const status = update?.$set?.status ?? update?.status;
        const condition = update?.$set?.condition ?? update?.condition;
        const manufacturedCountry = update?.$set?.manufacturedCountry ?? update?.manufacturedCountry;
        const modelsToUse = update?.$set?.models ?? update?.models;
        const modelNames = await Promise.all((modelsToUse || []).map(async (m) => {
            const modelDoc = await (0, mongoose_1.model)("Model").findById(m.model).exec();
            return modelDoc ? modelDoc.name : "";
        }));
        const slugParts = [
            title,
            status,
            condition,
            manufacturedCountry,
            ...modelNames,
        ];
        update.$set = update.$set || {};
        update.$set.slug = slugParts
            .filter((part) => part)
            .map((part) => String(part).toLowerCase().replace(/\s+/g, "-"))
            .join("-");
        this.setUpdate(update);
    }
    next();
});
exports.default = (0, mongoose_1.model)("Ad", AdSchema);
