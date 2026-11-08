import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { isValidQuantity } from '../utils/validation.js';

// Helper to get or create cart for user
const getOrCreateCartId = async (userId: number): Promise<number> => {
  let cartResult = await query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (cartResult.rowCount === 0) {
    cartResult = await query(
      'INSERT INTO carts (user_id, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id',
      [userId]
    );
  }
  return cartResult.rows[0].id;
};

// Helper to fetch full populated cart
const getPopulatedCart = async (userId: number, cartId: number) => {
  const itemsResult = await query(
    `SELECT ci.id, ci.cart_id AS "cartId", ci.product_id AS "productId", ci.quantity,
            p.name, p.description, p.category, p.price::float AS price, p.stock, p.image
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1
     ORDER BY ci.created_at ASC`,
    [cartId]
  );

  let subtotal = 0;
  let totalItems = 0;

  const items = itemsResult.rows.map((row) => {
    const itemSubtotal = parseFloat((row.quantity * row.price).toFixed(2));
    subtotal += itemSubtotal;
    totalItems += row.quantity;
    return {
      id: row.id,
      cartId: row.cartId,
      productId: row.productId,
      quantity: row.quantity,
      subtotal: itemSubtotal,
      product: {
        id: row.productId,
        name: row.name,
        description: row.description,
        category: row.category,
        price: row.price,
        stock: row.stock,
        image: row.image,
      },
    };
  });

  const total = parseFloat(subtotal.toFixed(2));

  return {
    id: cartId,
    userId,
    items,
    subtotal: total,
    total,
    totalItems,
  };
};

export const getCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const cartId = await getOrCreateCartId(userId);
    const cart = await getPopulatedCart(userId, cartId);

    return sendSuccess(res, 200, 'Cart retrieved successfully', { cart });
  } catch (error: any) {
    console.error('Get cart error:', error);
    return sendError(res, 500, 'Failed to fetch cart', error.message);
  }
};

export const addToCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const { productId, quantity = 1 } = req.body;

    const pId = parseInt(productId, 10);
    const qty = parseInt(quantity, 10);

    if (isNaN(pId) || pId <= 0) {
      return sendError(res, 400, 'Invalid product ID');
    }

    if (!isValidQuantity(qty)) {
      return sendError(res, 400, 'Validation failed: Quantity must be a positive integer greater than 0');
    }

    // Verify product exists and check stock
    const productResult = await query(
      'SELECT id, name, price, stock FROM products WHERE id = $1',
      [pId]
    );

    if (productResult.rowCount === 0) {
      return sendError(res, 404, 'Product not found');
    }

    const product = productResult.rows[0];

    if (product.stock <= 0) {
      return sendError(res, 400, `Cannot add to cart: "${product.name}" is out of stock`);
    }

    const cartId = await getOrCreateCartId(userId);

    // Check if item is already in cart
    const existingItemResult = await query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, pId]
    );

    if (existingItemResult.rowCount && existingItemResult.rowCount > 0) {
      const currentQty = existingItemResult.rows[0].quantity;
      const targetQty = currentQty + qty;

      if (targetQty > product.stock) {
        return sendError(
          res,
          400,
          `Cannot add quantity: Only ${product.stock} units available in stock (${currentQty} already in your cart)`
        );
      }

      await query(
        'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
        [targetQty, existingItemResult.rows[0].id]
      );
    } else {
      if (qty > product.stock) {
        return sendError(
          res,
          400,
          `Cannot add quantity: Only ${product.stock} units available in stock`
        );
      }

      await query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [cartId, pId, qty]
      );
    }

    const cart = await getPopulatedCart(userId, cartId);
    return sendSuccess(res, 200, 'Item added to cart successfully', { cart });
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return sendError(res, 500, 'Failed to add item to cart', error.message);
  }
};

export const updateCartItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { quantity } = req.body;

    const itemId = parseInt(id, 10);
    const qty = parseInt(quantity, 10);

    if (isNaN(itemId) || itemId <= 0) {
      return sendError(res, 400, 'Invalid cart item ID');
    }

    if (!isValidQuantity(qty)) {
      return sendError(res, 400, 'Validation failed: Quantity must be a positive integer greater than 0');
    }

    const cartId = await getOrCreateCartId(userId);

    // Verify item belongs to this user's cart
    const itemResult = await query(
      `SELECT ci.id, ci.quantity, ci.product_id, p.stock, p.name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = $1 AND ci.cart_id = $2`,
      [itemId, cartId]
    );

    if (itemResult.rowCount === 0) {
      return sendError(res, 404, 'Cart item not found');
    }

    const item = itemResult.rows[0];

    if (qty > item.stock) {
      return sendError(
        res,
        400,
        `Cannot set quantity to ${qty}: Only ${item.stock} units of "${item.name}" available in stock`
      );
    }

    await query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
      [qty, itemId]
    );

    const cart = await getPopulatedCart(userId, cartId);
    return sendSuccess(res, 200, 'Cart item updated successfully', { cart });
  } catch (error: any) {
    console.error('Update cart item error:', error);
    return sendError(res, 500, 'Failed to update cart item', error.message);
  }
};

export const removeCartItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const itemId = parseInt(id, 10);

    if (isNaN(itemId) || itemId <= 0) {
      return sendError(res, 400, 'Invalid cart item ID');
    }

    const cartId = await getOrCreateCartId(userId);

    const itemResult = await query(
      'SELECT id FROM cart_items WHERE id = $1 AND cart_id = $2',
      [itemId, cartId]
    );

    if (itemResult.rowCount === 0) {
      return sendError(res, 404, 'Cart item not found');
    }

    await query('DELETE FROM cart_items WHERE id = $1', [itemId]);

    const cart = await getPopulatedCart(userId, cartId);
    return sendSuccess(res, 200, 'Cart item removed successfully', { cart });
  } catch (error: any) {
    console.error('Remove cart item error:', error);
    return sendError(res, 500, 'Failed to remove cart item', error.message);
  }
};

export const clearCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const cartId = await getOrCreateCartId(userId);

    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    const cart = await getPopulatedCart(userId, cartId);
    return sendSuccess(res, 200, 'Cart cleared successfully', { cart });
  } catch (error: any) {
    console.error('Clear cart error:', error);
    return sendError(res, 500, 'Failed to clear cart', error.message);
  }
};

