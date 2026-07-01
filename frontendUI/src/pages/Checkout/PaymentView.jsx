import { useState } from 'react';
import { getCookie } from '../../utils/cookieHelper';
import orderService from '../../services/orderService';

const PaymentView = ({ navigate, clearCart, cart }) => {
  const [method, setMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayment = async () => {
    setErrorMessage('');

    // 1. Kiểm tra giỏ hàng
    if (!cart || cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      navigate('cart');
      return;
    }

    // 2. Lấy thông tin giao hàng tạm thời lưu ở Checkout
    const shippingDataStr = sessionStorage.getItem('checkout_shipping_info');
    if (!shippingDataStr) {
      alert("Thiếu thông tin giao hàng! Vui lòng quay lại trang Đặt hàng để điền thông tin.");
      navigate('checkout');
      return;
    }

    // 3. Lấy thông tin khách hàng từ Cookie
    const customer = getCookie('customer');
    if (!customer) {
      alert("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!");
      navigate('login');
      return;
    }

    let shippingData;
    try {
      shippingData = JSON.parse(shippingDataStr);
    } catch (e) {
      console.error("Lỗi parse checkout_shipping_info:", e);
      alert("Thông tin giao hàng không hợp lệ. Vui lòng thử lại!");
      navigate('checkout');
      return;
    }

    setLoading(true);

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * (parseInt(item.qty) || 0)), 0);

    // 4. Chuẩn bị dữ liệu gửi lên Backend
    const orderPayload = {
      customerId: customer.id,
      recipientName: shippingData.fullName,
      recipientPhone: shippingData.phone,
      shippingAddress: shippingData.address,
      totalPrice: totalPrice,
      shippingFee: 0,
      paymentMethod: method.toUpperCase(),
      note: shippingData.notes || null,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.qty,
        size: item.size,
        price: item.price
      }))
    };

    try {
      // Thực hiện gọi API lưu đơn hàng vào CSDL
      const response = await orderService.checkout(orderPayload);
      if (response && (response.id || response.orderId)) {
        // Chỉ khi lưu Database thành công mới xác nhận thanh toán hoàn tất
        alert("Thanh toán & Đặt hàng thành công! Cảm ơn bạn đã mua hàng tại Chinh Hoops.");
        
        // Dọn dẹp giỏ hàng và thông tin tạm
        clearCart();
        sessionStorage.removeItem('checkout_shipping_info');
        
        // Quay về trang chủ
        navigate('home');
      } else {
        setErrorMessage("Không thể tạo đơn hàng. Vui lòng kiểm tra lại kết nối.");
      }
    } catch (err) {
      console.error("Lỗi thanh toán & tạo đơn hàng:", err);
      // Hiển thị trực quan lỗi (ví dụ: hết hàng)
      const msg = err.response?.data?.message || "Đã xảy ra lỗi hệ thống khi xử lý đơn hàng.";
      setErrorMessage(msg);
      alert("Lỗi đặt hàng: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Phương thức <span>Thanh toán</span></h2>
      <div className="form-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        
        {errorMessage && (
          <div className="checkout-error-alert" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#f87171',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {errorMessage}
          </div>
        )}

        <div className="payment-methods">
          <div className={`payment-card ${method === 'cod' ? 'active' : ''}`} onClick={() => setMethod('cod')}>
            <i className="fa-solid fa-truck"></i><span>Thanh toán khi nhận hàng (COD)</span>
          </div>
          <div className={`payment-card ${method === 'vnpay' ? 'active' : ''}`} onClick={() => setMethod('vnpay')}>
            <i className="fa-solid fa-qrcode"></i><span>VNPay</span>
          </div>
          <div className={`payment-card ${method === 'momo' ? 'active' : ''}`} onClick={() => setMethod('momo')}>
            <i className="fa-solid fa-wallet"></i><span>Ví MoMo</span>
          </div>
          <div className={`payment-card ${method === 'credit' ? 'active' : ''}`} onClick={() => setMethod('credit')}>
            <i className="fa-solid fa-credit-card"></i><span>Thẻ Tín Dụng / Ghi Nợ</span>
          </div>
        </div>

        {method === 'credit' && (
          <div className="form-group" style={{ animation: 'fadeIn 0.3s', marginTop: '1.5rem' }}>
            <label>Số thẻ</label>
            <input type="text" className="form-input" placeholder="0000 0000 0000 0000" disabled={loading} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" className="form-input" placeholder="MM/YY" disabled={loading} />
              <input type="text" className="form-input" placeholder="CVV" disabled={loading} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('checkout')} disabled={loading}>Quay lại</button>
          <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handlePayment} disabled={loading}>
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Đang xử lý...</>
            ) : (
              'Xác nhận & Thanh toán'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentView;
