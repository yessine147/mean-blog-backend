import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { ListNotificationsQuery, MarkReadDto } from './notification.dtos';
import { getIo } from '../gateway/socket.gateway';
import { env } from '../../config/env';
import { NotificationType } from './notification.types';
import Redis from 'ioredis';

const service = new NotificationService();
const redis = new Redis(env.REDIS_URL);

export async function listNotifications(req: any, res: Response, next: NextFunction) {
  try {
    const q = ListNotificationsQuery.parse(req.query);
    const isRead = q.isRead ? q.isRead === 'true' : undefined;
    const result = await service.list(req.user.sub, q.page, q.pageSize, isRead);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: any, res: Response, next: NextFunction) {
  try {
    const body = MarkReadDto.parse(req.body);
    await service.markRead(req.user.sub, body.ids);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: any, res: Response, next: NextFunction) {
  try {
    await service.markAllRead(req.user.sub);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function createNotificationEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.headers['x-service-key'];
    if (apiKey !== env.SERVICE_API_KEY) return res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });

    const { type, receiverUserId, actorId, message, articleId, commentId } = req.body || {} as { type: NotificationType; receiverUserId: string; actorId: string; message: string; articleId?: string; commentId?: string };
    if (!type || !receiverUserId || !actorId || !message) {
      return res.status(400).json({ message: 'Invalid payload', code: 'BAD_REQUEST' });
    }

    const notif = await service.create(receiverUserId, actorId, type, { articleId, commentId, message });
    const io = getIo();
    io.to(`user:${receiverUserId}`).emit('notification', {
      id: String(notif._id),
      type,
      message,
      actorId,
      articleId,
      commentId,
      isRead: false,
      createdAt: notif.createdAt,
    });
    if (articleId) {
      io.to(`article:${articleId}`).emit('notification', { id: String(notif._id), type, message, actorId, articleId, commentId });
    }

    res.status(201).json({ notificationId: notif.id });
  } catch (err) {
    next(err);
  }
}

export async function createNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.headers['x-service-api-key'];
    if (apiKey !== env.SERVICE_API_KEY) return res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });

    const { userId, type, title, message, data } = req.body;
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields', code: 'BAD_REQUEST' });
    }

    const notif = await service.createNotification(userId, type, title, message, data);
    const io = getIo();
    
    // Get user's socket ID from Redis
    const socketId = await redis.get(`user:${userId}:socket`);
    
    if (socketId) {
      // User is online, send real-time notification
      io.to(socketId).emit('new-notification', {
        _id: String(notif._id),
        userId: notif.userId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        data: notif.data,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
        updatedAt: notif.updatedAt
      });
      console.log(`Real-time notification sent to user ${userId} via socket ${socketId}`);
    } else {
      console.log(`User ${userId} is offline, notification stored in database`);
    }

    res.status(201).json({ notificationId: notif._id });
  } catch (err) {
    next(err);
  }
}
