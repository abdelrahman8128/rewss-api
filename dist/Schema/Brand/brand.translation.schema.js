"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BrandTranslationSchema = new mongoose_1.Schema({
    brandId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true,
        index: true,
    },
    lang: { type: String, index: true, required: true },
    displayName: { type: String, required: true },
}, {
    timestamps: true
});
BrandTranslationSchema.index({ brandId: 1, lang: 1 }, { unique: true });
BrandTranslationSchema.index({ lang: 1, displayName: 1 }, { unique: true });
BrandTranslationSchema.index({ lang: 1, slug: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)('BrandTranslation', BrandTranslationSchema);
