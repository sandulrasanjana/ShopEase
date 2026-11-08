import api from './api';
import { ApiResponse, AuthResponse, User } from '../types';

export const authService = {
  async register(data: { name: string; email: string; password: string; confirmPassword: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data!;
  },

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data!;
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data!.user;
  },
};

