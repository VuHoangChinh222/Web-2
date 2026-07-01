/* 
 * SHIPPINGFORM COMPONENT
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

const ShippingForm = ({
  handleSubmit,
  fullName,
  setFullName,
  phone,
  setPhone,
  address,
  setAddress,
  notes,
  setNotes,
  navigate,
  errorMessage
}) => {
  return (
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
          <button type="button" className="btn btn-outline checkout-action-btn" onClick={() => navigate('cart')}>
            Quay lại giỏ hàng
          </button>
          <button type="submit" className="btn btn-primary checkout-action-btn">
            Xác nhận thanh toán
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingForm;
