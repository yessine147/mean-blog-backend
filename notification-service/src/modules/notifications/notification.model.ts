import mongoose, { Schema, Document, Model } from 'mongoose';
import { NotificationType } from './notification.types';

export interface NotificationDocument extends Document {
  userId: string;
  actorId?: string;
  type: string;
  title?: string;
  articleId?: string;
  commentId?: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: String, index: true, required: true },
    actorId: { type: String },
    type: { type: String, required: true },
    title: { type: String },
    articleId: { type: String },
    commentId: { type: String },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification: Model<NotificationDocument> = mongoose.model<NotificationDocument>('Notification', notificationSchema);
