import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getProductReviews = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId) || productId <= 0) {
      return sendError(res, 400, 'Invalid product ID');
    }

    // Verify product exists
    const prodRes = await query('SELECT id FROM products WHERE id = $1', [productId]);
    if (prodRes.rowCount === 0) {
      return sendError(res, 404, 'Product not found');
    }

    const reviewsRes = await query(
      `SELECT r.id, r.product_id AS "productId", r.user_id AS "userId", r.rating, r.comment,
              r.created_at AS "createdAt", r.updated_at AS "updatedAt",
              u.name AS "userName"
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const reviews = reviewsRes.rows;
    const totalReviews = reviews.length;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;

    reviews.forEach((r) => {
      ratingSum += r.rating;
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    });

    const averageRating = totalReviews > 0 ? parseFloat((ratingSum / totalReviews).toFixed(1)) : 0;

    return sendSuccess(res, 200, 'Product reviews retrieved successfully', {
      reviews,
      averageRating,
      totalReviews,
      ratingDistribution: distribution,
    });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return sendError(res, 500, 'Failed to fetch reviews', error.message);
  }
};

export const createReview = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId) || productId <= 0) {
      return sendError(res, 400, 'Invalid product ID');
    }

    const { rating, comment } = req.body;

    // 1. Validate rating
    const ratingNum = parseInt(String(rating), 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return sendError(res, 422, 'Validation failed: Rating must be an integer between 1 and 5');
    }

    // 2. Validate comment
    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
      return sendError(res, 422, 'Validation failed: Review comment must be at least 3 characters long');
    }

    if (comment.trim().length > 1000) {
      return sendError(res, 422, 'Validation failed: Review comment cannot exceed 1000 characters');
    }

    // 3. Verify product exists
    const prodRes = await query('SELECT id, name FROM products WHERE id = $1', [productId]);
    if (prodRes.rowCount === 0) {
      return sendError(res, 404, 'Product not found');
    }

    // 4. Check for duplicate review by same customer
    const existingReview = await query(
      'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
      [productId, userId]
    );

    if (existingReview.rowCount && existingReview.rowCount > 0) {
      return sendError(res, 409, 'Conflict: You have already submitted a review for this product');
    }

    // 5. Insert review
    const insertRes = await query(
      `INSERT INTO reviews (product_id, user_id, rating, comment, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, product_id AS "productId", user_id AS "userId", rating, comment,
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [productId, userId, ratingNum, comment.trim()]
    );

    // Get user's name
    const userRes = await query('SELECT name FROM users WHERE id = $1', [userId]);
    const review = {
      ...insertRes.rows[0],
      userName: userRes.rows[0]?.name || 'Anonymous',
    };

    return sendSuccess(res, 201, 'Review submitted successfully', { review });
  } catch (error: any) {
    console.error('Create review error:', error);
    return sendError(res, 500, 'Failed to submit review', error.message);
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { id, reviewId } = req.params;

    const rId = parseInt(reviewId, 10);
    const pId = parseInt(id, 10);

    if (isNaN(rId) || rId <= 0 || isNaN(pId) || pId <= 0) {
      return sendError(res, 400, 'Invalid IDs provided');
    }

    const reviewRes = await query(
      'SELECT id, user_id FROM reviews WHERE id = $1 AND product_id = $2',
      [rId, pId]
    );

    if (reviewRes.rowCount === 0) {
      return sendError(res, 404, 'Review not found');
    }

    const review = reviewRes.rows[0];

    // Only review author or ADMIN can delete
    if (review.user_id !== userId && userRole !== 'ADMIN') {
      return sendError(res, 403, 'Forbidden: You can only delete your own reviews');
    }

    await query('DELETE FROM reviews WHERE id = $1', [rId]);

    return sendSuccess(res, 200, 'Review deleted successfully', { id: rId });
  } catch (error: any) {
    console.error('Delete review error:', error);
    return sendError(res, 500, 'Failed to delete review', error.message);
  }
};

