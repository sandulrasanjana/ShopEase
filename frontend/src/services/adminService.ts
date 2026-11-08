import api from './api';
import { ApiResponse, Order, OrderStatus } from '../types';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  totalCustomers: number;
  ordersByStatus: Record<string, number>;
  recentOrders: {
    id: number;
    totalAmount: number;
    status: OrderStatus;
    shippingName: string;
    createdAt: string;
    customerName: string;
  }[];
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get<ApiResponse<{ stats: DashboardStats }>>('/admin/stats');
    return res.data.data!.stats;
  },

  async getAllOrders(status?: string): Promise<Order[]> {
    const res = await api.get<ApiResponse<{ orders: Order[] }>>('/admin/orders', {
      params: { status },
    });
    return res.data.data!.orders;
  },

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const res = await api.put<ApiResponse<{ order: Order }>>(`/admin/orders/${orderId}/status`, {
      status,
    });
    return res.data.data!.order;
  },
};

