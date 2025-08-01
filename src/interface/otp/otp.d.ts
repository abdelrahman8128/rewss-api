import { Document } from 'mongoose';

export interface IPhoneOtp extends Document {
  phoneNumber: string;
  otpCode: string;
  expiresAt: Date;
  isVerified: boolean;
  createdAt: Date;
  attempts: number;
  userId?: string; // لو هتربطها بالـ User
}
