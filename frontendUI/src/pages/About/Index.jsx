/* 
 * ABOUT US PAGE WITH INTEGRATED PROFILE CARD
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ứng dụng lập trình Web 2
 */

import React from 'react';
import ProfileCard from '../../components/ProfileCard';
import '../../assets/css/AboutView.css';

const AboutView = () => (
  <div className="page-container page-transition">
    <h2 className="page-title">Về <span>Chinh Hoops & Tác Giả</span></h2>
    <div className="about-content-wrapper">
      {/* Introduction text */}
      <div className="about-text-column">
        <p className="about-text-lead">
          Được thành lập vào năm 2026, <strong>Chinh Hoops</strong> ra đời với sứ mệnh mang đến cho những người yêu bóng rổ tại Việt Nam những trang bị thi đấu chất lượng nhất, phong cách nhất và hiện đại nhất.
        </p>
        <p className="about-text-para">
          Chúng tôi không chỉ là một cửa hàng bán lẻ, chúng tôi là một phần của cộng đồng bóng rổ. Từ những đôi giày mang công nghệ bứt phá, những bộ quần áo tối ưu hiệu năng đến những phụ kiện nhỏ nhất, tất cả đều được chúng tôi tuyển chọn kỹ lưỡng.
        </p>
        <p className="about-text-para-last">
          Với tầm nhìn trở thành thương hiệu đồ thể thao bóng rổ số 1 Đông Nam Á, Chinh Hoops cam kết 100% hàng chính hãng, dịch vụ chăm sóc khách hàng chuyên nghiệp và luôn đồng hành cùng đam mê của bạn trên mọi mặt sân.
        </p>

        <div className="project-info-box">
          <h4 className="project-info-box-title">
            THÔNG TIN ĐỒ ÁN CHINHCMS
          </h4>
          <p className="project-info-box-desc">
            Dự án này là sản phẩm thực hành Chuyên đề ứng dụng lập trình Web 2 (Java Spring Boot kết hợp ReactJS) của sinh viên Vũ Hoàng Chính.
            Backend cung cấp hệ thống quản trị dữ liệu sản phẩm, đơn hàng và danh mục kết hợp RESTful API mạnh mẽ,
            kết hợp cùng Frontend ReactJS tối ưu trải nghiệm người dùng cuối.
          </p>
        </div>
      </div>

      {/* Showcase Profile Card component */}
      <div className="about-profile-column">
        <ProfileCard />
      </div>
    </div>
  </div>
);

export default AboutView;
