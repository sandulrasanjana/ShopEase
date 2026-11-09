import api from './api';
import { ApiResponse, Product, ProductFilterParams, Review, ReviewsResponse } from '../types';

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

  async getProductReviews(productId: number | string): Promise<ReviewsResponse> {
    const res = await api.get<ApiResponse<ReviewsResponse>>(`/products/${productId}/reviews`);
    return res.data.data!;
  },

  async addReview(productId: number | string, data: { rating: number; comment: string }): Promise<Review> {
    const res = await api.post<ApiResponse<{ review: Review }>>(`/products/${productId}/reviews`, data);
    return res.data.data!.review;
  },

  async deleteReview(productId: number | string, reviewId: number | string): Promise<void> {
    await api.delete<ApiResponse>(`/products/${productId}/reviews/${reviewId}`);
  },
};

