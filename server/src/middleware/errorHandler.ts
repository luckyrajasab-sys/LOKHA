import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Structured log
  console.error('[API Error]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode,
    errorCode: err.code,
    message: err.message,
    userId: req.user?.id,
    stack: isProduction ? undefined : err.stack,
  });

  // Handle unique constraint violations from Postgres
  if (err.code === '23505') {
    res.status(409).json({
      error: 'Conflict',
      message: 'A record with this identifier or unique combination already exists.'
    });
    return;
  }

  // Foreign key violations
  if (err.code === '23503') {
    res.status(400).json({
      error: 'Foreign Key Violation',
      message: 'Referenced entity does not exist.'
    });
    return;
  }

  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred.',
    ...(err.details ? { details: err.details } : {})
  });
}
