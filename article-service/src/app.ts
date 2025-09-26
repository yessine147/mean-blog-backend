import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import articleRoutes from './modules/article/article.routes'
import commentRoutes from './modules/comment/comment.routes'

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ 
    origin: env.CORS_ORIGIN, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-service-api-key']
  }));
  app.use(express.json());

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { swaggerOptions: { persistAuthorization: true } }));

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'article-service' }));

  app.use('/api/articles', articleRoutes);
  app.use('/api/comments', commentRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
