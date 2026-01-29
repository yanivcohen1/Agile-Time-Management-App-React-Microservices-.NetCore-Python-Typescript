import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { RequestContext } from '@mikro-orm/core';
import { orm } from './config/database';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './public/swagger.json';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
import multer from 'multer';

const app = express();
const upload = multer();

app.use(helmet());
app.use(cors({
  origin: env.corsAllowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.none());
app.use((_req, _res, next) => RequestContext.create(orm.em, next));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

RegisterRoutes(app);

app.use(errorHandler);

export default app;
