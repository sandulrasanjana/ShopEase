import api from './api';
import { ApiResponse, Order } from '../types';

export interface CheckoutData {
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone: string;
  paymentMethod?: string;
}

export const orderService = {
  async createOrder(data: CheckoutData): Promise<Order> {
    const res = await api.post<ApiResponse<{ order: Order }>>('/orders', data);
    return res.data.data!.order;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await api.get<ApiResponse<{ orders: Order[] }>>('/orders');
    return res.data.data!.orders;
  },

  async getOrderById(id: number | string): Promise<Order> {
    const res = await api.get<ApiResponse<{ order: Order }>>(`/orders/${id}`);
    return res.data.data!.order;
  },

  async cancelOrder(id: number | string): Promise<void> {
    await api.post<ApiResponse>(`/orders/${id}/cancel`);
  },
};

