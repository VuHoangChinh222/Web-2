import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import customerService from '../../services/customerService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMessage("Không tìm thấy mã token đặt lại mật khẩu hợp lệ.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!token) {
      setErrorMessage("Yêu cầu không hợp lệ. Vui lòng sử dụng liên kết trong email.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu mới phải có tối thiểu 6 ký tự!");
      return;
    }

    setLoading(true);

    try {
      const response = await customerService.resetPassword(token, password);
      setSuccessMessage(response || "Đặt lại mật khẩu thành công!");
      setPassword('');
      setConfirmPassword('');
      // Chờ 2 giây rồi điều hướng về đăng nhập
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error("Lỗi đặt lại mật khẩu:", err);
      const msg = err.response?.data || "Đã xảy ra lỗi khi đặt lại mật khẩu, vui lòng thử lại sau.";
      setErrorMessage(typeof msg === 'string' ? msg : "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-transition" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <h2 className="page-title">Đặt Lại Mật Khẩu</h2>
      <div className="form-card" style={{ maxWidth: '480px', margin: '0 auto' }}>

        {errorMessage && (
          <div className="error-alert" style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '10px 15px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i> {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="success-alert" style={{ background: '#f0fdf4', borderLeft: '4px solid #22c55e', color: '#166534', padding: '10px 15px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i> {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Vui lòng nhập mật khẩu mới của bạn ở ô bên dưới. Mật khẩu mới nên có độ dài tối thiểu là 6 ký tự để bảo mật.
          </p>

          <div className="form-group" style={{ marginBottom: '1.2rem' }}>
            <label>Mật khẩu mới <span style={{ color: 'red' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Nhập mật khẩu mới"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '45px' }}
                disabled={!token}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Xác nhận mật khẩu mới <span style={{ color: 'red' }}>*</span></label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Xác nhận mật khẩu mới"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!token}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading || !token}>
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Đang cập nhật...</>
            ) : (
              'Cập nhật mật khẩu'
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%' }}
              onClick={() => navigate('/login')}
            >
              Quay lại Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
