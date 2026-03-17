import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'http://localhost:8080/api';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

type CustomRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuth?: boolean;
};

export interface ApiResponse<T = unknown> {
  data: T;
  success?: boolean;
  message?: string;
  status?: number;
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config: CustomRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!config.skipAuth && token?.trim()) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(new Error('Không thể kết nối đến máy chủ'));
    }

    const responseData = error.response.data as ApiResponse<unknown> | string | undefined;

    if (typeof responseData === 'string') {
      return Promise.reject(new Error(responseData));
    }

    if (responseData?.message) {
      return Promise.reject(new Error(responseData.message));
    }

    switch (error.response.status) {
      case 401:
        return Promise.reject(new Error('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn'));
      case 403:
        return Promise.reject(new Error('Bạn không có quyền thực hiện thao tác này'));
      case 404:
        return Promise.reject(new Error('Không tìm thấy dữ liệu'));
      default:
        if (error.response.status >= 500) {
          return Promise.reject(new Error('Lỗi máy chủ'));
        }
        return Promise.reject(new Error(error.message || 'Gọi API thất bại'));
    }
  },
);

export class ApiService {
  static setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('user');
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY)?.trim();
  }

  static async get<T, P = unknown>(endpoint: string, params?: P, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<T>(endpoint, {
      ...config,
      params,
    });
    return response.data;
  }

  static async post<T, B = unknown>(endpoint: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.post<T>(endpoint, body, config);
    return response.data;
  }

  static async put<T, B = unknown>(endpoint: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.put<T>(endpoint, body, config);
    return response.data;
  }

  static async patch<T, B = unknown>(endpoint: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.patch<T>(endpoint, body, config);
    return response.data;
  }

  static async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<T>(endpoint, config);
    return response.data;
  }

  static async upload<T>(endpoint: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.post<T>(endpoint, formData, {
      ...config,
      headers: {
        ...(config?.headers || {}),
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  static getClient(): AxiosInstance {
    return api;
  }
}

export default api;
