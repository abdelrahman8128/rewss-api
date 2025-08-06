import { Schema, model, Document } from "mongoose";

// Interface for the reset password ticket document
export interface IResetPasswordTicket extends Document {
  userId: Schema.Types.ObjectId; // Reference to the User model
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
}

// Schema definition
const resetPasswordTicketSchema = new Schema<IResetPasswordTicket>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
});

// Methods
resetPasswordTicketSchema.methods.isExpired = function (): boolean {
  return new Date() > this.expiresAt;
};

// Create and export the model
export default model<IResetPasswordTicket>(
  "ResetPasswordTicket",
  resetPasswordTicketSchema
);
