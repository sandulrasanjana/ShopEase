import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
) => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data: data as T,
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: any
) => {
  const payload: ApiResponse = {
    success: false,
    message,
    error: error || {},
  };
  return res.status(statusCode).json(payload);
};
