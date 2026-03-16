import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { RegisterProps } from '../types/auth';
import '../styles/auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterProps>({
    email: '',
    password: '',
    fullName: '',
    userName: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
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

  const validate = () => {
    if (!form.fullName?.trim() || !form.userName?.trim() || !form.email.trim() || !form.password.trim()) {
      return 'Vui lòng nhập đầy đủ thông tin';
    }

    if (form.password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (form.password !== confirmPassword) {
      return 'Mật khẩu xác nhận không khớp';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register(form);

      setSuccess(`Tạo tài khoản thành công. Xin chào ${res.fullName || res.userName || 'bạn'}!`);

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại';
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
          <p className="brand-text">
            Tham gia cộng đồng Ducky để chia sẻ khoảnh khắc, kết nối bạn bè và tạo dấu ấn riêng.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Đăng ký</h2>
          <p className="auth-subtitle">Tạo tài khoản mới để bắt đầu với Ducky</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <input type="text" name="fullName" placeholder="Họ và tên" value={form.fullName} onChange={handleChange} />

            <input
              type="text"
              name="userName"
              placeholder="Tên người dùng"
              value={form.userName}
              onChange={handleChange}
            />

            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />

            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
            />

            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <div className="auth-message error">{error}</div>}
            {success && <div className="auth-message success">{success}</div>}

            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>

          <div className="auth-footer-text">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
