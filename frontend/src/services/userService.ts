import { ApiService } from './api';
import type { UserProfileResponse, UserSearchResult, UserSummary } from '../types/user';

type ApiWrap<T> = {
  status?: number;
  success?: boolean;
  message?: string | null;
  data: T;
};

const API_URL = '/v1/users';

const REPORT_API_URL = '/v1/reports';

const unwrap = <T>(response: ApiWrap<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  return response as T;
};

const getProfile = async (id: string): Promise<UserProfileResponse> => {
  const response = await ApiService.get<ApiWrap<UserProfileResponse> | UserProfileResponse>(`${API_URL}/profile`, {
    id,
  });
  return unwrap(response);
};

const getFollowers = async (id: string): Promise<UserSummary[]> => {
  const response = await ApiService.get<ApiWrap<UserSummary[]> | UserSummary[]>(`${API_URL}/followers`, { id });
  return unwrap(response) || [];
};

const getFollowing = async (id: string): Promise<UserSummary[]> => {
  const response = await ApiService.get<ApiWrap<UserSummary[]> | UserSummary[]>(`${API_URL}/following`, { id });
  return unwrap(response) || [];
};

const followUser = async (id: string, targetId: string): Promise<void> => {
  await ApiService.post(`${API_URL}/follow`, null, {
    params: { id, targetId },
  });
};

const unfollowUser = async (id: string, targetId: string): Promise<void> => {
  await ApiService.post(`${API_URL}/unfollow`, null, {
    params: { id, targetId },
  });
};

const updateProfile = async (
  id: string,
  payload: {
    fullName?: string;
    userName?: string;
    bio?: string;
    profileImage?: string;
    coverImage?: string;
  },
): Promise<UserSummary> => {
  const response = await ApiService.put<ApiWrap<UserSummary> | UserSummary>(`${API_URL}/updateProfile`, payload, {
    params: { id },
  });

  return unwrap(response);
};

const uploadProfileImage = async (id: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await ApiService.upload<ApiWrap<string> | string>(`${API_URL}/uploadProfileImage`, formData, {
    params: { id },
  });

  return unwrap(response);
};

const uploadCoverImage = async (id: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await ApiService.upload<ApiWrap<string> | string>(`${API_URL}/uploadCoverImage`, formData, {
    params: { id },
  });

  return unwrap(response);
};

const normalizeUserReportReason = (reasonId: string): string => {
  switch (reasonId) {
    case 'fake_profile':
      return 'fake_profile';
    case 'false_information_or_scam':
      return 'misleading';
    case 'harassment_or_abuse':
      return 'abuse';
    case 'something_else':
      return 'other';
    default:
      return reasonId || 'other';
  }
};

const getUserReportDescription = (reasonId: string): string => {
  switch (reasonId) {
    case 'fake_profile':
      return 'Người dùng báo cáo trang cá nhân có dấu hiệu giả mạo.';
    case 'false_information_or_scam':
      return 'Người dùng báo cáo tài khoản có dấu hiệu thông tin sai sự thật, lừa đảo hoặc gian lận.';
    case 'harassment_or_abuse':
      return 'Người dùng báo cáo tài khoản có hành vi bắt nạt, quấy rối hoặc lạm dụng.';
    case 'something_else':
      return 'Người dùng báo cáo tài khoản vì vấn đề khác cần kiểm duyệt.';
    default:
      return 'Người dùng báo cáo tài khoản cần kiểm duyệt.';
  }
};

const reportUser = async (reportedUserId: string, reasonId: string): Promise<void> => {
  if (!reportedUserId) {
    throw new Error('Thiếu userId để gửi báo cáo');
  }

  const reason = normalizeUserReportReason(reasonId);

  await ApiService.post(`${REPORT_API_URL}/users`, {
    reportedUserId,
    userId: reportedUserId,
    targetUserId: reportedUserId,
    reason,
    reasonId: reason,
    description: getUserReportDescription(reasonId),
  });
};

const searchUsers = async (name: string, limit = 20): Promise<UserSearchResult[]> => {
  const keyword = name.trim();

  if (!keyword) {
    return [];
  }

  const response = await ApiService.get<ApiWrap<UserSearchResult[]> | UserSearchResult[]>(`${API_URL}/search`, {
    name: keyword,
    limit,
  });

  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
};

export const userService = {
  getProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  updateProfile,
  uploadProfileImage,
  uploadCoverImage,
  searchUsers,
  reportUser,
};
