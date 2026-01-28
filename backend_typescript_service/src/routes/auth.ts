import { Request, Response, NextFunction, Router } from 'express';
import jwt from 'jsonwebtoken';
import { RequestContext } from '@mikro-orm/core';
import { env, UserRole } from '../config/env';
import { HttpError } from '../errors/httpError';
import { User } from '../models/User';
import { comparePassword } from '../lib/password';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate';
import { orm } from '../config/database';

const upload = multer();
interface LoginRequestBody {
  username?: unknown;
  password?: unknown;
}

interface VerifyRequestBody {
  token?: unknown;
}

const authRouter = Router();

function parseCredentials(body: LoginRequestBody): { username: string; password: string } {
  const { username, password } = body;

  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Both username and password must be provided as strings.');
  }

  return { username, password };
}

async function authorizeUser(username: string, password: string): Promise<User> {
  const em = orm.em.fork();
  const user = await em.findOne(User, { username });

  if (!user || !(await comparePassword(password, user.password))) {
    throw new HttpError(401, 'Invalid credentials.');
  }

  return user;
}

authRouter.post('/login', upload.none(), async (req: Request<unknown, unknown, LoginRequestBody>, res: Response, next: NextFunction) => {
  try {
    const { username, password } = parseCredentials(req.body);
    const user = await authorizeUser(username, password);

    const access_token = jwt.sign({ sub: user.username, role: user.role }, env.jwtSecret, { expiresIn: env.jwtTtl });

    res.status(200).json({ 
      access_token, 
      token_type: 'Bearer', 
      expires_in: env.jwtTtl, 
      role: user.role, 
      name: user.fullName || user.username 
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager()!;
    const user = await em.findOne(User, { username: req.user!.username });
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    res.json({
      email: user.username,
      full_name: user.fullName || user.username,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/verify', (req: Request<unknown, unknown, VerifyRequestBody>, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    if (typeof token !== 'string') {
      throw new HttpError(400, 'Token is required in request body.');
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    res.status(200).json({ valid: true, payload: decoded });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new HttpError(401, 'Invalid or expired token.'));
      return;
    }
    next(error);
  }
});

export default authRouter;
