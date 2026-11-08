import api from './api';
import { ApiResponse, Cart } from '../types';

export const cartService = {
  async getCart(): Promise<Cart> {
    const res = await api.get<ApiResponse<{ cart: Cart }>>('/cart');
    return res.data.data!.cart;
  },

  async addToCart(productId: number, quantity: number = 1): Promise<Cart> {
    const res = await api.post<ApiResponse<{ cart: Cart }>>('/cart/items', {
      productId,
      quantity,
    });
    return res.data.data!.cart;
  },

  async updateItemQuantity(itemId: number, quantity: number): Promise<Cart> {
    const res = await api.put<ApiResponse<{ cart: Cart }>>(`/cart/items/${itemId}`, {
      quantity,
    });
    return res.data.data!.cart;
  },

  async removeItem(itemId: number): Promise<Cart> {
    const res = await api.delete<ApiResponse<{ cart: Cart }>>(`/cart/items/${itemId}`);
    return res.data.data!.cart;
  },

  async clearCart(): Promise<Cart> {
    const res = await api.delete<ApiResponse<{ cart: Cart }>>('/cart');
    return res.data.data!.cart;
  },
};

