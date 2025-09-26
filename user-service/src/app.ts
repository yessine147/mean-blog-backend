import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import userRoutes from './modules/user/user.routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { swaggerOptions: { persistAuthorization: true } }));

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'user-service' }));

  app.use('/api/auth', userRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
