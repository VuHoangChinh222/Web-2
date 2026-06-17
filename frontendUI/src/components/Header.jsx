import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ currentView, cartCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
        <i className="fa-solid fa-basketball"></i> Chinh <span>HOOPS</span>
      </Link>
      <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <li><Link className={currentView.name === 'home' ? 'active' : ''} to="/" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link></li>
        <li><Link className={currentView.name === 'products' ? 'active' : ''} to="/products" onClick={() => setIsMobileMenuOpen(false)}>Sản phẩm</Link></li>
        <li><Link className={currentView.name === 'blog' ? 'active' : ''} to="/blog" onClick={() => setIsMobileMenuOpen(false)}>Bài viết</Link></li>
        <li><Link className={currentView.name === 'about' ? 'active' : ''} to="/about" onClick={() => setIsMobileMenuOpen(false)}>Về chúng tôi</Link></li>
      </ul>
      <div className="header-actions">
        <Link className="action-btn" to="/search" title="Tìm kiếm" onClick={() => setIsMobileMenuOpen(false)}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </Link>
        <Link className="action-btn" to="/user" title="Tài khoản" onClick={() => setIsMobileMenuOpen(false)}>
          <i className="fa-solid fa-user"></i>
        </Link>
        <Link className="action-btn" to="/cart" title="Giỏ hàng" onClick={() => setIsMobileMenuOpen(false)}>
          <i className="fa-solid fa-bag-shopping"></i>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
