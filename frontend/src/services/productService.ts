import api from './api';
import { ApiResponse, Product, ProductFilterParams } from '../types';

export const productService = {
  async getProducts(params?: ProductFilterParams): Promise<{ products: Product[]; pagination: any }> {
    const res = await api.get<ApiResponse<{ products: Product[]; pagination: any }>>('/products', {
      params,
    });
    return res.data.data!;
  },

  async getCategories(): Promise<string[]> {
    const res = await api.get<ApiResponse<{ categories: string[] }>>('/products/categories');
    return res.data.data!.categories;
  },

  async getProductById(id: number | string): Promise<Product> {
    const res = await api.get<ApiResponse<{ product: Product }>>(`/products/${id}`);
    return res.data.data!.product;
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const res = await api.post<ApiResponse<{ product: Product }>>('/products', data);
    return res.data.data!.product;
  },

  async updateProduct(id: number | string, data: Partial<Product>): Promise<Product> {
    const res = await api.put<ApiResponse<{ product: Product }>>(`/products/${id}`, data);
    return res.data.data!.product;
  },

  async deleteProduct(id: number | string): Promise<void> {
    await api.delete<ApiResponse>(`/products/${id}`);
  },
};

