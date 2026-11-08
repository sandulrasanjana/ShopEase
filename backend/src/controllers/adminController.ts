import { Request, Response } from 'express';
import { getClient, query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const getAllOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const { status, page = '1', limit = '50' } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];
    let valueCounter = 1;

    if (status && typeof status === 'string' && status.trim() !== '' && status.toUpperCase() !== 'ALL') {
      const upperStatus = status.trim().toUpperCase();
      if (!VALID_STATUSES.includes(upperStatus)) {
        return sendError(res, 400, `Invalid status filter. Allowed values: ${VALID_STATUSES.join(', ')}`);
      }
      conditions.push(`o.status = $${valueCounter}`);
      values.push(upperStatus);
      valueCounter++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countSql = `SELECT COUNT(*) AS total FROM orders o ${whereClause}`;
    const countRes = await query(countSql, values);
    const total = parseInt(countRes.rows[0].total, 10);

    const ordersSql = `
      SELECT o.id, o.user_id AS "userId", o.total_amount::float AS "totalAmount", o.status,
             o.shipping_name AS "shippingName", o.shipping_address AS "shippingAddress",
             o.shipping_city AS "shippingCity", o.shipping_postal_code AS "shippingPostalCode",
             o.shipping_phone AS "shippingPhone", o.payment_method AS "paymentMethod",
             o.created_at AS "createdAt", o.updated_at AS "updatedAt",
             u.name AS "userName", u.email AS "userEmail"
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${valueCounter} OFFSET $${valueCounter + 1}
    `;
    values.push(limitNum, offset);

    const ordersRes = await query(ordersSql, values);
    const orders = ordersRes.rows;

    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const itemsRes = await query(
        `SELECT id, order_id AS "orderId", product_id AS "productId", product_name AS "productName",
                unit_price::float AS "unitPrice", quantity, subtotal::float AS subtotal
         FROM order_items
         WHERE order_id = ANY($1::int[])
         ORDER BY id ASC`,
        [orderIds]
      );

      const itemsByOrder: Record<number, any[]> = {};
      itemsRes.rows.forEach((item) => {
        if (!itemsByOrder[item.orderId]) {
          itemsByOrder[item.orderId] = [];
        }
        itemsByOrder[item.orderId].push(item);
      });

      orders.forEach((o) => {
        o.items = itemsByOrder[o.id] || [];
        o.user = {
          id: o.userId,
          name: o.userName,
          email: o.userEmail,
        };
        delete o.userName;
        delete o.userEmail;
      });
    }

    return sendSuccess(res, 200, 'Admin orders retrieved successfully', {
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Admin get all orders error:', error);
    return sendError(res, 500, 'Failed to fetch admin orders', error.message);
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { status } = req.body;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId) || orderId <= 0) {
    return sendError(res, 400, 'Invalid order ID');
  }

  if (!status || typeof status !== 'string') {
    return sendError(res, 400, 'Status is required');
  }

  const newStatus = status.trim().toUpperCase();
  if (!VALID_STATUSES.includes(newStatus)) {
    return sendError(
      res,
      400,
      `Validation failed: Invalid status "${status}". Allowed values: ${VALID_STATUSES.join(', ')}`
    );
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `SELECT id, status FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId]
    );

    if (orderRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 404, 'Order not found');
    }

    const currentStatus = orderRes.rows[0].status;

    // If changing to CANCELLED from non-cancelled, restore product stock
    if (newStatus === 'CANCELLED' && currentStatus !== 'CANCELLED') {
      const itemsRes = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );
      for (const item of itemsRes.rows) {
        if (item.product_id) {
          await client.query(
            'UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }
      }
    }

    // If changing from CANCELLED to an active status, verify and deduct stock
    if (currentStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
      const itemsRes = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );
      for (const item of itemsRes.rows) {
        if (item.product_id) {
          const prodRes = await client.query(
            'SELECT stock, name FROM products WHERE id = $1 FOR UPDATE',
            [item.product_id]
          );
          if (prodRes.rowCount !== null && prodRes.rowCount > 0 && prodRes.rows[0].stock < item.quantity) {
            await client.query('ROLLBACK');
            return sendError(
              res,
              400,
              `Cannot reactivate order: Insufficient stock for product "${prodRes.rows[0].name}"`
            );
          }
          await client.query(
            'UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }
      }
    }

    const updatedRes = await client.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, user_id AS "userId", total_amount::float AS "totalAmount", status,
                 shipping_name AS "shippingName", shipping_address AS "shippingAddress",
                 shipping_city AS "shippingCity", shipping_postal_code AS "shippingPostalCode",
                 shipping_phone AS "shippingPhone", payment_method AS "paymentMethod",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [newStatus, orderId]
    );

    await client.query('COMMIT');

    return sendSuccess(res, 200, `Order status updated to ${newStatus} successfully`, {
      order: updatedRes.rows[0],
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Update order status error:', error);
    return sendError(res, 500, 'Failed to update order status', error.message);
  } finally {
    client.release();
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Total revenue (sum of all orders except CANCELLED)
    const revenueRes = await query(
      `SELECT COALESCE(SUM(total_amount), 0)::float AS "totalRevenue"
       FROM orders
       WHERE status != 'CANCELLED'`
    );
    const totalRevenue = revenueRes.rows[0].totalRevenue;

    // 2. Orders count & breakdown by status
    const ordersCountRes = await query(`SELECT COUNT(*) AS total FROM orders`);
    const totalOrders = parseInt(ordersCountRes.rows[0].total, 10);

    const statusCountsRes = await query(
      `SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status`
    );
    const ordersByStatus: Record<string, number> = {};
    VALID_STATUSES.forEach((s) => (ordersByStatus[s] = 0));
    statusCountsRes.rows.forEach((r) => {
      ordersByStatus[r.status] = r.count;
    });

    // 3. Products metrics
    const productsCountRes = await query(`SELECT COUNT(*) AS total FROM products`);
    const totalProducts = parseInt(productsCountRes.rows[0].total, 10);

    const outOfStockRes = await query(`SELECT COUNT(*) AS total FROM products WHERE stock = 0`);
    const outOfStockCount = parseInt(outOfStockRes.rows[0].total, 10);

    const lowStockRes = await query(`SELECT COUNT(*) AS total FROM products WHERE stock > 0 AND stock <= 5`);
    const lowStockCount = parseInt(lowStockRes.rows[0].total, 10);

    // 4. Customers count
    const usersCountRes = await query(`SELECT COUNT(*) AS total FROM users WHERE role = 'CUSTOMER'`);
    const totalCustomers = parseInt(usersCountRes.rows[0].total, 10);

    // 5. Recent 5 orders
    const recentOrdersRes = await query(
      `SELECT o.id, o.total_amount::float AS "totalAmount", o.status,
              o.shipping_name AS "shippingName", o.created_at AS "createdAt",
              u.name AS "customerName"
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    return sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', {
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        outOfStockCount,
        lowStockCount,
        totalCustomers,
        ordersByStatus,
        recentOrders: recentOrdersRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return sendError(res, 500, 'Failed to fetch dashboard statistics', error.message);
  }
};
