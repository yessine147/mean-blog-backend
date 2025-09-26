import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/http-error';

export function serviceAuthMiddleware(req: any, res: Response, next: NextFunction) {
  const serviceApiKey = req.headers['x-service-api-key'];

  if (!serviceApiKey) {
    return next(AppError.unauthorized('Service API key required'));
  }

  if (serviceApiKey !== env.SERVICE_API_KEY) {
    return next(AppError.unauthorized('Invalid service API key'));
  }

  next();
}
