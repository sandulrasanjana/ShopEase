import { Router } from 'express';
import {
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require admin authentication
router.use(authenticateToken, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;

