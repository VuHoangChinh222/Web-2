/* 
 * CHECKOUTVIEW COMPONENT - SECURE TRANSACTION & DATABASE INTEGRATION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import { getCookie } from '../../utils/cookieHelper';
import orderService from '../../services/orderService';
import '../../assets/css/CheckoutView.css';

const CheckoutView = ({ cart, clearCart, navigate }) => {
  const [customer, setCustomer] = useState(null);

  // States cho Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Trạng thái xử lý
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Kiểm tra đăng nhập bảo mật & nạp dữ liệu từ Cookie
  useEffect(() => {
    const loggedCustomer = getCookie('customer');
    if (!loggedCustomer) {
      alert("Hệ thống bảo mật: Bạn phải đăng nhập để tiến hành đặt hàng!");
      navigate('login');
      return;
    }
    setCustomer(loggedCustomer);

    // Tự động điền (Pre-populate) thông tin khách hàng từ Cookie
    setFullName(loggedCustomer.fullName || '');
    setPhone(loggedCustomer.phone || '');
    setAddress(loggedCustomer.address || '');
  }, [navigate]);

  // 2. Xử lý gửi đơn hàng lên máy chủ Backend để lưu Database
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage("Giỏ hàng của bạn đang trống!");
      return;
    }

    setLoading(true);

    // Chuẩn bị payload khớp cấu trúc CheckoutRequestDto của Backend
    const orderPayload = {
      customerId: customer.id,
      notes: notes.trim() || null,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.qty
      }))
    };

    try {
      const response = await orderService.checkout(orderPayload);
      if (response && response.orderId) {
        alert("Xác nhận đặt hàng thành công! Đang chuyển hướng đến cổng thanh toán.");
        navigate('payment');
      } else {
        setErrorMessage("Không thể tạo đơn hàng, vui lòng kiểm tra lại thông tin.");
      }
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      // Hiển thị trực quan thông báo lỗi từ Backend (ví dụ: Sản phẩm hết hàng trong kho)
      const msg = err.response?.data?.message || "Đã xảy ra lỗi hệ thống trong quá trình xử lý đơn hàng.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Thông tin <span>Giao hàng</span></h2>
      <div className="form-card checkout-form-card">

        {errorMessage && (
          <div className="checkout-error-alert">
            <i className="fa-solid fa-triangle-exclamation checkout-error-icon"></i> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên nhận hàng <span className="checkout-required-star">*</span></label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Nhập họ tên của bạn"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại liên hệ <span className="checkout-required-star">*</span></label>
            <input
              type="tel"
              required
              className="form-input"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ nhận hàng <span className="checkout-required-star">*</span></label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Ghi chú đơn hàng (Tùy chọn)</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Ghi chú về thời gian giao hàng, lời nhắn..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="checkout-actions-row">
            <button type="button" className="btn btn-outline checkout-action-btn" onClick={() => navigate('cart')} disabled={loading}>
              Quay lại giỏ hàng
            </button>
            <button type="submit" className="btn btn-primary checkout-action-btn" disabled={loading}>
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin checkout-spinner-icon"></i> Đang xử lý...</>
              ) : (
                'Xác nhận đặt hàng'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutView;
