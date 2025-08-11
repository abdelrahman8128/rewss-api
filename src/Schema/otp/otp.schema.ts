import { Schema, model } from 'mongoose';


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
  purpose: 'registration' | 'login' | 'password_reset' | 'verifying';

}


const OtpSchema = new Schema<IOtp>({
  
  phoneNumber: { type: String, required: false, index: true },
  email: { type: String, required: false, index: true },
  otpType: { type: String, required: true, enum: ['phone', 'email'], index: true },
  otpCode: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 0 },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  purpose: { type: String, required: true, enum: ['registration', 'login', 'verifying', 'password_reset'] },

});


export default model<IOtp>('Otp', OtpSchema);
