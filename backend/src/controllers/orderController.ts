import { Request, Response } from 'express';
import { getClient, query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { isValidPhone, isValidPostalCode } from '../utils/validation.js';

export const createOrder = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user!.userId;
  const {
    shippingName,
    shippingAddress,
    shippingCity,
    shippingPostalCode,
    shippingPhone,
    paymentMethod = 'Simulated Card',
  } = req.body;

  // 1. Validation
  if (!shippingName || !shippingAddress || !shippingCity || !shippingPostalCode || !shippingPhone) {
    return sendError(
      res,
      400,
      'All shipping fields are required: shippingName, shippingAddress, shippingCity, shippingPostalCode, shippingPhone'
    );
  }

  if (String(shippingName).trim().length < 2) {
    return sendError(res, 422, 'Validation failed: Full name must be at least 2 characters long');
  }

  if (String(shippingAddress).trim().length < 5) {
    return sendError(res, 422, 'Validation failed: Address must be at least 5 characters long');
  }

  if (!isValidPostalCode(shippingPostalCode)) {
    return sendError(res, 422, 'Validation failed: Invalid postal code');
  }

  if (!isValidPhone(shippingPhone)) {
    return sendError(res, 422, 'Validation failed: Invalid phone number format');
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 2. Fetch user's cart
    const cartRes = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 400, 'Cart is empty. Cannot place an order.');
    }
    const cartId = cartRes.rows[0].id;

    // 3. Fetch cart items
    const itemsRes = await client.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price::float AS price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       FOR UPDATE OF p`,
      [cartId]
    );

    if (itemsRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 400, 'Your cart is empty. Please add products before checking out.');
    }

    // 4. Validate stock & calculate total securely on backend
    let totalAmount = 0;
    const orderItemsData: any[] = [];

    for (const item of itemsRes.rows) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return sendError(
          res,
          409,
          `Insufficient stock for "${item.name}". Only ${item.stock} remaining in stock, but ${item.quantity} requested.`
        );
      }

      const unitPrice = item.price;
      const subtotal = parseFloat((unitPrice * item.quantity).toFixed(2));
      totalAmount += subtotal;

      orderItemsData.push({
        productId: item.product_id,
        productName: item.name,
        unitPrice,
        quantity: item.quantity,
        subtotal,
      });
    }

    totalAmount = parseFloat(totalAmount.toFixed(2));

    // 5. Create Order
    const orderRes = await client.query(
      `INSERT INTO orders (
        user_id, total_amount, status,
        shipping_name, shipping_address, shipping_city, shipping_postal_code, shipping_phone,
        payment_method, created_at, updated_at
      ) VALUES ($1, $2, 'PENDING', $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, user_id AS "userId", total_amount::float AS "totalAmount", status,
                shipping_name AS "shippingName", shipping_address AS "shippingAddress",
                shipping_city AS "shippingCity", shipping_postal_code AS "shippingPostalCode",
                shipping_phone AS "shippingPhone", payment_method AS "paymentMethod",
                created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        userId,
        totalAmount,
        shippingName.trim(),
        shippingAddress.trim(),
        shippingCity.trim(),
        shippingPostalCode.trim(),
        shippingPhone.trim(),
        paymentMethod.trim(),
      ]
    );

    const order = orderRes.rows[0];

    // 6. Create Order Items & Decrement Stock
    const insertedItems: any[] = [];
    for (const oi of orderItemsData) {
      const oiRes = await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, order_id AS "orderId", product_id AS "productId", product_name AS "productName",
                   unit_price::float AS "unitPrice", quantity, subtotal::float AS subtotal`,
        [order.id, oi.productId, oi.productName, oi.unitPrice, oi.quantity, oi.subtotal]
      );
      insertedItems.push(oiRes.rows[0]);

      // Decrement stock
      await client.query(
        `UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2`,
        [oi.quantity, oi.productId]
      );
    }

    // 7. Clear cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    await client.query('COMMIT');

    order.items = insertedItems;

    return sendSuccess(res, 201, 'Order placed successfully', { order });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    return sendError(res, 500, 'Failed to process order', error.message);
  } finally {
    client.release();
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;

    const ordersRes = await query(
      `SELECT o.id, o.user_id AS "userId", o.total_amount::float AS "totalAmount", o.status,
              o.shipping_name AS "shippingName", o.shipping_address AS "shippingAddress",
              o.shipping_city AS "shippingCity", o.shipping_postal_code AS "shippingPostalCode",
              o.shipping_phone AS "shippingPhone", o.payment_method AS "paymentMethod",
              o.created_at AS "createdAt", o.updated_at AS "updatedAt"
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

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
      });
    }

    return sendSuccess(res, 200, 'Orders retrieved successfully', { orders });
  } catch (error: any) {
    console.error('Get my orders error:', error);
    return sendError(res, 500, 'Failed to fetch orders', error.message);
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId) || orderId <= 0) {
      return sendError(res, 400, 'Invalid order ID');
    }

    const orderRes = await query(
      `SELECT o.id, o.user_id AS "userId", o.total_amount::float AS "totalAmount", o.status,
              o.shipping_name AS "shippingName", o.shipping_address AS "shippingAddress",
              o.shipping_city AS "shippingCity", o.shipping_postal_code AS "shippingPostalCode",
              o.shipping_phone AS "shippingPhone", o.payment_method AS "paymentMethod",
              o.created_at AS "createdAt", o.updated_at AS "updatedAt",
              u.name AS "userName", u.email AS "userEmail"
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (orderRes.rowCount === 0) {
      return sendError(res, 404, 'Order not found');
    }

    const order = orderRes.rows[0];

    // Authorization: User can only view their own order unless they are an ADMIN
    if (order.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return sendError(res, 403, 'Forbidden: You do not have permission to view this order');
    }

    const itemsRes = await query(
      `SELECT id, order_id AS "orderId", product_id AS "productId", product_name AS "productName",
              unit_price::float AS "unitPrice", quantity, subtotal::float AS subtotal
       FROM order_items
       WHERE order_id = $1
       ORDER BY id ASC`,
      [orderId]
    );

    order.items = itemsRes.rows;
    order.user = {
      id: order.userId,
      name: order.userName,
      email: order.userEmail,
    };
    delete order.userName;
    delete order.userEmail;

    return sendSuccess(res, 200, 'Order details retrieved successfully', { order });
  } catch (error: any) {
    console.error('Get order by ID error:', error);
    return sendError(res, 500, 'Failed to fetch order details', error.message);
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId) || orderId <= 0) {
    return sendError(res, 400, 'Invalid order ID');
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `SELECT id, user_id, status FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId]
    );

    if (orderRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 404, 'Order not found');
    }

    const order = orderRes.rows[0];

    if (order.user_id !== req.user!.userId && req.user!.role !== 'ADMIN') {
      await client.query('ROLLBACK');
      return sendError(res, 403, 'Forbidden: You do not have permission to cancel this order');
    }

    if (order.status === 'CANCELLED') {
      await client.query('ROLLBACK');
      return sendError(res, 400, 'Order is already cancelled');
    }

    if (order.status !== 'PENDING') {
      await client.query('ROLLBACK');
      return sendError(res, 400, `Cannot cancel order with status "${order.status}". Only PENDING orders can be cancelled.`);
    }

    // Restore stock
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

    await client.query(
      `UPDATE orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1`,
      [orderId]
    );

    await client.query('COMMIT');

    return sendSuccess(res, 200, 'Order cancelled successfully', { id: orderId, status: 'CANCELLED' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Cancel order error:', error);
    return sendError(res, 500, 'Failed to cancel order', error.message);
  } finally {
    client.release();
  }
};

