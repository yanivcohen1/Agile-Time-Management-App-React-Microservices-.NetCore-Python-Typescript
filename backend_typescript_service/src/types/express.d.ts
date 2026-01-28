import { UserRole } from '../config/env';

declare global {
  namespace Express {
    interface AuthenticatedUser {
      username: string;
      role: UserRole;
    }

    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
