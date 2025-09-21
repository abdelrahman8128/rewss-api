import { Types } from "mongoose";
import Question, { IQuestion } from "../../Schema/Question/question.schema";
import Ad from "../../Schema/Ad/ad.schema";

export class QuestionService {
  async listByAd(
    adId: string,
    page?: number,
    limit?: number
  ): Promise<{ items: IQuestion[]; total: number }> {

    const ad = await Ad.findById(adId);
    if (!ad) throw new Error("Ad not found");

    const filter: any = { adId: new Types.ObjectId(String(adId)) };
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

    const [items, total] = await Promise.all([
      Question.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Question.countDocuments(filter),
    ]);

    return { items: items as any, total };
  }

  async createQuestion(
    adId: string,
    content: string,
    currentUser: { _id: string; role: string }
  ): Promise<IQuestion> {
    const ad = await Ad.findById(adId);
    if (!ad) throw new Error("Ad not found");

    if (currentUser.role !== "user") {
      throw new Error("Only users can ask questions");
    }

    const created = await Question.create({
      adId: ad._id,
      questionerId: currentUser._id as any,
      content,
      status: "pending",
      questionEditHistory: [],
    });

    return created;
  }

  async editQuestion(
    questionId: string,
    content: string,
    currentUserId: string
  ): Promise<IQuestion> {
    const question = await Question.findById(questionId);
    if (!question) throw new Error("Question not found");

    if (question.questionerId.toString() !== String(currentUserId)) {
      throw new Error("You can edit only your question");
    }

    if (question.status === "answered") {
      throw new Error("Cannot edit question after it has been answered");
    }

    question.questionEditHistory.push({
      content: question.content,
      editedAt: new Date(),
      editedBy: currentUserId as any,
    } as any);

    question.content = content;
    await question.save();
    return question;
  }

  async deleteQuestion(
    questionId: string,
    currentUser: { _id: string; role: string }
  ): Promise<{ deleted: boolean }> {
    const question = await Question.findById(questionId);
    if (!question) throw new Error("Question not found");

    if (currentUser.role === "admin") {
      await question.deleteOne();
      return { deleted: true };
    }

    if (
      currentUser.role === "user" &&
      question.questionerId.toString() === String(currentUser._id)
    ) {
      if (question.status === "answered") {
        throw new Error("Cannot delete answered question");
      }
      await question.deleteOne();
      return { deleted: true };
    }

    throw new Error("Not authorized to delete this question");
  }

  async answerQuestion(
    questionId: string,
    content: string,
    currentUser: { _id: string; role: string }
  ): Promise<IQuestion> {
    const question = await Question.findById(questionId);
    if (!question) throw new Error("Question not found");

    const ad = await Ad.findById(question.adId);
    if (!ad) throw new Error("Ad not found");

    if (
      currentUser.role !== "seller" ||
      ad.userId.toString() !== String(currentUser._id)
    ) {
      throw new Error("Only the seller of the ad can answer");
    }

    if (question.status === "answered") {
      throw new Error("Question already answered");
    }

    question.answer = {
      responderId: currentUser._id as any,
      content,
      createdAt: new Date(),
      editHistory: [],
    } as any;
    question.status = "answered";
    await question.save();
    return question;
  }

  async editAnswer(
    questionId: string,
    content: string,
    currentUser: { _id: string; role: string }
  ): Promise<IQuestion> {
    const question = await Question.findById(questionId);
    if (!question) throw new Error("Question not found");
    if (!question.answer) throw new Error("No answer to edit");

    const ad = await Ad.findById(question.adId);
    if (!ad) throw new Error("Ad not found");

    const isSeller =
      currentUser.role === "seller" &&
      ad.userId.toString() === String(currentUser._id);
    const isAdmin = currentUser.role === "admin";

    if (!isSeller && !isAdmin) {
      throw new Error("Only seller or admin can edit the answer");
    }

    question.answer.editHistory.push({
      content: question.answer.content,
      editedAt: new Date(),
      editedBy: currentUser._id as any,
    } as any);
    question.answer.content = content;
    question.answer.updatedAt = new Date();
    await question.save();
    return question;
  }
}

export default QuestionService;
