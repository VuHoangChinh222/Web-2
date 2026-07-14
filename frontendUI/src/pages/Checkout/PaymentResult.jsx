import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import '../../assets/css/checkoutCSS/PaymentResult.css';

const PaymentResult = ({ navigate, clearCart }) => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [orderInfo, setOrderInfo] = useState({ orderCode: '', amount: 0 });

  useEffect(() => {
    const verifyPayment = async () => {
      const gateway = searchParams.get('gateway');
      
      // Chuyển đổi searchParams thành Object phẳng
      const params = {};
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }

      if (gateway === 'vnpay') {
        try {
          const res = await paymentService.verifyVnPayReturn(params);
          if (res && res.success) {
            setStatus('success');
            setMessage(res.message || 'Thanh toán đơn hàng thành công!');
            setOrderInfo({
              orderCode: res.orderCode || params['vnp_TxnRef'] || 'N/A',
              amount: res.amount ? Number(res.amount) : (Number(params['vnp_Amount']) / 100)
            });
            // Dọn dẹp giỏ hàng và thông tin tạm khi thanh toán thành công
            clearCart();
            sessionStorage.removeItem('checkout_shipping_info');
          } else {
            setStatus('error');
            setMessage(res?.message || 'Giao dịch thanh toán thất bại hoặc chữ ký không hợp lệ.');
            setOrderInfo({
              orderCode: res?.orderCode || params['vnp_TxnRef'] || 'N/A',
              amount: Number(params['vnp_Amount']) / 100 || 0
            });
          }
        } catch (err) {
          console.error("Lỗi đối soát kết quả VNPay:", err);
          setStatus('error');
          setMessage('Đã xảy ra lỗi khi kết nối đối soát giao dịch với máy chủ.');
        }
      } else if (gateway === 'momo') {
        try {
          const res = await paymentService.verifyMomoReturn(params);
          if (res && res.success) {
            setStatus('success');
            setMessage(res.message || 'Thanh toán đơn hàng qua MoMo thành công!');
            setOrderInfo({
              orderCode: res.orderCode || params['orderId'] || 'N/A',
              amount: res.amount ? Number(res.amount) : Number(params['amount'] || 0)
            });
            // Dọn dẹp giỏ hàng và thông tin tạm khi thanh toán thành công
            clearCart();
            sessionStorage.removeItem('checkout_shipping_info');
          } else {
            setStatus('error');
            setMessage(res?.message || 'Giao dịch thanh toán MoMo thất bại hoặc chữ ký không hợp lệ.');
            setOrderInfo({
              orderCode: res?.orderCode || params['orderId'] || 'N/A',
              amount: Number(params['amount'] || 0)
            });
          }
        } catch (err) {
          console.error("Lỗi đối soát kết quả MoMo:", err);
          setStatus('error');
          setMessage('Đã xảy ra lỗi khi kết nối đối soát giao dịch MoMo với máy chủ.');
        }
      } else {
        setStatus('error');
        setMessage('Không xác định được cổng thanh toán tương ứng.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="payment-result-container page-transition">
      <div className="payment-result-card">
        {status === 'loading' && (
          <div>
            <div className="status-icon-wrapper loading">
              <i className="fa-solid fa-spinner fa-spin"></i>
            </div>
            <h3 className="result-title">Đang xác thực giao dịch...</h3>
            <p className="result-message">Hệ thống đang tiến hành đối soát bảo mật và cập nhật trạng thái đơn hàng. Vui lòng không đóng trình duyệt hoặc tải lại trang.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="status-icon-wrapper success">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="result-title" style={{ color: '#10b981' }}>Thanh toán thành công!</h3>
            <p className="result-message">{message}</p>

            <div className="details-table">
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng</span>
                <span className="detail-value">{orderInfo.orderCode}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tổng thanh toán</span>
                <span className="detail-value amount">{formatVND(orderInfo.amount)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phương thức</span>
                <span className="detail-value">VNPay Sandbox</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trạng thái đơn</span>
                <span className="detail-value" style={{ color: '#10b981' }}>Đã xác nhận thanh toán</span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-home" onClick={() => navigate('home')}>Quay lại trang chủ</button>
              <button className="btn-orders" onClick={() => navigate('user')}>Lịch sử mua hàng</button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="status-icon-wrapper error">
              <i className="fa-solid fa-xmark"></i>
            </div>
            <h3 className="result-title" style={{ color: '#ef4444' }}>Thanh toán thất bại</h3>
            <p className="result-message">{message}</p>

            <div className="details-table">
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng</span>
                <span className="detail-value">{orderInfo.orderCode}</span>
              </div>
              {orderInfo.amount > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Số tiền giao dịch</span>
                  <span className="detail-value" style={{ textDecoration: 'line-through' }}>{formatVND(orderInfo.amount)}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Trạng thái thanh toán</span>
                <span className="detail-value" style={{ color: '#ef4444' }}>Chưa thanh toán</span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-home" onClick={() => navigate('checkout')}>Thử lại</button>
              <button className="btn-orders" onClick={() => navigate('home')}>Quay lại trang chủ</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
