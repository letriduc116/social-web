import { ApiService } from './api';
import type { NotificationResponse } from '../types/notification';

type ApiWrap<T> = {
  status?: number;
  message?: string | null;
  data: T;
};

const API_URL = '/v1/notifications';

const unwrap = <T>(response: ApiWrap<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }

  return response as T;
};

const getMyNotifications = async (): Promise<NotificationResponse[]> => {
  const response = await ApiService.get<ApiWrap<NotificationResponse[]> | NotificationResponse[]>(API_URL);

  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
};

const countUnread = async (): Promise<number> => {
  const response = await ApiService.get<ApiWrap<{ count: number }> | { count: number }>(`${API_URL}/unread-count`);

  const data = unwrap(response);
  return Number(data?.count || 0);
};

const markAsRead = async (notificationId: string): Promise<NotificationResponse> => {
  const response = await ApiService.patch<ApiWrap<NotificationResponse> | NotificationResponse>(
    `${API_URL}/${notificationId}/read`,
  );

  return unwrap(response);
};

export const notificationService = {
  getMyNotifications,
  countUnread,
  markAsRead,
};
