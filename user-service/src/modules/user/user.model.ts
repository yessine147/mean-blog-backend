import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from './user.types';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  userName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, index: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    userName: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.Reader, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const obj: any = ret;
    delete obj.passwordHash;
    return obj;
  },
});

export const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);
