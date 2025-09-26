import { Server } from 'socket.io';
import Redis from 'ioredis';

let ioRef: Server | null = null;
export function getIo(): Server {
  if (!ioRef) {
    throw new Error('Socket.IO not initialized');
  }
  return ioRef;
}

export class SocketGateway {
  private io: Server;
  private subscriber: Redis;
  private publisher: Redis;
  constructor(io: Server, subscriber: Redis, publisher: Redis) {
    this.io = io;
    ioRef = io;
    this.subscriber = subscriber;
    this.publisher = publisher;
  }

  async init() {
    await this.subscriber.subscribe('article:comments');
    this.subscriber.on('message', (channel, message) => {
      if (channel === 'article:comments') {
        const { articleId, comment } = JSON.parse(message);
        this.io.to(`article:${articleId}`).emit('new-comment', comment);
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('join-article', async (data: { articleId: string; userId?: string }) => {
        const { articleId, userId } = data;
        const roomName = `article:${articleId}`;
        
        socket.join(roomName);
        console.log(`Client ${socket.id} joined article room: ${articleId}`);
        // Store client info in Redis
        await this.publisher.hset(`article:${articleId}:clients`, socket.id, JSON.stringify({
          socketId: socket.id,
          userId: userId || null,
          joinedAt: new Date().toISOString()
        }));
        
        console.log(`Client ${socket.id} joined article room: ${articleId}`);
      });

      socket.on('leave-article', async (data: { articleId: string }) => {
        const { articleId } = data;
        const roomName = `article:${articleId}`;
        
        socket.leave(roomName);
        
        // Remove client info from Redis
        await this.publisher.hdel(`article:${articleId}:clients`, socket.id);
        
        console.log(`Client ${socket.id} left article room: ${articleId}`);
      });

      socket.on('join-user', async (userId: string) => {
        socket.join(`user:${userId}`);
        
        // Store user-socket mapping in Redis
        await this.publisher.set(`socket:${socket.id}:user`, userId);
        await this.publisher.set(`user:${userId}:socket`, socket.id);
        
        console.log(`Client ${socket.id} joined user room: ${userId}`);
      });

      socket.on('leave-user', async (userId: string) => {
        socket.leave(`user:${userId}`);
        
        // Remove user-socket mapping from Redis
        await this.publisher.del(`socket:${socket.id}:user`);
        await this.publisher.del(`user:${userId}:socket`);
        
        console.log(`Client ${socket.id} left user room: ${userId}`);
      });

      socket.on('disconnect', async () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        // Clean up user-socket mapping
        const userId = await this.publisher.get(`socket:${socket.id}:user`);
        if (userId) {
          await this.publisher.del(`user:${userId}:socket`);
          await this.publisher.del(`socket:${socket.id}:user`);
        }
        
        // Clean up article room entries
        const rooms = Array.from(socket.rooms);
        for (const room of rooms) {
          if (room.startsWith('article:')) {
            const articleId = room.replace('article:', '');
            await this.publisher.hdel(`article:${articleId}:clients`, socket.id);
          }
        }
      });
    });
  }
}
