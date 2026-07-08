/* 
 * RETURN POLICY VIEW
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề WEB 2 & ReactJS
 * Mô tả: Trang hiển thị chính sách đổi trả hàng chi tiết cho khách hàng mua sắm tại Chinh Hoops
 */

import React from 'react';
import '../../assets/css/ReturnPolicyView.css';

const ReturnPolicyView = () => {
  return (
    <div className="page-container page-transition">
      {/* Tiêu đề trang nổi bật dạng chữ chuyển màu đặc trưng */}
      <h2 className="page-title">Chính Sách <span>Đổi Trả Hàng</span></h2>

      {/* Dòng chữ dẫn nhập giới thiệu */}
      <p className="about-text-lead" style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
        Tại <strong>Chinh Hoops</strong>, chúng tôi luôn trân trọng sự tin tưởng và đặt sự hài lòng của khách hàng lên hàng đầu.
        Chính sách đổi trả hàng dưới đây được thiết kế linh hoạt nhằm đảm bảo tối đa quyền lợi cho khách hàng khi mua sắm tại cửa hàng.
      </p>

      <div className="policy-content-wrapper">

        {/* Cột trái: Nội dung chính sách chính */}
        <div className="policy-main-section">

          {/* Card 1: Thời gian và điều kiện */}
          <div className="policy-card">
            <h3 className="policy-card-title">
              <i className="fa-solid fa-clock-rotate-left"></i> Thời Gian & Điều Kiện Đổi Trả
            </h3>
            <ul className="policy-list">
              <li>
                <i className="fa-solid fa-circle-check"></i>
                <div>
                  <strong>Thời gian áp dụng:</strong> Trong vòng <strong>15 ngày</strong> kể từ ngày quý khách nhận được sản phẩm thành công từ dịch vụ vận chuyển.
                </div>
              </li>
              <li>
                <i className="fa-solid fa-circle-check"></i>
                <div>
                  <strong>Tình trạng sản phẩm:</strong> Sản phẩm phải còn mới 100%, chưa qua sử dụng, chưa giặt ủi, không có mùi lạ và còn nguyên tem mác (tag) của Chinh Hoops.
                </div>
              </li>
              <li>
                <i className="fa-solid fa-circle-check"></i>
                <div>
                  <strong>Hóa đơn kèm theo:</strong> Vui lòng giữ lại hóa đơn mua hàng hoặc cung cấp số điện thoại đặt hàng để nhân viên hỗ trợ đối soát nhanh chóng.
                </div>
              </li>
              <li>
                <i className="fa-solid fa-circle-check"></i>
                <div>
                  <strong>Sản phẩm không áp dụng:</strong> Các sản phẩm nằm trong chương trình xả kho thanh lý cuối mùa (từ 50% trở lên) hoặc hàng tặng kèm khuyến mãi.
                </div>
              </li>
            </ul>
          </div>

          {/* Card 2: Quy trình đổi hàng */}
          <div className="policy-card">
            <h3 className="policy-card-title">
              <i className="fa-solid fa-arrows-spin"></i> Quy Trình Đổi Trả Đơn Giản
            </h3>
            <ul className="policy-step-list">
              <li className="policy-step-item">
                <div className="policy-step-number">1</div>
                <div className="policy-step-content">
                  <h4 className="policy-step-title">Liên hệ đăng ký đổi trả</h4>
                  <p className="policy-step-desc">Gọi hotline hoặc nhắn tin trực tiếp qua fanpage Chinh Hoops, cung cấp mã đơn hàng hoặc số điện thoại kèm lý do đổi hàng (ví dụ: chật size, lỗi đường chỉ).</p>
                </div>
              </li>
              <li className="policy-step-item">
                <div className="policy-step-number">2</div>
                <div className="policy-step-content">
                  <h4 className="policy-step-title">Đóng gói sản phẩm</h4>
                  <p className="policy-step-desc">Đặt sản phẩm còn tag nguyên vẹn vào hộp đóng gói ban đầu hoặc hộp carton bảo vệ khác để tránh trầy xước, va đập trong quá trình di chuyển.</p>
                </div>
              </li>
              <li className="policy-step-item">
                <div className="policy-step-number">3</div>
                <div className="policy-step-content">
                  <h4 className="policy-step-title">Gửi hàng về shop</h4>
                  <p className="policy-step-desc">Gửi bưu điện hoặc hãng vận chuyển về địa chỉ của Chinh Hoops. Với khách hàng tại TP.HCM có thể trực tiếp mang qua cửa hàng để đổi ngay lập tức.</p>
                </div>
              </li>
              <li className="policy-step-item">
                <div className="policy-step-number">4</div>
                <div className="policy-step-content">
                  <h4 className="policy-step-title">Nhận sản phẩm mới hoặc hoàn tiền</h4>
                  <p className="policy-step-desc">Sau khi kiểm tra hàng đạt yêu cầu, Chinh Hoops sẽ gửi ngay sản phẩm thay thế miễn phí hoặc hoàn tiền vào số tài khoản của quý khách trong vòng 24h.</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Cột phải: Sidebar hỗ trợ nhanh */}
        <div className="policy-sidebar">

          {/* Card 3: Chi phí đổi trả */}
          <div className="policy-card">
            <h3 className="policy-card-title">
              <i className="fa-solid fa-hand-holding-dollar"></i> Chi Phí Vận Chuyển
            </h3>
            <ul className="policy-list">
              <li>
                <i className="fa-solid fa-truck-ramp-box"></i>
                <div>
                  <strong>Miễn phí 100%:</strong> Khi sản phẩm bị lỗi sản xuất, rách vải, gửi nhầm size hoặc nhầm mẫu mã so với đơn hàng đã đặt. Chinh Hoops chịu toàn bộ phí ship 2 chiều.
                </div>
              </li>
              <li>
                <i className="fa-solid fa-user-gear"></i>
                <div>
                  <strong>Khách hàng tự chi trả:</strong> Khi quý khách đổi hàng vì nhu cầu cá nhân (muốn đổi sang màu khác, đổi size do chọn nhầm). Phí vận chuyển phát sinh sẽ do khách hàng thanh toán.
                </div>
              </li>
            </ul>
          </div>

          {/* Card 4: Thông tin liên hệ nhanh */}
          <div className="policy-card">
            <h3 className="policy-card-title">
              <i className="fa-solid fa-headset"></i> Trung Tâm Hỗ Trợ
            </h3>
            <p className="policy-step-desc" style={{ marginBottom: '1.2rem' }}>
              Nếu quý khách gặp bất kỳ khó khăn nào trong quá trình đổi hàng, vui lòng liên hệ ngay với bộ phận CSKH của Chinh Hoops:
            </p>
            <div className="policy-contact-box">
              <span className="policy-contact-item">
                <i className="fa-solid fa-location-dot"></i>
                Cao Đẳng Công Thương TP.HCM
              </span>
              <a href="tel:0393807472" className="policy-contact-item">
                <i className="fa-solid fa-phone"></i>
                039.380.7472
              </a>
              <a href="mailto:vuhoangchinh222@gmail.com" className="policy-contact-item">
                <i className="fa-solid fa-envelope"></i>
                vuhoangchinh222@gmail.com
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReturnPolicyView;
