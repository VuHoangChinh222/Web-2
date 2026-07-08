/* 
 * ORDERSUMMARY COMPONENT
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề WEB 2 & ReactJS
 */

const OrderSummary = ({ cart }) => {
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';

  const totalProducts = cart.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * (parseInt(item.qty) || 0), 0);

  return (
    <div className="form-card checkout-summary-card">
      <h3 className="checkout-summary-title">
        Tóm tắt đơn hàng ({totalProducts} sản phẩm)
      </h3>

      <div className="checkout-items-list">
        {cart.map(item => (
          <div key={item.cartId} className="checkout-summary-item">
            <div className="checkout-item-meta">
              <img
                src={item.image}
                alt={item.name}
                className="checkout-item-thumbnail"
              />
              <div>
                <h4 className="checkout-item-title">{item.name}</h4>
                <span className="checkout-item-details-text">
                  Size: {item.size} &nbsp;&bull;&nbsp; Số lượng: {item.qty}
                </span>
              </div>
            </div>
            <div className="checkout-item-subtotal">
              {formatPrice(item.price * (parseInt(item.qty) || 0))}
            </div>
          </div>
        ))}
      </div>

      <div className="checkout-summary-price-breakdown">
        <div className="checkout-price-row">
          <span>Tạm tính</span>
          <span className="checkout-price-value">
            {formatPrice(totalAmount)}
          </span>
        </div>
        <div className="checkout-price-row">
          <span>Phí vận chuyển</span>
          <span className="checkout-shipping-free">Miễn phí</span>
        </div>
        <div className="checkout-total-row">
          <span>Tổng thanh toán</span>
          <span className="checkout-total-value">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
