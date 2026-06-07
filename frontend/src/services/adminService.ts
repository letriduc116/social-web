import { ApiService, type ApiResponse } from './api';
import type { LoginProps, AuthResponse } from '../types/auth';
import type {
  AdminCommentListParams,
  AdminCommentResponse,
  AdminListParams,
  AdminPageResponse,
  AdminPostResponse,
  AdminRole,
  AdminUserResponse,
} from '../types/admin';

const ADMIN_AUTH_URL = '/v1/admin/auth';
const ADMIN_URL = '/v1/admin';

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }

  return response as T;
};

const login = async (payload: LoginProps): Promise<AuthResponse> => {
  ApiService.clearTokens();

  const response = await ApiService.post<ApiResponse<AuthResponse> | AuthResponse>(`${ADMIN_AUTH_URL}/login`, payload);

  const authData = unwrap(response);
  const role = String(authData.role || '').toUpperCase();

  if (role !== 'ADMIN') {
    throw new Error('Tài khoản này không có quyền quản trị');
  }

  if (!authData.accessToken) {
    throw new Error('BE chưa trả về accessToken cho tài khoản admin');
  }

  ApiService.setTokens(authData.accessToken);
  localStorage.setItem('user', JSON.stringify(authData));

  return authData;
};

const getUsers = async (): Promise<AdminUserResponse[]> => {
  const response = await ApiService.get<ApiResponse<AdminUserResponse[]> | AdminUserResponse[]>(`${ADMIN_URL}/users`);
  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
};

const updateUserRole = async (id: string, role: AdminRole): Promise<AdminUserResponse> => {
  const response = await ApiService.put<ApiResponse<AdminUserResponse> | AdminUserResponse>(
    `${ADMIN_URL}/users/${id}/role`,
    { role },
  );

  return unwrap(response);
};

const deleteUser = async (id: string): Promise<void> => {
  await ApiService.delete<ApiResponse<void> | void>(`${ADMIN_URL}/users/${id}`);
};

const getPosts = async (params: AdminListParams): Promise<AdminPageResponse<AdminPostResponse>> => {
  const response = await ApiService.get<ApiResponse<AdminPageResponse<AdminPostResponse>> | AdminPageResponse<AdminPostResponse>>(
    `${ADMIN_URL}/posts`,
    {
      keyword: params.keyword || '',
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  );

  return unwrap(response);
};

const deletePost = async (id: string): Promise<void> => {
  await ApiService.delete<ApiResponse<void> | void>(`${ADMIN_URL}/posts/${id}`);
};

const getComments = async (params: AdminCommentListParams): Promise<AdminPageResponse<AdminCommentResponse>> => {
  const response = await ApiService.get<
    ApiResponse<AdminPageResponse<AdminCommentResponse>> | AdminPageResponse<AdminCommentResponse>
  >(`${ADMIN_URL}/comments`, {
    postId: params.postId || '',
    keyword: params.keyword || '',
    page: params.page ?? 0,
    size: params.size ?? 10,
  });

  return unwrap(response);
};

const deleteComment = async (id: string): Promise<void> => {
  await ApiService.delete<ApiResponse<void> | void>(`${ADMIN_URL}/comments/${id}`);
};

export const adminService = {
  login,
  getUsers,
  updateUserRole,
  deleteUser,
  getPosts,
  deletePost,
  getComments,
  deleteComment,
};
