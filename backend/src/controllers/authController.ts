import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { isValidEmail, isValidPassword } from '../utils/validation.js';

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Required fields check
    if (!name || !email || !password || !confirmPassword) {
      return sendError(res, 400, 'All fields are required: name, email, password, confirmPassword');
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();

    if (trimmedName.length < 2) {
      return sendError(res, 422, 'Validation failed: Name must be at least 2 characters long');
    }

    // 2. Email format validation
    if (!isValidEmail(trimmedEmail)) {
      return sendError(res, 422, 'Validation failed: Invalid email format');
    }

    // 3. Password minimum length validation
    if (!isValidPassword(password)) {
      return sendError(res, 422, 'Validation failed: Password must be at least 6 characters long');
    }

    // 4. Password confirmation validation
    if (password !== confirmPassword) {
      return sendError(res, 422, 'Validation failed: Passwords do not match');
    }

    // 5. Duplicate email check
    const existingUser = await query('SELECT id FROM users WHERE LOWER(email) = $1', [trimmedEmail]);
    if (existingUser.rowCount && existingUser.rowCount > 0) {
      return sendError(res, 409, 'Conflict: An account with this email already exists');
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Insert user
    const insertResult = await query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at)
       VALUES ($1, $2, $3, 'CUSTOMER', NOW(), NOW())
       RETURNING id, name, email, role, created_at AS "createdAt"`,
      [trimmedName, trimmedEmail, hashedPassword]
    );

    const user = insertResult.rows[0];

    // 8. Create user's initial cart
    await query(
      `INSERT INTO carts (user_id, created_at, updated_at)
       VALUES ($1, NOW(), NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id]
    );

    // 9. Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(res, 201, 'User registered successfully', {
      user,
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return sendError(res, 500, 'An unexpected error occurred during registration', error.message);
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // 1. Required fields check
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // 2. Email format validation
    if (!isValidEmail(trimmedEmail)) {
      return sendError(res, 400, 'Invalid email format');
    }

    // 3. Find user
    const userResult = await query(
      `SELECT id, name, email, password, role, created_at AS "createdAt"
       FROM users
       WHERE LOWER(email) = $1`,
      [trimmedEmail]
    );

    if (userResult.rowCount === 0) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const user = userResult.rows[0];

    // 4. Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // 5. Ensure cart exists
    await query(
      `INSERT INTO carts (user_id, created_at, updated_at)
       VALUES ($1, NOW(), NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id]
    );

    // 6. Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Strip password from response
    const { password: _, ...safeUser } = user;

    return sendSuccess(res, 200, 'Login successful', {
      user: safeUser,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return sendError(res, 500, 'An unexpected error occurred during login', error.message);
  }
};

export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const userResult = await query(
      `SELECT id, name, email, role, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM users
       WHERE id = $1`,
      [req.user.userId]
    );

    if (userResult.rowCount === 0) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'User profile retrieved successfully', {
      user: userResult.rows[0],
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return sendError(res, 500, 'Failed to retrieve user profile', error.message);
  }
};

