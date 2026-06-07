import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import type { LoginProps } from '../types/auth';
import '../styles/auth.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminLogin = location.pathname.startsWith('/admin');

  const [form, setForm] = useState<LoginProps>({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getRole = (authData: any): string => {
    return String(authData?.role || authData?.user?.role || '').toUpperCase();
  };

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
      const isAdminAccount = role === 'ADMIN';

      if (isAdminLogin && !isAdminAccount) {
        setError('Tài khoản này không có quyền quản trị');
        return;
      }

      setSuccess(`Chào mừng bạn quay lại ${res.fullName || res.userName || (isAdminAccount ? 'Admin' : 'Ducky')}!`);

      setTimeout(() => {
        navigate(isAdminAccount ? '/admin' : '/', { replace: true });
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page ${isAdminLogin ? 'admin-auth-page' : ''}`}>
      <div className="auth-left">
        <div className="brand-wrap">
          {isAdminLogin && <div className="admin-auth-badge">Admin Console</div>}

          <h1 className="brand-logo">Ducky</h1>

          <p className="brand-text">
            {isAdminLogin
              ? 'Quản lý người dùng, bài viết và bình luận trên hệ thống Ducky một cách nhanh gọn, rõ ràng và an toàn.'
              : 'Kết nối, chia sẻ và bắt đầu câu chuyện của bạn theo cách nhẹ nhàng hơn.'}
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>{isAdminLogin ? 'Đăng nhập quản trị' : 'Đăng nhập'}</h2>

          <p className="auth-subtitle">
            {isAdminLogin
              ? 'Sử dụng tài khoản có quyền ADMIN để truy cập trang quản trị'
              : 'Đăng nhập vào tài khoản Ducky của bạn'}
          </p>

          {isAdminLogin && (
            <div className="admin-auth-note">Tài khoản người dùng thường sẽ không thể truy cập khu vực quản trị.</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />

            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
            />

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

              <Link to="/register" className="auth-btn secondary link-btn">
                Tạo tài khoản mới
              </Link>
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
