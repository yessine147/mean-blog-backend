import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { createRedisClient } from './config/redis';
import { SocketGateway } from './modules/gateway/socket.gateway';
import { connectToDatabase } from './config/db';

async function bootstrap() {
  await connectToDatabase(env.MONGO_URI);
  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: env.CORS_ORIGIN } });

  const redisSubscriber = createRedisClient();
  const redisPublisher = createRedisClient();
  const gateway = new SocketGateway(io, redisSubscriber, redisPublisher);
  await gateway.init();

  server.listen(env.PORT, () => {
    console.log(`notification-service listening on port ${env.PORT}`);
    console.log(`Swagger docs: http://localhost:${env.PORT}/docs`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error during bootstrap', err);
  process.exit(1);
});
