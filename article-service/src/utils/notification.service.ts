import axios from 'axios';
import { env } from '../config/env';

export class NotificationServiceClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = env.NOTIFICATION_SERVICE_URL;
    this.apiKey = env.SERVICE_API_KEY;
  }

  async emitCommentEvent(articleId: string, comment: any): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/api/events`,
        {
          type: 'comment_created',
          articleId,
          data: comment
        },
        {
          headers: {
            'x-service-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Failed to emit comment event:', error);
    }
  }

  async createNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/api/notifications/service/create`,
        notification,
        {
          headers: {
            'x-service-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }
}
