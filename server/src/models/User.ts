import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  openid: string;
  unionid?: string;
  phone?: string;
  nickname: string;
  avatar?: string;
  school?: string;
  department?: string;
  bio?: string;
  verified: boolean;
  rating: number;
  ratingCount: number;
  soldCount: number;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  openid: { type: String, required: true, unique: true, index: true },
  unionid: { type: String },
  phone: { type: String },
  nickname: { type: String, required: true },
  avatar: { type: String },
  school: { type: String },
  department: { type: String },
  bio: { type: String },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 5 },
  ratingCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
