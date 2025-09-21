import { Schema, model, Document, Types } from "mongoose";

export interface IQuestionEditHistory {
  content: string;
  editedAt: Date;
  editedBy: Types.ObjectId; // userId
}

export interface IAnswerEditHistory {
  content: string;
  editedAt: Date;
  editedBy: Types.ObjectId; // sellerId or adminId
}

export interface IQuestion extends Document {
  adId: Types.ObjectId;
  questionerId: Types.ObjectId; // user who asked the question
  content: string;
  status: "pending" | "answered";
  // Answer subdocument
  answer?: {
    responderId: Types.ObjectId; // seller (or admin editing, but responder remains seller)
    content: string;
    createdAt: Date;
    updatedAt?: Date;
    editHistory: IAnswerEditHistory[];
  };
  createdAt: Date;
  updatedAt: Date;
  questionEditHistory: IQuestionEditHistory[];
}

const QuestionEditHistorySchema = new Schema<IQuestionEditHistory>(
  {
    content: { type: String, required: true },
    editedAt: { type: Date, default: Date.now },
    editedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false }
);

const AnswerEditHistorySchema = new Schema<IAnswerEditHistory>(
  {
    content: { type: String, required: true },
    editedAt: { type: Date, default: Date.now },
    editedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false }
);

const AnswerSchema = new Schema(
  {
    responderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    editHistory: { type: [AnswerEditHistorySchema], default: [] },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    adId: {
      type: Schema.Types.ObjectId,
      ref: "Ad",
      required: true,
      index: true,
    },
    questionerId: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

export default model<IQuestion>("Question", QuestionSchema);
