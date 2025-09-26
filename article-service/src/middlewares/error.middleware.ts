import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/http-error';

export function notFoundMiddleware(_req: Request, res: Response) {
  res.status(404).json({ message: 'Not Found', code: 'NOT_FOUND' });
}

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const errors = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message, code: i.code }));
    return res.status(400).json({ message: 'Validation failed', code: 'VALIDATION_ERROR', errors });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, code: err.code });
  }
  
  const statusCode = err.statusCode || 500;
  let code = 'INTERNAL_SERVER_ERROR';
  
  if (statusCode === 400) code = 'BAD_REQUEST';
  else if (statusCode === 401) code = 'UNAUTHORIZED';
  else if (statusCode === 403) code = 'FORBIDDEN';
  else if (statusCode === 404) code = 'NOT_FOUND';
  else if (statusCode === 409) code = 'CONFLICT';
  
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(statusCode).json({ message: err.message || 'Internal Server Error', code });
}
