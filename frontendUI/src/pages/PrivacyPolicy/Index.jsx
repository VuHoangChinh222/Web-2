/* 
 * PRIVACY POLICY VIEW
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 * Mô tả: Trang thông tin chính sách bảo mật thông tin khách hàng tại Chinh Hoops
 */

import React from 'react';
import '../../assets/css/ReturnPolicyView.css'; // Tái sử dụng cấu trúc style của trang chính sách đổi trả để tối ưu hóa dung lượng CSS

const PrivacyPolicyView = () => {
  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Chính Sách <span>Bảo Mật Thông Tin</span></h2>
      
      <p className="about-text-lead" style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
        <strong>Chinh Hoops</strong> cam kết bảo vệ thông tin riêng tư và dữ liệu cá nhân của quý khách một cách tuyệt đối. 
        Vui lòng đọc bản chính sách bảo mật dưới đây để hiểu rõ hơn về các quyền lợi và cách thức chúng tôi quản lý dữ liệu.
      </p>

      <div className="policy-content-wrapper">
        
        {/* Cột trái: Chi tiết chính sách bảo mật */}
        <div className="policy-main-section">
          
          {/* Card 1: Thu thập dữ liệu */}
          <div className="policy-card">
            <h3 className="policy-card-title">
              <i className="fa-solid fa-database"></i> Thu Thập Thông Tin Cá Nhân
            </h3>
            <ul className="policy-list">
              <li>
                <i className="fa-solid fa-shield-halved"></i>
                <div>
                  <strong>Thông tin đăng ký:</strong> Khi quý khách khởi tạo tài khoản hoặc đặt hàng, chúng tôi sẽ thu thập các thông tin bao gồm: Họ tên, Email, Số điện thoại và Địa chỉ giao nhận hàng.
                </div>
              </li>
              <li>
                <i className="fa-solid fa-shield-halved"></i>
                <div>
                  <strong>Lịch sử truy cập & cookie:</strong> Hệ thống lưu trữ các cookie phiên làm việc để duy trì trạng thái đăng nhập của khách hàng và lưu trữ tạm thời giỏ hàng của quý khách.
                </div>
              </li>
            </ul>
          </div>

          {/* Card 2: Mục đích sử dụng */}
          <div className="policy-card">
            <h3 className="policy-card-title">
              <i className="fa-solid fa-circle-info"></i> Mục Đích Sử Dụng Thông Tin
            </h3>
            <ul className="policy-list">
              <li>
                <i className="fa-solid fa-truck"></i>
                <div>
                  <strong>Xử lý đơn hàng:</strong> Cung cấp thông tin địa chỉ và SĐT cho các đơn vị vận chuyển đối tác để hoàn tất quá trình giao nhận sản phẩm tận tay quý khách.
                </div>
              </li>
              <li>
                <i className="fa-solid fa-envelope-open-text"></i>
                <div>
                  <strong>Hỗ trợ & Chăm sóc:</strong> Gửi thông báo xác nhận đơn đặt hàng thành công, cập nhật hành trình vận đơn hoặc liên hệ hỗ trợ kỹ thuật khi có sự cố giao dịch.
                </div>
              </li>
              <li>
                <i className="fa-solid fa-crown"></i>
                <div>
                  <strong>Cập nhật tích lũy VIP:</strong> Tính toán tổng chi tiêu mua sắm của khách hàng để tự động cập nhật phân cấp hạng VIP (Đồng, Bạc, Vàng, Kim Cương) và áp dụng các khuyến mãi độc quyền.
                </div>
              </li>
            </ul>
          </div>

          {/* Card 3: Cam kết bảo mật dữ liệu */}
          <div className="policy-card">
            <h3 className="policy-card-title">
              <i className="fa-solid fa-user-shield"></i> Cam Kết Bảo Mật Tuyệt Đối
            </h3>
            <ul className="policy-list">
              <li>
                <i className="fa-solid fa-lock"></i>
                <div>
                  <strong>Mã hóa mật khẩu:</strong> Mật khẩu của quý khách được mã hóa băm một chiều an toàn bằng thuật toán <strong>BCrypt</strong> ở phía máy chủ trước khi lưu trữ vào cơ sở dữ liệu SQL Server, ngăn chặn tuyệt đối nguy cơ rò rỉ.
                </div>
              </li>
              <li>
                <i className="fa-solid fa-handshake-slash"></i>
                <div>
                  <strong>Không chia sẻ bên thứ ba:</strong> Chinh Hoops cam kết không mua bán, trao đổi hoặc tiết lộ thông tin cá nhân của khách hàng cho bất kỳ tổ chức hay cá nhân bên thứ ba nào vì mục đích thương mại.
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Cột phải: Quyền lợi & Thông tin liên hệ nhanh */}
        <div className="policy-sidebar">
          
          {/* Card 4: Quyền lợi của khách hàng */}
          <div className="policy-card">
            <h3 className="policy-card-title">
              <i className="fa-solid fa-user-gear"></i> Quyền Của Khách Hàng
            </h3>
            <ul className="policy-list">
              <li>
                <i className="fa-solid fa-check"></i>
                <div>
                  Quý khách có quyền truy cập vào trang cá nhân để tự chỉnh sửa, cập nhật thông tin cá nhân bất kỳ lúc nào.
                </div>
              </li>
              <li>
                <i className="fa-solid fa-check"></i>
                <div>
                  Có quyền yêu cầu bộ phận quản trị hệ thống đóng/xóa vĩnh viễn tài khoản mua hàng và toàn bộ dữ liệu lịch sử liên quan.
                </div>
              </li>
            </ul>
          </div>

          {/* Card 5: Liên hệ phản hồi */}
          <div className="policy-card">
            <h3 className="policy-card-title">
              <i className="fa-solid fa-envelope-shield"></i> Phản Hồi Bảo Mật
            </h3>
            <p className="policy-step-desc" style={{ marginBottom: '1.2rem' }}>
              Mọi thắc mắc hoặc báo cáo về các vấn đề liên quan đến an toàn bảo mật thông tin tại website Chinh Hoops, vui lòng liên hệ:
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

export default PrivacyPolicyView;
