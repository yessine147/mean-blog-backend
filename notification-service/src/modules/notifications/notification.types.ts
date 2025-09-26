export type NotificationType = 'comment' | 'reply' | 'mention';

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  userId: string;
  actorId: string;
  articleId?: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
