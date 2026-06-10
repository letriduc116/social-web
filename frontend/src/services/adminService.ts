import { ApiService, type ApiResponse } from './api';
import type { LoginProps, AuthResponse } from '../types/auth';
import type {
  AdminCommentListParams,
  AdminCommentResponse,
  AdminListParams,
  AdminPageResponse,
  AdminPostResponse,
  AdminReportListParams,
  AdminReportResponse,
  AdminReportStatsResponse,
  AdminReportStatus,
  AdminRole,
  AdminUserResponse,
} from '../types/admin';

const ADMIN_AUTH_URL = '/v1/admin/auth';
const ADMIN_URL = '/v1/admin';

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
};

const emptyPage = <T>(size = 10): AdminPageResponse<T> => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  size,
  number: 0,
});

const normalizeRole = (role?: string) => String(role || '').toUpperCase();

const login = async (payload: LoginProps): Promise<AuthResponse> => {
  ApiService.clearTokens();

  const response = await ApiService.post<ApiResponse<AuthResponse> | AuthResponse>(`${ADMIN_AUTH_URL}/login`, payload);
  const authData = unwrap(response);
  const role = normalizeRole(authData.role);

  if (role !== 'ADMIN' && role !== 'MANAGER') {
    throw new Error('Tài khoản này không có quyền quản trị hoặc kiểm duyệt');
  }

  if (!authData.accessToken) {
    throw new Error('BE chưa trả về accessToken cho tài khoản quản trị');
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
  const response = await ApiService.put<ApiResponse<AdminUserResponse> | AdminUserResponse>(`${ADMIN_URL}/users/${id}/role`, { role });
  return unwrap(response);
};

const lockUser = async (id: string): Promise<AdminUserResponse | void> => {
  const response = await ApiService.patch<ApiResponse<AdminUserResponse> | AdminUserResponse | void>(`${ADMIN_URL}/users/${id}/lock`);
  return response ? unwrap(response as ApiResponse<AdminUserResponse> | AdminUserResponse) : undefined;
};

const unlockUser = async (id: string): Promise<AdminUserResponse | void> => {
  const response = await ApiService.patch<ApiResponse<AdminUserResponse> | AdminUserResponse | void>(`${ADMIN_URL}/users/${id}/unlock`);
  return response ? unwrap(response as ApiResponse<AdminUserResponse> | AdminUserResponse) : undefined;
};

const deleteUser = async (id: string): Promise<void> => {
  await ApiService.delete<ApiResponse<void> | void>(`${ADMIN_URL}/users/${id}`);
};

const getPosts = async (params: AdminListParams): Promise<AdminPageResponse<AdminPostResponse>> => {
  const response = await ApiService.get<ApiResponse<AdminPageResponse<AdminPostResponse>> | AdminPageResponse<AdminPostResponse>>(
    `${ADMIN_URL}/posts`,
    { keyword: params.keyword || '', page: params.page ?? 0, size: params.size ?? 10 },
  );
  return unwrap(response) || emptyPage<AdminPostResponse>(params.size ?? 10);
};

const hidePost = async (id: string): Promise<AdminPostResponse | void> => {
  const response = await ApiService.patch<ApiResponse<AdminPostResponse> | AdminPostResponse | void>(`${ADMIN_URL}/posts/${id}/hide`);
  return response ? unwrap(response as ApiResponse<AdminPostResponse> | AdminPostResponse) : undefined;
};

const unhidePost = async (id: string): Promise<AdminPostResponse | void> => {
  const response = await ApiService.patch<ApiResponse<AdminPostResponse> | AdminPostResponse | void>(`${ADMIN_URL}/posts/${id}/unhide`);
  return response ? unwrap(response as ApiResponse<AdminPostResponse> | AdminPostResponse) : undefined;
};

const deletePost = async (id: string): Promise<void> => {
  await ApiService.delete<ApiResponse<void> | void>(`${ADMIN_URL}/posts/${id}`);
};

const getComments = async (params: AdminCommentListParams): Promise<AdminPageResponse<AdminCommentResponse>> => {
  const response = await ApiService.get<ApiResponse<AdminPageResponse<AdminCommentResponse>> | AdminPageResponse<AdminCommentResponse>>(
    `${ADMIN_URL}/comments`,
    { postId: params.postId || '', keyword: params.keyword || '', page: params.page ?? 0, size: params.size ?? 10 },
  );
  return unwrap(response) || emptyPage<AdminCommentResponse>(params.size ?? 10);
};

const hideComment = async (id: string): Promise<AdminCommentResponse | void> => {
  const response = await ApiService.patch<ApiResponse<AdminCommentResponse> | AdminCommentResponse | void>(`${ADMIN_URL}/comments/${id}/hide`);
  return response ? unwrap(response as ApiResponse<AdminCommentResponse> | AdminCommentResponse) : undefined;
};

const unhideComment = async (id: string): Promise<AdminCommentResponse | void> => {
  const response = await ApiService.patch<ApiResponse<AdminCommentResponse> | AdminCommentResponse | void>(`${ADMIN_URL}/comments/${id}/unhide`);
  return response ? unwrap(response as ApiResponse<AdminCommentResponse> | AdminCommentResponse) : undefined;
};

const deleteComment = async (id: string): Promise<void> => {
  await ApiService.delete<ApiResponse<void> | void>(`${ADMIN_URL}/comments/${id}`);
};

const normalizeReportParams = (params: AdminReportListParams) => ({
  keyword: params.keyword || '',
  status: params.status && params.status !== 'ALL' ? params.status : '',
  page: params.page ?? 0,
  size: params.size ?? 10,
});

const getReportStats = async (): Promise<AdminReportStatsResponse> => {
  const response = await ApiService.get<ApiResponse<AdminReportStatsResponse> | AdminReportStatsResponse>(`${ADMIN_URL}/reports/stats`);
  return unwrap(response) || {
    totalReports: 0,
    pendingReports: 0,
    reviewingReports: 0,
    resolvedReports: 0,
    rejectedReports: 0,
    userReports: 0,
    postReports: 0,
    commentReports: 0,
  };
};

const getUserReports = async (params: AdminReportListParams): Promise<AdminPageResponse<AdminReportResponse>> => {
  const response = await ApiService.get<ApiResponse<AdminPageResponse<AdminReportResponse>> | AdminPageResponse<AdminReportResponse>>(
    `${ADMIN_URL}/reports/users`,
    normalizeReportParams(params),
  );
  return unwrap(response) || emptyPage<AdminReportResponse>(params.size ?? 10);
};

const getPostReports = async (params: AdminReportListParams): Promise<AdminPageResponse<AdminReportResponse>> => {
  const response = await ApiService.get<ApiResponse<AdminPageResponse<AdminReportResponse>> | AdminPageResponse<AdminReportResponse>>(
    `${ADMIN_URL}/reports/posts`,
    normalizeReportParams(params),
  );
  return unwrap(response) || emptyPage<AdminReportResponse>(params.size ?? 10);
};

const getCommentReports = async (params: AdminReportListParams): Promise<AdminPageResponse<AdminReportResponse>> => {
  const response = await ApiService.get<ApiResponse<AdminPageResponse<AdminReportResponse>> | AdminPageResponse<AdminReportResponse>>(
    `${ADMIN_URL}/reports/comments`,
    normalizeReportParams(params),
  );
  return unwrap(response) || emptyPage<AdminReportResponse>(params.size ?? 10);
};

const getReportDetail = async (id: string): Promise<AdminReportResponse> => {
  const response = await ApiService.get<ApiResponse<AdminReportResponse> | AdminReportResponse>(`${ADMIN_URL}/reports/${id}`);
  return unwrap(response);
};

const updateReportStatus = async (id: string, status: AdminReportStatus, adminNote?: string): Promise<AdminReportResponse> => {
  const response = await ApiService.patch<ApiResponse<AdminReportResponse> | AdminReportResponse>(`${ADMIN_URL}/reports/${id}/status`, { status, adminNote });
  return unwrap(response);
};

const resolveReport = async (id: string): Promise<AdminReportResponse> => {
  const response = await ApiService.patch<ApiResponse<AdminReportResponse> | AdminReportResponse>(`${ADMIN_URL}/reports/${id}/resolve`);
  return unwrap(response);
};

const lockReportedUser = async (id: string): Promise<AdminReportResponse> => {
  const response = await ApiService.patch<ApiResponse<AdminReportResponse> | AdminReportResponse>(`${ADMIN_URL}/reports/${id}/lock-user`);
  return unwrap(response);
};

const unlockReportedUser = async (id: string): Promise<AdminReportResponse> => {
  const response = await ApiService.patch<ApiResponse<AdminReportResponse> | AdminReportResponse>(`${ADMIN_URL}/reports/${id}/unlock-user`);
  return unwrap(response);
};

const hidePostFromReport = async (id: string): Promise<AdminReportResponse> => {
  const response = await ApiService.patch<ApiResponse<AdminReportResponse> | AdminReportResponse>(`${ADMIN_URL}/reports/${id}/hide-post`);
  return unwrap(response);
};

const unhidePostFromReport = async (id: string): Promise<AdminReportResponse> => {
  const response = await ApiService.patch<ApiResponse<AdminReportResponse> | AdminReportResponse>(`${ADMIN_URL}/reports/${id}/unhide-post`);
  return unwrap(response);
};

const hideCommentFromReport = async (id: string): Promise<AdminReportResponse> => {
  const response = await ApiService.patch<ApiResponse<AdminReportResponse> | AdminReportResponse>(`${ADMIN_URL}/reports/${id}/hide-comment`);
  return unwrap(response);
};

const unhideCommentFromReport = async (id: string): Promise<AdminReportResponse> => {
  const response = await ApiService.patch<ApiResponse<AdminReportResponse> | AdminReportResponse>(`${ADMIN_URL}/reports/${id}/unhide-comment`);
  return unwrap(response);
};

export const adminService = {
  login,
  getUsers,
  updateUserRole,
  lockUser,
  unlockUser,
  deleteUser,
  getPosts,
  hidePost,
  unhidePost,
  deletePost,
  getComments,
  hideComment,
  unhideComment,
  deleteComment,
  getReportStats,
  getUserReports,
  getPostReports,
  getCommentReports,
  getReportDetail,
  updateReportStatus,
  resolveReport,
  lockReportedUser,
  unlockReportedUser,
  hidePostFromReport,
  unhidePostFromReport,
  hideCommentFromReport,
  unhideCommentFromReport,
};
