/* 
 * USERINFO COMPONENT - DETAILED PROFILE CARD & PROFILE EDIT FORM
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề WEB 2 & ReactJS
 * Mô tả: Trang chỉnh sửa thông tin cá nhân khách hàng, đồng bộ dữ liệu với API và cập nhật lại Cookie
 */

import React, { useState, useEffect } from 'react';
import { getCookie, setCookie } from '../../utils/cookieHelper';
import customerService from '../../services/customerService';
import IsLoading from '../../components/IsLoading';
import { resolveImageUrl, API_BASE_URL } from '../../config';
import '../../assets/css/UserInfoView.css';

const UserInfo = ({ navigate }) => {
  const [customer, setCustomer] = useState(null);

  // Các states lưu trữ giá trị nhập liệu của form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  // States quản lý trạng thái tải & thông báo lỗi/thành công
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Kiểm tra trạng thái đăng nhập từ cookie khi nạp trang và fetch thông tin mới nhất
  useEffect(() => {
    const loggedCustomer = getCookie('customer');
    if (!loggedCustomer) {
      alert("Hệ thống bảo mật: Vui lòng đăng nhập để xem/sửa thông tin cá nhân!");
      navigate('login');
      return;
    }

    // Gán dữ liệu tạm thời từ cookie trước
    setCustomer(loggedCustomer);
    setFullName(loggedCustomer.fullName || '');
    setEmail(loggedCustomer.email || '');
    setPhone(loggedCustomer.phone || '');
    setAddress(loggedCustomer.address || '');
    setImageUrl(loggedCustomer.imageUrl || '');
    setLoading(true);

    // Tải dữ liệu mới nhất từ CSDL để cập nhật lại
    customerService.getCustomerById(loggedCustomer.id)
      .then(freshCustomer => {
        if (freshCustomer) {
          setCookie('customer', freshCustomer, 7);
          setCustomer(freshCustomer);
          setFullName(freshCustomer.fullName || '');
          setEmail(freshCustomer.email || '');
          setPhone(freshCustomer.phone || '');
          setAddress(freshCustomer.address || '');
          setImageUrl(freshCustomer.imageUrl || '');
        }
      })
      .catch(err => {
        console.error("Lỗi khi đồng bộ thông tin khách hàng mới nhất:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  // 2. Hàm xử lý gửi yêu cầu cập nhật thông tin
  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Kiểm tra ràng buộc họ tên
    if (!fullName.trim()) {
      setErrorMsg("Họ và tên không được để trống!");
      return;
    }

    // Kiểm tra ràng buộc email
    if (!email.trim()) {
      setErrorMsg("Địa chỉ email không được để trống!");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setErrorMsg("Định dạng email không hợp lệ (VD: customer@example.com)!");
      return;
    }

    // Kiểm tra định dạng số điện thoại nếu được cung cấp
    if (phone.trim() && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone.trim())) {
      setErrorMsg("Số điện thoại Việt Nam không đúng định dạng (VD: 0393807472)!");
      return;
    }

    // Kiểm tra mật khẩu mới nếu người dùng điền vào
    if (password) {
      if (password.length < 6) {
        setErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự!");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Mật khẩu xác nhận không khớp!");
        return;
      }
    }

    setSaving(true);
    try {
      // Gọi API gửi yêu cầu PUT tới backend
      const response = await customerService.updateCustomer(customer.id, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        imageUrl: imageUrl || null,
        password: password || null
      });

      if (response && response.id) {
        // Cập nhật lại cookie lưu trữ phiên làm việc của khách hàng với thời hạn 7 ngày
        setCookie('customer', response, 7);
        alert("Cập nhật thông tin tài khoản thành công!");
        navigate('user');
        window.location.reload(); // Tải lại trang để đồng bộ họ tên mới trên Header chào mừng
      } else {
        setErrorMsg(response?.message || "Cập nhật thất bại. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi cập nhật tài khoản:", err);
      setErrorMsg(err.response?.data?.message || "Đã xảy ra lỗi khi kết nối với máy chủ!");
    } finally {
      setSaving(false);
    }
  };

  // Hiển thị vòng xoay đang tải khi load dữ liệu ban đầu
  if (loading) {
    return (
      <div className="page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IsLoading message="Đang tải thông tin tài khoản..." />
      </div>
    );
  }

  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Thông tin <span>Tài khoản</span></h2>

      <div className="user-info-card">
        <form onSubmit={handleUpdate}>
          {/* Vùng hiển thị lỗi khi gửi dữ liệu không hợp lệ */}
          {errorMsg && (
            <div className="error-message" style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-circle-exclamation"></i> {errorMsg}
            </div>
          )}

          {/* Ảnh đại diện */}
          <div className="user-info-form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <label style={{ alignSelf: 'flex-start' }}>Ảnh đại diện</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
              <div className="user-profile-avatar-circle" style={{ margin: 0, flexShrink: 0 }}>
                {imageUrl ? (
                  <img
                    src={resolveImageUrl(imageUrl)}
                    alt="Avatar Preview"
                    className="user-profile-avatar-img"
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

          {/* Trường Email */}
          <div className="user-info-form-group">
            <label>Địa chỉ Email <span>*</span></label>
            <input
              type="email"
              className="user-info-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email của bạn"
              required
            />
          </div>

          {/* Trường Họ tên */}
          <div className="user-info-form-group">
            <label>Họ và tên <span>*</span></label>
            <input
              type="text"
              className="user-info-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên đầy đủ"
              required
            />
          </div>

          {/* Trường Số điện thoại */}
          <div className="user-info-form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              className="user-info-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại (10 số)"
            />
          </div>

          {/* Trường Địa chỉ */}
          <div className="user-info-form-group">
            <label>Địa chỉ nhận hàng</label>
            <input
              type="text"
              className="user-info-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập số nhà, tên đường, quận/huyện, tỉnh/thành phố"
            />
          </div>

          {/* Trường Mật khẩu mới */}
          <div className="user-info-form-group" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <label>Mật khẩu mới (Bỏ trống nếu không muốn đổi)</label>
            <input
              type="password"
              className="user-info-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            />
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="user-info-form-group">
            <label>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              className="user-info-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới để xác nhận"
            />
          </div>

          {/* Hàng nút bấm gửi form / hủy quay lại */}
          <div className="user-info-btn-row">
            <button
              type="submit"
              className="user-info-btn-save"
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi
                </>
              )}
            </button>
            <button
              type="button"
              className="user-info-btn-cancel"
              onClick={() => navigate('user')}
              disabled={saving}
            >
              <i className="fa-solid fa-arrow-left"></i> Quay lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfo;
