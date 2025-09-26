import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/http-error';

export function notFoundMiddleware(_req: Request, res: Response) {
  res.status(404).json({ message: 'Not Found', code: 'NOT_FOUND' });
}

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  const isProd = process.env.NODE_ENV === 'production';

  if (err instanceof ZodError) {
    const errors = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message, code: i.code }));
    return res.status(400).json({ message: 'Validation failed', code: 'VALIDATION_ERROR', errors });
  }

  const appErr: AppError | null = err instanceof AppError ? err : null;
  const status = appErr?.statusCode || err.statusCode || 500;
  const code = appErr?.code || 'INTERNAL_SERVER_ERROR';
  const payload: any = {
    message: appErr?.message || err.message || 'Internal Server Error',
    code,
  };
  if (appErr?.details) payload.details = appErr.details;

  // eslint-disable-next-line no-console
  if (!isProd) console.error(err);

  res.status(status).json(payload);
}
