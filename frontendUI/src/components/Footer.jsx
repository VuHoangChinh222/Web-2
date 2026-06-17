/* 
 * FOOTER COMPONENT - HIGH-END DYNAMIC FOOTER
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryProductService from '../services/categoryProductService';

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryProductService.getAllCategoryProducts()
      .then(data => {
        if (data && Array.isArray(data)) {
          // Lọc bỏ chuyên mục mặc định "Tất cả sản phẩm" (ID: 7 hoặc Tên: "Tất cả sản phẩm")
          const filtered = data.filter(c => c.id !== 7 && c.name !== 'Tất cả sản phẩm');
          setCategories(filtered);
        }
      })
      .catch(err => console.error("Lỗi tải danh mục sản phẩm chân trang:", err));
  }, []);

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-col">
          <Link to="/" className="logo" style={{ marginBottom: '1rem', fontSize: '1.5rem', textDecoration: 'none', color: 'inherit' }}>
            <i className="fa-solid fa-basketball"></i> Chinh <span>HOOPS</span>
          </Link>
          <p>Nâng tầm đam mê bóng rổ của bạn với những trang bị chất lượng hàng đầu. Chúng tôi cung cấp những sản phẩm chính hãng tốt nhất.</p>
          <div className="social-links">
            <a href="https://www.facebook.com/chinh.vuhoang.5/" target='blank'><i className="fa-brands fa-facebook-f"></i></a>
            <a href="https://github.com/VuHoangChinh222" target='blank'><i className="fa-brands fa-github"></i></a>
          </div>
        </div>
        <div className="footer-col">
          <h3>Danh mục</h3>
          <div className="footer-links">
            {categories.length > 0 ? (
              categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?categoryId=${cat.id}`}
                >
                  {cat.name}
                </Link>
              ))
            ) : (
              <>
                <Link to="/products">Sản phẩm</Link>
              </>
            )}
          </div>
        </div>
        <div className="footer-col">
          <h3>Hỗ trợ</h3>
          <div className="footer-links">
            <Link to="/about">Về chúng tôi</Link>
            <a href="#">Chính sách đổi trả</a>
            <a href="#">Hướng dẫn chọn size</a>
          </div>
        </div>
        <div className="footer-col">
          <h3>Liên hệ</h3>
          <div className="footer-links">
            <p><i className="fa-solid fa-location-dot" style={{ color: 'var(--accent)', marginRight: '10px' }}></i>Cao Đẳng Công Thương TP.HCM </p>
            <p><i className="fa-solid fa-phone" style={{ color: 'var(--accent)', marginRight: '10px' }}></i> 039.380.7472</p>
            <p><i className="fa-solid fa-envelope" style={{ color: 'var(--accent)', marginRight: '10px' }}></i> vuhoangchinh222@gmail.com</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Chinh Hoops. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;
