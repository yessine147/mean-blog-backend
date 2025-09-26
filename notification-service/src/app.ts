import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import notificationRoutes from './modules/notifications/notification.routes';
import eventRoutes from './modules/events/event.routes';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { swaggerOptions: { persistAuthorization: true } }));

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));

  app.use('/api/notifications', notificationRoutes);
  app.use('/api/events', eventRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
