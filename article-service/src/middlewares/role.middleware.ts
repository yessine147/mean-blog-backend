import { NextFunction, Request, Response } from 'express';

export enum UserRole {
  Admin = 'Admin',
  Editor = 'Editor',
  Author = 'Author', 
  Reader = 'Reader'
}

export function requireRole(roles: UserRole | UserRole[]) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const userRole = req.user.role as UserRole;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`, 
        code: 'FORBIDDEN' 
      });
    }

    next();
  };
}

// Convenience guards
export const requireAdmin = requireRole(UserRole.Admin);
export const requireEditor = requireRole([UserRole.Admin, UserRole.Editor]);
export const requireAuthor = requireRole([UserRole.Admin, UserRole.Editor, UserRole.Author]);
export const requireReader = requireRole([UserRole.Admin, UserRole.Editor, UserRole.Author, UserRole.Reader]);
