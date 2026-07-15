/* 
 * REGISTERVIEW COMPONENT - CUSTOMER REGISTRATION FORM
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề WEB 2 & ReactJS
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../config';
import customerService from '../../services/customerService';
import { getCookie } from '../../utils/cookieHelper';
import { resolveImageUrl } from '../../config';

const RegisterView = () => {
  const navigate = useNavigate();
  // Kiểm tra nếu đã đăng nhập thì tự động điều hướng sang trang sản phẩm
  useEffect(() => {
    const customer = getCookie('customer');
    if (customer) {
      navigate('/products');
    }
  }, [navigate]);

  // States cho Form Đăng Ký
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Trạng thái xử lý
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch(`${API_BASE_URL}/uploads/image`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Upload thất bại');
        }
        const url = await response.text();
        setImageUrl(url);
      } catch (err) {
        alert("Lỗi tải lên hình ảnh: " + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(false);

    // Validate mật khẩu tối thiểu 6 ký tự
    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }

    // Validate mật khẩu nhập lại phải khớp
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        fullName,
        email,
        phone: phone || null,
        imageUrl: imageUrl || null,
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

          {/* Ảnh đại diện */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <label style={{ alignSelf: 'flex-start' }}>Ảnh đại diện</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: '800',
                boxShadow: '0 5px 15px var(--accent-neon)',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {imageUrl ? (
                  <img
                    src={resolveImageUrl(imageUrl)}
                    alt="Avatar Preview"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  fullName ? fullName.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-color)',
                    cursor: 'pointer'
                  }}
                />
                <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Hỗ trợ tải lên ảnh đại diện cá nhân.</small>
              </div>
            </div>
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

          <div className="form-group">
            <label>Nhập lại mật khẩu <span style={{ color: 'red' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Nhập lại mật khẩu"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
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
