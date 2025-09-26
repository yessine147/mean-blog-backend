import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function authMiddleware(req: any, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';  
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = { sub: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
  }
}
