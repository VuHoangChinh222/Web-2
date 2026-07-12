import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';
import '../../assets/css/ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await customerService.forgotPassword(email);
      // response là chuỗi thông báo từ backend: "Chúng tôi đã gửi link đặt lại mật khẩu vào email của bạn..."
      setSuccessMessage(typeof response === 'string' ? response : (response?.message || "Yêu cầu khôi phục mật khẩu đã được gửi!"));
      setEmail('');
    } catch (err) {
      console.error("Lỗi quên mật khẩu:", err);
      const msg = err.response?.data?.message || "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-transition forgot-password-container">
      <h2 className="page-title">Quên Mật Khẩu</h2>
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
            Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi liên kết khôi phục mật khẩu qua email cho bạn.
          </p>
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

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Đang xử lý...</>
            ) : (
              'Gửi yêu cầu khôi phục'
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

export default ForgotPassword;
