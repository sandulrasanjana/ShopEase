import { Router } from 'express';
import {
  getAllProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import {
  getProductReviews,
  createReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);

// Customer Review routes
router.post('/:id/reviews', authenticateToken, createReview);
router.delete('/:id/reviews/:reviewId', authenticateToken, deleteReview);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

export default router;

