import { getCookie } from '../../utils/cookieHelper';


export const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);


const CartView = ({ cart, updateQty, removeFromCart, navigate }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (cart.length === 0) {
    return (
      <div className="page-container page-transition empty-state">
        <i className="fa-solid fa-cart-shopping"></i>
        <h2 style={{ marginBottom: '1rem' }}>Giỏ hàng trống</h2>
        <p style={{ marginBottom: '2rem' }}>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <button className="btn btn-primary" onClick={() => navigate('home')}>Tiếp tục mua sắm</button>
      </div>
    );
  }

  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Giỏ <span>Hàng</span></h2>
      <div className="cart-container">
        <div className="cart-items">
          {cart.map(item => (
            <div className="cart-item" key={item.cartId}>
              <div className="cart-item-info">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Size: {item.size}</div>
                  <div className="cart-item-price">{formatPrice(item.price)}</div>
                </div>
              </div>
              <div className="cart-item-actions">
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateQty(item.cartId, item.qty - 1)}><i className="fa-solid fa-minus"></i></button>
                  <span style={{ width: '30px', textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.cartId, item.qty + 1)}><i className="fa-solid fa-plus"></i></button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.cartId)} title="Xóa"><i className="fa-solid fa-trash-can"></i></button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Tóm tắt đơn hàng</h3>
          <div className="summary-row"><span>Tạm tính</span><span>{formatPrice(total)}</span></div>
          <div className="summary-row"><span>Phí vận chuyển</span><span>Miễn phí</span></div>
          <div className="summary-total"><span>Tổng cộng</span><span style={{ color: 'var(--accent)' }}>{formatPrice(total)}</span></div>
          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              const customer = getCookie('customer');
              if (!customer) {
                alert("Hệ thống bảo mật: Bạn phải đăng nhập để tiến hành đặt hàng!");
                navigate('login');
              } else {
                navigate('checkout');
              }
            }}
          >
            Tiến hành đặt hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartView;
