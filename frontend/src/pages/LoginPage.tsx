import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import type { LoginProps } from '../types/auth';
import '../styles/auth.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname.startsWith('/admin');

  const [form, setForm] = useState<LoginProps>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getRole = (authData: any): string => String(authData?.role || authData?.user?.role || '').toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      const res = isAdminLogin ? await adminService.login(form) : await authService.login(form);
      const role = getRole(res);
      const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';

      if (isAdminLogin && !isAdminOrManager) {
        setError('Tài khoản này không có quyền quản trị hoặc kiểm duyệt');
        return;
      }

      setSuccess(
        `Chào mừng bạn quay lại ${res.fullName || res.userName || (role === 'MANAGER' ? 'Manager' : 'Ducky')}!`,
      );
      setTimeout(() => {
        if (isAdminLogin || isAdminOrManager) {
          navigate(role === 'MANAGER' ? '/admin?tab=reportedUsers' : '/admin', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    setSuccess('');

    const credential = credentialResponse.credential;

    if (!credential) {
      setError('Không lấy được thông tin đăng nhập từ Google');
      return;
    }

    try {
      setLoading(true);

      const res = await authService.loginWithGoogle({ credential });
      const role = getRole(res);
      const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';

      setSuccess(`Chào mừng bạn ${res.fullName || res.userName || 'Ducky'}!`);

      setTimeout(() => {
        if (isAdminOrManager) {
          navigate(role === 'MANAGER' ? '/admin?tab=reportedUsers' : '/admin', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Đăng nhập Google thất bại hoặc đã bị huỷ');
  };

  return (
    <div className={`auth-page ${isAdminLogin ? 'admin-auth-page' : ''}`}>
      <div className="auth-left">
        <div className="brand-wrap">
          {isAdminLogin && <div className="admin-auth-badge">Admin / Manager Console</div>}
          <h1 className="brand-logo">Ducky</h1>
          <p className="brand-text">
            {isAdminLogin
              ? 'Không gian quản trị và kiểm duyệt báo cáo vi phạm trên hệ thống Ducky.'
              : 'Kết nối, chia sẻ và bắt đầu câu chuyện của bạn theo cách nhẹ nhàng hơn.'}
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>{isAdminLogin ? 'Đăng nhập quản trị' : 'Đăng nhập'}</h2>
          <p className="auth-subtitle">
            {isAdminLogin
              ? 'Sử dụng tài khoản ADMIN hoặc MANAGER để truy cập khu vực quản trị'
              : 'Đăng nhập vào tài khoản Ducky của bạn'}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
            />
            {!isAdminLogin && (
              <div className="auth-help-row">
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </div>
            )}

            {error && <div className="auth-message error">{error}</div>}
            {success && <div className="auth-message success">{success}</div>}
            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : isAdminLogin ? 'Đăng nhập quản trị' : 'Đăng nhập'}
            </button>
          </form>

          {!isAdminLogin ? (
            <>
              <div className="auth-divider">
                <span>hoặc</span>
              </div>

              <div className="auth-social-actions">
                <div className="google-login-wrap">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    shape="pill"
                    text="signin_with"
                    width="366"
                  />
                </div>

                <Link to="/register" className="auth-btn secondary link-btn auth-register-btn">
                  Tạo tài khoản mới
                </Link>
              </div>
            </>
          ) : (
            <div className="auth-footer-text admin-auth-footer">
              Muốn dùng tài khoản thường? <Link to="/login">Quay lại đăng nhập người dùng</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
