import { Notification, NotificationDocument } from './notification.model';
import { NotificationType } from './notification.types';

export class NotificationService {
  async list(userId: string, page: number, pageSize: number, isRead?: boolean) {
    const filter: any = { userId };
    if (typeof isRead === 'boolean') filter.isRead = isRead;
    const skip = (page - 1) * pageSize;
    
    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }) // Get unread count for the user
    ]);
    
    return { items, total, page, pageSize, unreadCount };
  }

  async markRead(userId: string, ids: string[]) {
    await Notification.updateMany({ _id: { $in: ids }, userId }, { $set: { isRead: true } });
  }

  async markAllRead(userId: string) {
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
  }

  async create(userId: string, actorId: string, type: NotificationType, params: { articleId?: string; commentId?: string; message: string; }): Promise<NotificationDocument> {
    return Notification.create({ userId, actorId, type, ...params });
  }

  async createNotification(userId: string, type: string, title: string, message: string, data?: any): Promise<NotificationDocument> {
    return Notification.create({ 
      userId, 
      type, 
      title, 
      message, 
      data, 
      isRead: false 
    });
  }
}
