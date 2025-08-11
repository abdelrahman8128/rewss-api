"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxonomyModel = void 0;
const mongoose_1 = require("mongoose");
const TaxonomySchema = new mongoose_1.Schema({
    entityType: { type: String, required: true, enum: ['brand', 'model', 'category', 'mall', 'part'], index: true },
    code: { type: String, required: true, unique: true },
    parentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Taxonomy' },
    isActive: { type: Boolean, default: true },
    meta: { type: mongoose_1.Schema.Types.Mixed }
}, { timestamps: true });
TaxonomySchema.index({ entityType: 1, code: 1 });
exports.TaxonomyModel = (0, mongoose_1.model)('Taxonomy', TaxonomySchema);
