import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { isValidPrice, isValidStock } from '../utils/validation.js';

export const getAllProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = '1', limit = '50' } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];
    let valueCounter = 1;

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      conditions.push(`(LOWER(name) LIKE $${valueCounter} OR LOWER(description) LIKE $${valueCounter})`);
      values.push(`%${search.trim().toLowerCase()}%`);
      valueCounter++;
    }

    // Category filter
    if (category && typeof category === 'string' && category.trim() !== '' && category.toLowerCase() !== 'all') {
      conditions.push(`LOWER(category) = $${valueCounter}`);
      values.push(category.trim().toLowerCase());
      valueCounter++;
    }

    // Price range filter
    if (minPrice !== undefined && minPrice !== '') {
      const min = Number(minPrice);
      if (!isNaN(min) && min >= 0) {
        conditions.push(`price >= $${valueCounter}`);
        values.push(min);
        valueCounter++;
      }
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      const max = Number(maxPrice);
      if (!isNaN(max) && max >= 0) {
        conditions.push(`price <= $${valueCounter}`);
        values.push(max);
        valueCounter++;
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    let orderByClause = 'ORDER BY created_at DESC';
    if (sort === 'price_asc') {
      orderByClause = 'ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      orderByClause = 'ORDER BY price DESC';
    } else if (sort === 'name_asc') {
      orderByClause = 'ORDER BY name ASC';
    } else if (sort === 'name_desc') {
      orderByClause = 'ORDER BY name DESC';
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    // Total count query
    const countSql = `SELECT COUNT(*) AS total FROM products ${whereClause}`;
    const countResult = await query(countSql, values);
    const total = parseInt(countResult.rows[0].total, 10);

    // Products query
    const sql = `
      SELECT id, name, description, category, price::float AS price, stock, image,
             created_at AS "createdAt", updated_at AS "updatedAt"
      FROM products
      ${whereClause}
      ${orderByClause}
      LIMIT $${valueCounter} OFFSET $${valueCounter + 1}
    `;
    values.push(limitNum, offset);

    const result = await query(sql, values);

    return sendSuccess(res, 200, 'Products retrieved successfully', {
      products: result.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get all products error:', error);
    return sendError(res, 500, 'Failed to fetch products', error.message);
  }
};

export const getCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await query(
      `SELECT DISTINCT category FROM products ORDER BY category ASC`
    );
    const categories = result.rows.map((row) => row.category);
    return sendSuccess(res, 200, 'Categories retrieved successfully', { categories });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return sendError(res, 500, 'Failed to fetch categories', error.message);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId) || productId <= 0) {
      return sendError(res, 400, 'Invalid product ID. Must be a positive integer.');
    }

    const result = await query(
      `SELECT id, name, description, category, price::float AS price, stock, image,
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM products
       WHERE id = $1`,
      [productId]
    );

    if (result.rowCount === 0) {
      return sendError(res, 404, 'Product not found');
    }

    return sendSuccess(res, 200, 'Product retrieved successfully', {
      product: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get product by ID error:', error);
    return sendError(res, 500, 'Failed to fetch product', error.message);
  }
};

export const createProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, category, price, stock, image } = req.body;

    if (!name || !description || !category || price === undefined || stock === undefined || !image) {
      return sendError(res, 400, 'All fields are required: name, description, category, price, stock, image');
    }

    if (!isValidPrice(price)) {
      return sendError(res, 422, 'Validation failed: Price must be a number greater than 0');
    }

    if (!isValidStock(stock)) {
      return sendError(res, 422, 'Validation failed: Stock must be a non-negative integer');
    }

    const result = await query(
      `INSERT INTO products (name, description, category, price, stock, image, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, name, description, category, price::float AS price, stock, image,
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [name.trim(), description.trim(), category.trim(), Number(price), Number(stock), image.trim()]
    );

    return sendSuccess(res, 201, 'Product created successfully', {
      product: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    return sendError(res, 500, 'Failed to create product', error.message);
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId) || productId <= 0) {
      return sendError(res, 400, 'Invalid product ID');
    }

    // Check if product exists
    const existing = await query('SELECT id FROM products WHERE id = $1', [productId]);
    if (existing.rowCount === 0) {
      return sendError(res, 404, 'Product not found');
    }

    const { name, description, category, price, stock, image } = req.body;

    if (!name || !description || !category || price === undefined || stock === undefined || !image) {
      return sendError(res, 400, 'All fields are required: name, description, category, price, stock, image');
    }

    if (!isValidPrice(price)) {
      return sendError(res, 422, 'Validation failed: Price must be a number greater than 0');
    }

    if (!isValidStock(stock)) {
      return sendError(res, 422, 'Validation failed: Stock must be a non-negative integer');
    }

    const result = await query(
      `UPDATE products
       SET name = $1, description = $2, category = $3, price = $4, stock = $5, image = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, description, category, price::float AS price, stock, image,
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [name.trim(), description.trim(), category.trim(), Number(price), Number(stock), image.trim(), productId]
    );

    return sendSuccess(res, 200, 'Product updated successfully', {
      product: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    return sendError(res, 500, 'Failed to update product', error.message);
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId) || productId <= 0) {
      return sendError(res, 400, 'Invalid product ID');
    }

    const existing = await query('SELECT id FROM products WHERE id = $1', [productId]);
    if (existing.rowCount === 0) {
      return sendError(res, 404, 'Product not found');
    }

    await query('DELETE FROM products WHERE id = $1', [productId]);

    return sendSuccess(res, 200, 'Product deleted successfully', { id: productId });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return sendError(res, 500, 'Failed to delete product', error.message);
  }
};

