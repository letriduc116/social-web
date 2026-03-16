export interface LoginProps {
  email: string;
  password: string;
}

export interface RegisterProps {
  email: string;
  password: string;
  fullName?: string;
  userName?: string;
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

export interface AuthUser {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  id?: string;
  email?: string;
  userName?: string;
  fullName?: string;
  role?: string;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: AuthUser;
}
