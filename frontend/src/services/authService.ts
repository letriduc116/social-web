import { ApiService, type ApiResponse } from './api';

import type {
  AuthResponse,
  CheckMailProps,
  LoginProps,
  RegisterProps,
  ResetPasswordProps,
  SendOtpProps,
  VerifyOtpProps,
} from '../types/auth';

const API_URL = '/v1/auth';

const unwrapAuth = (response: ApiResponse<AuthResponse> | AuthResponse): AuthResponse => {
  if (response && typeof response === 'object' && 'data' in response && response.data !== undefined) {
    return response.data as AuthResponse;
  }

  return response as AuthResponse;
};

const login = async (data: LoginProps): Promise<AuthResponse> => {
  const response = await ApiService.post<ApiResponse<AuthResponse> | AuthResponse>(`${API_URL}/login`, data);

  const authData = unwrapAuth(response);

  if (authData.accessToken) {
    ApiService.setTokens(authData.accessToken, authData.refreshToken);
  }

  return authData;
};

const register = async (data: RegisterProps): Promise<AuthResponse> => {
  const response = await ApiService.post<ApiResponse<AuthResponse> | AuthResponse>(`${API_URL}/register`, data);

  const authData = unwrapAuth(response);

  if (authData.accessToken) {
    ApiService.setTokens(authData.accessToken, authData.refreshToken);
  }

  return authData;
};

const checkMail = async (data: CheckMailProps) => {
  return ApiService.get<ApiResponse<string>>(`${API_URL}/check-email`, data);
};

const sendOtp = async (data: SendOtpProps) => {
  return ApiService.post<ApiResponse<string>>(`${API_URL}/send-otp`, data);
};

const verifyOtp = async (data: VerifyOtpProps) => {
  return ApiService.post<ApiResponse<void>>(`${API_URL}/verify-otp`, data);
};

const resetPassword = async (data: ResetPasswordProps) => {
  return ApiService.post<ApiResponse<void>>(`${API_URL}/reset-password`, data);
};

const logout = (): void => {
  ApiService.clearTokens();
};

export const authService = {
  login,
  register,
  checkMail,
  sendOtp,
  verifyOtp,
  resetPassword,
  logout,
};
