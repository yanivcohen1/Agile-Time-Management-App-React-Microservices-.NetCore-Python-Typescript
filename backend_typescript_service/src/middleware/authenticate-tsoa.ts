import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { env, UserRole } from '../config/env';

interface TokenPayload extends jwt.JwtPayload {
  sub?: string;
  role?: UserRole;
}

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<unknown> {
  if (securityName === 'jwt') {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
      
      if (scopes && scopes.length > 0) {
        if (!decoded.role || !scopes.includes(decoded.role)) {
           throw new Error('Insufficient scope');
        }
      }

      return {
        username: decoded.sub,
        role: decoded.role
      };
    } catch (err) {
      throw new Error('Invalid token');
    }
  }
}
