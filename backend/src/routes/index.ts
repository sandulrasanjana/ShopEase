import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import adminRoutes from './adminRoutes.js';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    let dbStatus = 'disconnected';
    let dbTime = null;
    try {
      const dbRes = await query('SELECT NOW() AS now');
      dbStatus = 'connected';
      dbTime = dbRes.rows[0].now;
    } catch (e: any) {
      dbStatus = `error: ${e.message}`;
    }

    return sendSuccess(res, 200, 'ShopEase API is healthy', {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        time: dbTime,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error: any) {
    return sendError(res, 500, 'Health check failed', error.message);
  }
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

export default router;

