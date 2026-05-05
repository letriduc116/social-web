import type { AuthResponse } from '../types/auth';

const USER_STORAGE_KEY = 'user';

const getStoredAuth = (): AuthResponse | null => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
};

const getCurrentUserId = (): string => {
  const auth = getStoredAuth();
  const userId = auth?.id || auth?.user?.id;

  if (!userId) {
    throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại');
  }

  return userId;
};

const getCurrentUserName = (): string => {
  const auth = getStoredAuth();
  return auth?.fullName || auth?.user?.fullName || auth?.userName || auth?.user?.userName || 'Người dùng';
};

export const authStorage = {
  getStoredAuth,
  getCurrentUserId,
  getCurrentUserName,
};
