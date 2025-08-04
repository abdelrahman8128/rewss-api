import { Schema, model } from 'mongoose';
import { IOtp } from '../../interface/otp/otp'; // لو في ملف منفصل

const OtpSchema = new Schema<IOtp>({
  phoneNumber: { type: String, required: false },
  email: { type: String, required: false },
  otpType: { type: String, required: true, enum: ['phone', 'email'] },
  otpCode: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 0 },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
});


export default model<IOtp>('Otp', OtpSchema);
