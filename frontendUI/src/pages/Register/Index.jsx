/* 
 * REGISTERVIEW COMPONENT - CUSTOMER REGISTRATION FORM
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';

const RegisterView = () => {
  const navigate = useNavigate();

  // States cho Form Đăng Ký
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Trạng thái xử lý
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(false);

    // Validate mật khẩu tối thiểu 6 ký tự
    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        fullName,
        email,
        phone: phone || null,
        address: address || null,
        password
      };

      const response = await customerService.register(registerData);
      alert(response.message || "Đăng ký tài khoản thành công! Hãy tiến hành đăng nhập.");
      navigate('/login');
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      const msg = err.response?.data?.message || "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Đăng Ký Tài Khoản</h2>
      <div className="form-card" style={{ maxWidth: '480px', margin: '0 auto' }}>

        {errorMessage && (
          <div className="error-alert" style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '10px 15px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập họ và tên của bạn"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

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
            <label>Số điện thoại (SĐT VN)</label>
            <input
              type="tel"
              className="form-input"
              placeholder="09xx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ nhận hàng</label>
            <input
              type="text"
              className="form-input"
              placeholder="Số nhà, tên đường, quận/huyện, tỉnh/thành"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu <span style={{ color: 'red' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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
              'Đăng Ký Ngay'
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
            Đã đăng ký tài khoản?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none' }}
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterView;
