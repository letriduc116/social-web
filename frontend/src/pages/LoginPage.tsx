import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { LoginProps } from '../types/auth';
import '../styles/auth.css';

function LoginPage() {
  const navigate = useNavigate();

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
      const res = await authService.login(form);

      setSuccess(`Chào mừng bạn quay lại ${res.fullName || res.userName || 'Ducky'}!`);

      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand-wrap">
          <h1 className="brand-logo">Ducky</h1>
          <p className="brand-text">Kết nối, chia sẻ và bắt đầu câu chuyện của bạn theo cách nhẹ nhàng hơn.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Đăng nhập</h2>
          <p className="auth-subtitle">Đăng nhập vào tài khoản Ducky của bạn</p>

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
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="auth-divider">
            <span>hoặc</span>
          </div>

          <Link to="/register" className="auth-btn secondary link-btn">
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
