import { Document } from 'mongoose';

export interface IOtp extends Document {
  phoneNumber: string;
  otpCode: string;
  expiresAt: Date;
  isVerified: boolean;
  createdAt: Date;
  attempts: number;
  userId?: string; 
  email?: string;
  otpType: 'phone' | 'email';
}
