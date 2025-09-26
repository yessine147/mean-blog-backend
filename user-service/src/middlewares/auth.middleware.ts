import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserRole } from '../modules/user/user.types';

export interface AuthenticatedRequest extends Request {
  user?: { sub: string; email: string; role: UserRole };
}

export function authMiddleware(requiredRoles?: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
      if (!token) return res.status(401).json({ message: 'Missing token' });
      const payload = verifyToken<{ sub: string; email: string; role: UserRole }>(token);
      if (requiredRoles && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}
