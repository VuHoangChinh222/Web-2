import { useState } from 'react';

const PaymentView = ({ navigate, clearCart }) => {
  const [method, setMethod] = useState('cod');

  const handlePayment = () => {
    alert("Thanh toán thành công! Cảm ơn bạn đã mua hàng tại Chinh Hoops.");
    clearCart();
    navigate('home');
  };

  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Phương thức <span>Thanh toán</span></h2>
      <div className="form-card">
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
          <div className="form-group" style={{animation: 'fadeIn 0.3s'}}>
            <label>Số thẻ</label>
            <input type="text" className="form-input" placeholder="0000 0000 0000 0000" />
            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
              <input type="text" className="form-input" placeholder="MM/YY" />
              <input type="text" className="form-input" placeholder="CVV" />
            </div>
          </div>
        )}

        <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
          <button className="btn btn-outline" style={{flex: 1}} onClick={() => navigate('checkout')}>Quay lại</button>
          <button className="btn btn-primary" style={{flex: 1}} onClick={handlePayment}>Xác nhận & Thanh toán</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentView;
