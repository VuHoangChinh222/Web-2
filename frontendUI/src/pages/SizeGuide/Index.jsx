/* 
 * SIZE GUIDE VIEW
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 * Mô tả: Trang hướng dẫn chọn size chi tiết cho giày bóng rổ và áo thi đấu tại Chinh Hoops
 */

import React, { useState } from 'react';
import '../../assets/css/SizeGuideView.css';

const SizeGuideView = () => {
  // Quản lý trạng thái tab hiện tại ('shoes' là giày, 'apparel' là quần áo)
  const [activeTab, setActiveTab] = useState('shoes');

  // Bảng kích cỡ giày chuẩn của Nike / Jordan
  const shoeSizes = [
    { us: '7', uk: '6', eu: '40', cm: '25' },
    { us: '7.5', uk: '6.5', eu: '40.5', cm: '25.5' },
    { us: '8', uk: '7', eu: '41', cm: '26' },
    { us: '8.5', uk: '7.5', eu: '42', cm: '26.5' },
    { us: '9', uk: '8', eu: '42.5', cm: '27' },
    { us: '9.5', uk: '8.5', eu: '43', cm: '27.5' },
    { us: '10', uk: '9', eu: '44', cm: '28' },
    { us: '10.5', uk: '9.5', eu: '44.5', cm: '28.5' },
    { us: '11', uk: '10', eu: '45', cm: '29' },
    { us: '11.5', uk: '10.5', eu: '45.5', cm: '29.5' },
    { us: '12', uk: '11', eu: '46', cm: '30' }
  ];

  // Bảng kích cỡ quần áo thi đấu dựa trên chiều cao cân nặng
  const apparelSizes = [
    { size: 'S', height: '160 - 168 cm', weight: '50 - 60 kg', chest: '88 - 92 cm' },
    { size: 'M', height: '168 - 175 cm', weight: '60 - 70 kg', chest: '92 - 96 cm' },
    { size: 'L', height: '175 - 180 cm', weight: '70 - 80 kg', chest: '96 - 100 cm' },
    { size: 'XL', height: '180 - 185 cm', weight: '80 - 90 kg', chest: '100 - 104 cm' },
    { size: 'XXL', height: '185 - 192 cm', weight: '90 - 100 kg', chest: '104 - 110 cm' }
  ];

  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Hướng Dẫn <span>Chọn Size Trang Phục</span></h2>
      
      <p className="about-text-lead" style={{ textAlign: 'center', marginBottom: '2rem', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
        Để sở hữu những bộ quần áo thi đấu vừa vặn hay những đôi giày bóng rổ ôm chân hỗ trợ tốt nhất trên sân đấu, 
        quý khách vui lòng tham khảo bảng kích cỡ chuẩn dưới đây của <strong>Chinh Hoops</strong>.
      </p>

      {/* Bộ chọn Tab để chuyển đổi nhanh giữa 2 bảng kích cỡ */}
      <div className="size-guide-tabs">
        <button 
          className={`size-tab-btn ${activeTab === 'shoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('shoes')}
        >
          <i className="fa-solid fa-shoe-prints" style={{ marginRight: '8px' }}></i> Bảng Size Giày
        </button>
        <button 
          className={`size-tab-btn ${activeTab === 'apparel' ? 'active' : ''}`}
          onClick={() => setActiveTab('apparel')}
        >
          <i className="fa-solid fa-shirt" style={{ marginRight: '8px' }}></i> Bảng Size Quần Áo
        </button>
      </div>

      {/* Bảng hiển thị thông số kích thước chi tiết */}
      <div className="size-table-container">
        {activeTab === 'shoes' ? (
          <table className="size-table">
            <thead>
              <tr>
                <th>SIZE US</th>
                <th>SIZE UK</th>
                <th>SIZE EU (Việt Nam)</th>
                <th>CHIỀU DÀI CHÂN (CM)</th>
              </tr>
            </thead>
            <tbody>
              {shoeSizes.map((s, idx) => (
                <tr key={idx}>
                  <td><strong>{s.us}</strong></td>
                  <td>{s.uk}</td>
                  <td><strong>{s.eu}</strong></td>
                  <td>{s.cm} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="size-table">
            <thead>
              <tr>
                <th>KÍCH CỠ</th>
                <th>CHIỀU CAO PHÙ HỢP</th>
                <th>CÂN NẶNG PHÙ HỢP</th>
                <th>VÒNG NGỰC KHUYẾN NGHỊ</th>
              </tr>
            </thead>
            <tbody>
              {apparelSizes.map((a, idx) => (
                <tr key={idx}>
                  <td><strong>{a.size}</strong></td>
                  <td>{a.height}</td>
                  <td><strong>{a.weight}</strong></td>
                  <td>{a.chest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Grid hướng dẫn đo kích thước thực tế tại nhà */}
      <div className="measure-instruction-grid">
        
        {/* Hướng dẫn cách đo chiều dài chân để chọn size giày */}
        <div className="instruction-card">
          <h3 className="instruction-title">
            <i className="fa-solid fa-ruler-horizontal"></i> Cách Đo Chiều Dài Bàn Chân
          </h3>
          <ul className="instruction-steps">
            <li>
              <span>1</span>
              <div>
                <strong>Chuẩn bị dụng cụ:</strong> Đặt 1 tờ giấy trắng khổ A4 sát mép tường. Chuẩn bị bút và thước kẻ.
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Đặt chân lên giấy:</strong> Đứng thẳng, đặt gót chân chạm sát bức tường.
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Đánh dấu điểm dài nhất:</strong> Dùng bút chấm một điểm tại ngón chân dài nhất (thường là ngón cái hoặc ngón trỏ).
              </div>
            </li>
            <li>
              <span>4</span>
              <div>
                <strong>Đo khoảng cách:</strong> Đo khoảng cách từ vạch tường đến điểm đã chấm và đối chiếu với cột <strong>Chiều dài chân (CM)</strong> của bảng size giày.
              </div>
            </li>
          </ul>
        </div>

        {/* Hướng dẫn cách đo kích thước cơ thể để chọn size quần áo */}
        <div className="instruction-card">
          <h3 className="instruction-title">
            <i className="fa-solid fa-tape"></i> Cách Đo Size Quần Áo Đấu
          </h3>
          <ul className="instruction-steps">
            <li>
              <span>1</span>
              <div>
                <strong>Đo vòng ngực:</strong> Dùng thước dây mềm quấn quanh phần ngực lớn nhất dưới nách, giữ thước nằm ngang phẳng lưng.
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Đo vòng eo:</strong> Quấn thước dây quanh phần eo tự nhiên nhỏ nhất (ngang rốn) để chọn quần short vừa vặn.
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Đo chiều cao:</strong> Đứng thẳng người, đo từ đỉnh đầu đến gót chân khi không mang giày dép.
              </div>
            </li>
            <li>
              <span>4</span>
              <div>
                <strong>Lưu ý form áo:</strong> Áo thi đấu bóng rổ Chinh Hoops thường có form rộng rãi thoải mái. Nếu thích mặc ôm, quý khách có thể chọn lùi 1 size.
              </div>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};

export default SizeGuideView;
