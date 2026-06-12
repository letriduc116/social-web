import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/auth.css';

type ForgotStep = 'email' | 'otp' | 'reset' | 'done';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessage = () => {
    setError('');
    setSuccess('');
  };

  const validateEmail = () => {
    if (!email.trim()) return 'Vui lòng nhập email';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Email không hợp lệ';
    return '';
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessage();

    const emailError = validateEmail();
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      setLoading(true);

      await authService.checkMail({ email: email.trim() });
      await authService.sendOtp({ email: email.trim() });

      setSuccess('Mã OTP đã được gửi đến email của bạn');
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessage();

    if (!otp.trim()) {
      setError('Vui lòng nhập mã OTP');
      return;
    }

    if (otp.trim().length !== 6) {
      setError('Mã OTP phải gồm 6 chữ số');
      return;
    }

    try {
      setLoading(true);

      await authService.verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
      });

      setSuccess('Xác thực OTP thành công. Vui lòng đặt mật khẩu mới');
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessage();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Vui lòng nhập đầy đủ mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);

      await authService.resetPassword({
        email: email.trim(),
        newPassword,
      });

      setStep('done');
      setSuccess('Đặt lại mật khẩu thành công. Bạn sẽ được chuyển về trang đăng nhập');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    clearMessage();

    try {
      setLoading(true);
      await authService.sendOtp({ email: email.trim() });
      setSuccess('Mã OTP mới đã được gửi lại');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi lại OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand-wrap">
          <h1 className="brand-logo">Ducky</h1>
          <p className="brand-text">Lấy lại quyền truy cập tài khoản của bạn một cách an toàn và nhanh chóng.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Quên mật khẩu</h2>

          {step === 'email' && (
            <>
              <p className="auth-subtitle">Nhập email tài khoản Ducky của bạn để nhận mã OTP xác thực.</p>

              <form onSubmit={handleSendOtp} className="auth-form">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

                {error && <div className="auth-message error">{error}</div>}
                {success && <div className="auth-message success">{success}</div>}

                <button type="submit" className="auth-btn primary" disabled={loading}>
                  {loading ? 'Đang gửi OTP...' : 'Gửi OTP'}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <p className="auth-subtitle">
                Nhập mã OTP gồm 6 chữ số đã được gửi đến email <b>{email}</b>.
              </p>

              <form onSubmit={handleVerifyOtp} className="auth-form">
                <input type="email" value={email} disabled />

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Nhập mã OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />

                {error && <div className="auth-message error">{error}</div>}
                {success && <div className="auth-message success">{success}</div>}

                <button type="submit" className="auth-btn primary" disabled={loading}>
                  {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                </button>

                <button type="button" className="auth-text-btn" onClick={handleResendOtp} disabled={loading}>
                  Gửi lại mã OTP
                </button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <p className="auth-subtitle">
                OTP đã được xác thực. Vui lòng tạo mật khẩu mới cho tài khoản <b>{email}</b>.
              </p>

              <form onSubmit={handleResetPassword} className="auth-form">
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && <div className="auth-message error">{error}</div>}
                {success && <div className="auth-message success">{success}</div>}

                <button type="submit" className="auth-btn primary" disabled={loading}>
                  {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <>
              <p className="auth-subtitle">Mật khẩu của bạn đã được cập nhật thành công.</p>

              {success && <div className="auth-message success">{success}</div>}

              <button
                type="button"
                className="auth-btn primary auth-full-btn"
                onClick={() => navigate('/login', { replace: true })}
              >
                Quay về đăng nhập
              </button>
            </>
          )}

          <div className="auth-footer-text">
            Nhớ mật khẩu rồi? <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
