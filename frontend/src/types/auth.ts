export interface LoginProps {
  email: string;
  password: string;
}

export interface RegisterProps {
  email: string;
  password: string;
  fullName?: string;
  username?: string;
}

export interface SendOtpProps {
  email: string;
}

export interface VerifyOtpProps {
  email: string;
  otp: string;
}

export interface ResetPasswordProps {
  email: string;
  newPassword: string;
  otp?: string;
}

export interface CheckMailProps {
  email: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: unknown;
}
