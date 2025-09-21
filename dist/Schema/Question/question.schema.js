"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const QuestionEditHistorySchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    editedAt: { type: Date, default: Date.now },
    editedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, { _id: false });
const AnswerEditHistorySchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    editedAt: { type: Date, default: Date.now },
    editedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, { _id: false });
const AnswerSchema = new mongoose_1.Schema({
    responderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    editHistory: { type: [AnswerEditHistorySchema], default: [] },
}, { _id: false });
const QuestionSchema = new mongoose_1.Schema({
    adId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Ad",
        required: true,
        index: true,
    },
    questionerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    content: { type: String, required: true, trim: true },
    status: {
        type: String,
        enum: ["pending", "answered"],
        default: "pending",
        index: true,
    },
    answer: { type: AnswerSchema, required: false },
    questionEditHistory: { type: [QuestionEditHistorySchema], default: [] },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Question", QuestionSchema);
