import { Request, Response, NextFunction } from 'express';

/**
 * Ensures authenticated user has one of the allowed roles
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Action requires one of the following roles: ${allowedRoles.join(', ')}. Current role is '${req.user.role}'.`
      });
      return;
    }

    next();
  };
}

/**
 * Shorthand for admin-only endpoints
 */
export const requireAdmin = requireRole('admin');
