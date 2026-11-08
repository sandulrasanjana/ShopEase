import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { query } from '../config/db.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return sendError(res, 401, 'Authentication failed: No authorization token provided');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return sendError(res, 401, 'Authentication failed: Malformed authorization header. Format must be "Bearer <token>"');
  }

  const token = parts[1];

  try {
    const payload = verifyToken(token);

    // Verify user still exists in DB
    const userResult = await query('SELECT id, email, role FROM users WHERE id = $1', [payload.userId]);
    if (userResult.rowCount === 0) {
      return sendError(res, 401, 'Authentication failed: User account no longer exists');
    }

    req.user = payload;
    return next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Authentication failed: Token has expired');
    }
    return sendError(res, 401, 'Authentication failed: Invalid token', err.message);
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  if (!req.user) {
    return sendError(res, 401, 'Authentication required');
  }

  if (req.user.role !== 'ADMIN') {
    return sendError(res, 403, 'Forbidden: Admin access required');
  }

  return next();
};

