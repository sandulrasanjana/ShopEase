import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  console.error('Unhandled Application Error:', err);

  // Body parser syntax error (Malformed JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    return sendError(res, 400, 'Malformed JSON payload in request body');
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return sendError(res, 409, 'Conflict: Record with this unique value already exists', {
      detail: err.detail,
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return sendError(res, 400, 'Invalid reference: Referenced entity does not exist', {
      detail: err.detail,
    });
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    return sendError(res, 422, 'Validation failed: Check constraint violated', {
      detail: err.detail,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
};

