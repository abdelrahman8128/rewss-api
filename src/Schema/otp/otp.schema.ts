import { Schema, model } from 'mongoose';
import { IPhoneOtp } from '../../interface/otp/otp'; // لو في ملف منفصل

const phoneOtpSchema = new Schema<IPhoneOtp>({
  phoneNumber: { type: String, required: true },
  otpCode: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 0 },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
});

export default model<IPhoneOtp>('PhoneOtp', phoneOtpSchema);
