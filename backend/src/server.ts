import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import { checkDatabaseConnection, pool, query } from './config/db.js';
import { runSchemaMigration } from './config/initDb.js';
import { runSeedData } from './config/seedDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
}

// API Routes
app.use('/api', routes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Helper to auto-initialize DB if tables do not exist
const autoInitDbIfEmpty = async () => {
  try {
    const tableCheck = await query(
      `SELECT to_regclass('public.users') AS exists`
    );
    if (!tableCheck.rows[0].exists) {
      console.log('Database tables not detected. Auto-running schema migration and seed...');
      await runSchemaMigration();
      await runSeedData();
      console.log('Database auto-initialization complete.');
    }
  } catch (err: any) {
    console.warn('Could not auto-verify database schema on startup:', err.message);
  }
};

// Start server
const startServer = async () => {
  const isDbConnected = await checkDatabaseConnection();
  if (isDbConnected) {
    await autoInitDbIfEmpty();
  } else {
    console.warn('WARNING: PostgreSQL is currently unreachable. Database dependent endpoints will return errors until database is reachable.');
  }

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` ShopEase Backend API running on port ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Health: http://localhost:${PORT}/api/health`);
    console.log(`==================================================`);
  });
};

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

export default app;

