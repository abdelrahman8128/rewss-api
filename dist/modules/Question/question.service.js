"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionService = void 0;
const mongoose_1 = require("mongoose");
const question_schema_1 = __importDefault(require("../../Schema/Question/question.schema"));
const ad_schema_1 = __importDefault(require("../../Schema/Ad/ad.schema"));
class QuestionService {
    async listByAd(adId, page, limit) {
        const ad = await ad_schema_1.default.findById(adId);
        if (!ad)
            throw new Error("Ad not found");
        const filter = { adId: new mongoose_1.Types.ObjectId(String(adId)) };
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
        const [items, total] = await Promise.all([
            question_schema_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .lean(),
            question_schema_1.default.countDocuments(filter),
        ]);
        return { items: items, total };
    }
    async createQuestion(adId, content, currentUser) {
        const ad = await ad_schema_1.default.findById(adId);
        if (!ad)
            throw new Error("Ad not found");
        if (currentUser.role !== "user") {
            throw new Error("Only users can ask questions");
        }
        const created = await question_schema_1.default.create({
            adId: ad._id,
            questionerId: currentUser._id,
            content,
            status: "pending",
            questionEditHistory: [],
        });
        return created;
    }
    async editQuestion(questionId, content, currentUserId) {
        const question = await question_schema_1.default.findById(questionId);
        if (!question)
            throw new Error("Question not found");
        if (question.questionerId.toString() !== String(currentUserId)) {
            throw new Error("You can edit only your question");
        }
        if (question.status === "answered") {
            throw new Error("Cannot edit question after it has been answered");
        }
        question.questionEditHistory.push({
            content: question.content,
            editedAt: new Date(),
            editedBy: currentUserId,
        });
        question.content = content;
        await question.save();
        return question;
    }
    async deleteQuestion(questionId, currentUser) {
        const question = await question_schema_1.default.findById(questionId);
        if (!question)
            throw new Error("Question not found");
        if (currentUser.role === "admin") {
            await question.deleteOne();
            return { deleted: true };
        }
        if (currentUser.role === "user" &&
            question.questionerId.toString() === String(currentUser._id)) {
            if (question.status === "answered") {
                throw new Error("Cannot delete answered question");
            }
            await question.deleteOne();
            return { deleted: true };
        }
        throw new Error("Not authorized to delete this question");
    }
    async answerQuestion(questionId, content, currentUser) {
        const question = await question_schema_1.default.findById(questionId);
        if (!question)
            throw new Error("Question not found");
        const ad = await ad_schema_1.default.findById(question.adId);
        if (!ad)
            throw new Error("Ad not found");
        if (currentUser.role !== "seller" ||
            ad.userId.toString() !== String(currentUser._id)) {
            throw new Error("Only the seller of the ad can answer");
        }
        if (question.status === "answered") {
            throw new Error("Question already answered");
        }
        question.answer = {
            responderId: currentUser._id,
            content,
            createdAt: new Date(),
            editHistory: [],
        };
        question.status = "answered";
        await question.save();
        return question;
    }
    async editAnswer(questionId, content, currentUser) {
        const question = await question_schema_1.default.findById(questionId);
        if (!question)
            throw new Error("Question not found");
        if (!question.answer)
            throw new Error("No answer to edit");
        const ad = await ad_schema_1.default.findById(question.adId);
        if (!ad)
            throw new Error("Ad not found");
        const isSeller = currentUser.role === "seller" &&
            ad.userId.toString() === String(currentUser._id);
        const isAdmin = currentUser.role === "admin";
        if (!isSeller && !isAdmin) {
            throw new Error("Only seller or admin can edit the answer");
        }
        question.answer.editHistory.push({
            content: question.answer.content,
            editedAt: new Date(),
            editedBy: currentUser._id,
        });
        question.answer.content = content;
        question.answer.updatedAt = new Date();
        await question.save();
        return question;
    }
}
exports.QuestionService = QuestionService;
exports.default = QuestionService;
