import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { RequestContext } from '@mikro-orm/core';
import { orm } from './config/database';
import authRouter from './routes/auth';
import todosRouter from './routes/todos';
import { authenticate, requireRole } from './middleware/authenticate';
import { errorHandler } from './middleware/errorHandler';
import { HttpError } from './errors/httpError';
import { env } from './config/env';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.corsAllowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((_req, _res, next) => RequestContext.create(orm.em, next));

app.use('/auth', authRouter);
app.use('/todos', todosRouter);


app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/user/profile', authenticate, (req: Request, res: Response) => {
  if (req.user?.role !== 'user') {
    throw new HttpError(403, 'Access restricted to user role.');
  }

  res.json({
    message: 'User profile data',
    user: {
      username: req.user?.username,
      role: req.user?.role
    }
  });
});

app.get('/admin/reports', authenticate, requireRole('admin'), (req: Request, res: Response) => {
  res.json({
    message: 'Admin dashboard data',
    user: {
      username: req.user?.username,
      role: req.user?.role
    }
  });
});

app.use(errorHandler);

export default app;
