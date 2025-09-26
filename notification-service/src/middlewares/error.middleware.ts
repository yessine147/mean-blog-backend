import { NextFunction, Request, Response } from 'express';

export function notFoundMiddleware(_req: Request, res: Response) {
  res.status(404).json({ message: 'Not Found', code: 'NOT_FOUND' });
}

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error', code: 'INTERNAL_SERVER_ERROR' });
}
