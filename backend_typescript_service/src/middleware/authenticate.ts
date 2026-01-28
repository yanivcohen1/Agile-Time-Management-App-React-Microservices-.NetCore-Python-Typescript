import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env, UserRole } from '../config/env';
import { HttpError } from '../errors/httpError';

interface TokenPayload extends jwt.JwtPayload {
  sub?: string;
  role?: UserRole;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.get('authorization');

  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    next(new HttpError(401, 'Authorization header missing or malformed.'));
    return;
  }

  const token = header.slice(7).trim();

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;

    if (!decoded.sub || !decoded.role) {
      throw new HttpError(401, 'Token payload missing required fields.');
    }

    req.user = { username: decoded.sub, role: decoded.role };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new HttpError(401, 'Invalid or expired token.'));
      return;
    }
    next(error);
  }
}

export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new HttpError(401, 'Authentication required.'));
      return;
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      next(new HttpError(403, `Access restricted to ${role} role.`));
      return;
    }

    next();
  };
}
