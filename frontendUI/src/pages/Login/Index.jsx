import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';
import { setCookie } from '../../utils/cookieHelper';

const LoginView = () => {
  const navigate = useNavigate();

  // States cho Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Trạng thái xử lý
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // LUỒNG ĐĂNG NHẬP
      const response = await customerService.login(email, password);
      if (response && response.customer) {
        // Bảo mật phiên làm việc bằng Cookie lưu trữ 2 ngày (48 tiếng)
        setCookie('customer', response.customer, 2);
        alert("Đăng nhập tài khoản thành công!");
        navigate('/user');
        window.location.reload(); // Reload để đồng bộ lại trạng thái header
      } else {
        setErrorMessage("Đăng nhập không thành công, vui lòng kiểm tra lại.");
      }
    } catch (err) {
      console.error("Lỗi xác thực:", err);
      const msg = err.response?.data?.message || "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Đăng Nhập</h2>
      <div className="form-card" style={{ maxWidth: '480px', margin: '0 auto' }}>

        {errorMessage && (
          <div className="error-alert" style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '10px 15px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Địa chỉ Email <span style={{ color: 'red' }}>*</span></label>
            <input
              type="email"
              className="form-input"
              placeholder="example@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu <span style={{ color: 'red' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Nhập mật khẩu"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '45px' }}
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

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Đang xử lý...</>
            ) : (
              'Đăng Nhập'
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
            Chưa có tài khoản khách hàng?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none' }}
            >
              Đăng ký ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
