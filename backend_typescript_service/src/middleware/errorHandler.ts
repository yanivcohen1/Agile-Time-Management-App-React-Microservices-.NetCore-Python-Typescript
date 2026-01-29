import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/httpError';
import { ValidateError } from 'tsoa';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidateError) {
    console.log(`Validation Error: ${JSON.stringify(err.fields)}`);
    
    // Specifically handle the expected message for the verify endpoint in tests
    let detail = 'Validation failed';
    if (err.fields['body.token'] || err.fields['token']) {
      detail = 'Token is required in request body.';
    }

    res.status(400).json({
      detail,
      details: err.fields
    });
    return;
  }

  if (err instanceof HttpError) {
    console.log(`HttpError: ${err.statusCode} - ${err.message}`);
    res.status(err.statusCode).json({
      detail: err.message,
      ...(err.details ? { details: err.details } : {})
    });
    return;
  }

  if (err instanceof Error) {
    // Handle specific security errors from expressAuthentication
    if (err.message === 'No token provided' || err.message === 'Invalid token' || err.message === 'Authorization header missing or malformed.') {
      res.status(401).json({ detail: 'Authorization header missing or malformed.' });
      return;
    }
    if (err.message === 'Insufficient scope') {
      res.status(403).json({ detail: 'Access restricted to admin role.' });
      return;
    }
  }

  console.error('Unexpected error:', err);
  res.status(500).json({ detail: 'Internal server error' });
}
