import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/httpError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    console.log(`HttpError: ${err.statusCode} - ${err.message}`);
    res.status(err.statusCode).json({
      detail: err.message,
      ...(err.details ? { details: err.details } : {})
    });
    return;
  }

  console.error('Unexpected error:', err);
  res.status(500).json({ detail: 'Internal server error' });
}
