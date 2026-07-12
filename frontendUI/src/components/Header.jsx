import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import postService from '../services/postService';
import customerService from '../services/customerService';
import { getCookie, setCookie, eraseCookie } from '../utils/cookieHelper';
import '../assets/css/headerCSS/Header.css';

import { resolveImageUrl } from '../config';

const Header = ({ currentView, cartCount }) => {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ products: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [mobileAvatarError, setMobileAvatarError] = useState(false);

  const searchRef = useRef(null);

  // Xử lý submit tìm kiếm khi nhấn Enter
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        routerNavigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // Click vào biểu tượng tìm kiếm để chuyển trang kết quả
  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      routerNavigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Sync customer cookie on load and on route transitions
  useEffect(() => {
    const loggedCustomer = getCookie('customer');
    if (loggedCustomer && loggedCustomer.id) {
      // Đầu tiên cứ hiển thị thông tin cũ từ cookie
      setCustomer(loggedCustomer);
      
      // Đồng thời tải thông tin mới nhất từ Backend để cập nhật cookie và state
      customerService.getCustomerById(loggedCustomer.id)
        .then(freshCustomer => {
          if (freshCustomer) {
            setCookie('customer', freshCustomer, 7);
            setCustomer(freshCustomer);
          }
        })
        .catch(err => {
          console.error("Lỗi khi tải thông tin khách hàng mới nhất:", err);
          // Nếu bị lỗi 403, 401 hoặc 400 (do ID khách hàng không còn tồn tại trên DB) -> xoá session để tránh spam request liên tục
          if (err.response && (err.response.status === 403 || err.response.status === 401 || err.response.status === 400)) {
            eraseCookie('customer');
            eraseCookie('token');
            setCustomer(null);
          }
        });
    } else {
      setCustomer(null);
    }
    setAvatarError(false);
    setMobileAvatarError(false);
  }, [location]);

  // Debounced API call for autocomplete search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({ products: [], posts: [] });
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsLoading(true);
      Promise.all([
        productService.getAllProducts(1, 5, searchQuery),
        postService.getLatestPosts(1, 5, searchQuery)
      ])
        .then(([productsRes, postsRes]) => {
          setResults({
            products: Array.isArray(productsRes) ? productsRes : (productsRes?.content || productsRes?.Content || productsRes?.data || []),
            posts: Array.isArray(postsRes) ? postsRes : (postsRes?.content || postsRes?.Content || postsRes?.data || [])
          });
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Lỗi khi tìm kiếm:", err);
          setIsLoading(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const mobileSearchRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideDesktop = searchRef.current && !searchRef.current.contains(event.target);
      const clickedOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(event.target);
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults({ products: [], posts: [] });
  };

  const handleResultClick = () => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  };

  const processImage = (imageUrl) => {
    return resolveImageUrl(imageUrl);
  };

  return (
    <header className="header">
      {/* Top Row: Logo, Search Bar, actions */}
      <div className="header-main-row">
        <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
          <i className="fa-solid fa-basketball"></i> CHINH <span>HOOPS</span>
        </Link>

        {/* Centered Search Bar (Desktop only) */}
        <div className="header-search-container desktop-search-only" ref={searchRef}>
          <div className="header-search-wrapper">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, bài viết..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleSearchSubmit}
              className="header-search-input"
            />
            <i className="fa-solid fa-magnifying-glass search-icon" style={{ cursor: 'pointer' }} onClick={handleSearchIconClick}></i>
            {searchQuery && (
              <button className="search-clear-btn" onClick={clearSearch}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (searchQuery.trim().length > 0 || isLoading) && (
            <div className="search-results-dropdown">
              {isLoading ? (
                <div className="search-dropdown-loading">
                  <i className="fa-solid fa-spinner fa-spin"></i> Đang tìm kiếm...
                </div>
              ) : (
                <div className="search-dropdown-content">
                  {/* Products Section */}
                  <div className="search-section">
                    <h4 className="search-section-title">
                      <i className="fa-solid fa-bag-shopping"></i> Sản phẩm ({results.products.length})
                    </h4>
                    {results.products.length > 0 ? (
                      <ul className="search-items-list">
                        {results.products.map(product => (
                          <li key={product.id} className="search-item">
                            <Link to={`/product/${product.slug || product.id}`} onClick={handleResultClick} className="search-item-link">
                              <img src={processImage(product.imageUrl)} alt={product.name} className="search-item-img" />
                              <div className="search-item-info">
                                <span className="search-item-name">{product.name}</span>
                                <span className="search-item-price">{product.price?.toLocaleString('vi-VN')} VND</span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-results-text">Không tìm thấy sản phẩm nào</p>
                    )}
                  </div>

                  {/* Vertical Divider */}
                  <div className="search-dropdown-divider"></div>

                  {/* Posts Section */}
                  <div className="search-section">
                    <h4 className="search-section-title">
                      <i className="fa-regular fa-newspaper"></i> Bài viết ({results.posts.length})
                    </h4>
                    {results.posts.length > 0 ? (
                      <ul className="search-items-list">
                        {results.posts.map(post => (
                          <li key={post.id} className="search-item">
                            <Link to={`/blog/${post.slug || post.id}`} onClick={handleResultClick} className="search-item-link">
                              <img src={processImage(post.imageUrl)} alt={post.title} className="search-item-img" />
                              <div className="search-item-info">
                                <span className="search-item-name">{post.title}</span>
                                <span className="search-item-category">{post.categoryName}</span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-results-text">Không tìm thấy bài viết nào</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions (Account, Cart, Menu) */}
        <div className="header-actions">
          <div className="desktop-actions-only">
            {customer ? (
              <Link className="header-user-profile" to="/user" title="Tài khoản" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="welcome-text">Chào, {customer.fullName}</span>
                <div className="user-profile-avatar-circle">
                  {customer.imageUrl && !avatarError ? (
                    <img 
                      src={resolveImageUrl(customer.imageUrl)} 
                      alt={customer.fullName} 
                      className="user-profile-avatar-img"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
              </Link>
            ) : (
              <Link className="action-btn" to="/user" title="Tài khoản" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-user"></i>
              </Link>
            )}
            <Link className="action-btn" to="/cart" title="Giỏ hàng" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="fa-solid fa-bag-shopping"></i>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
          </div>
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Bottom Row: Centered Navigation Links */}
      <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        
        {/* Mobile User Profile Section */}
        <li className="mobile-only-item mobile-user-info">
          {customer ? (
            <Link to="/user" className="mobile-user-row" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="user-profile-avatar-circle">
                {customer.imageUrl && !mobileAvatarError ? (
                  <img 
                    src={resolveImageUrl(customer.imageUrl)} 
                    alt={customer.fullName} 
                    className="user-profile-avatar-img"
                    onError={() => setMobileAvatarError(true)}
                  />
                ) : (
                  customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <span className="welcome-text">Chào, {customer.fullName}</span>
            </Link>
          ) : (
            <Link to="/user" className="mobile-nav-action-link" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="fa-solid fa-user"></i> Tài khoản / Đăng nhập
            </Link>
          )}
        </li>

        {/* Mobile Search Bar Section */}
        <li className="mobile-only-item mobile-search-item">
          <div className="header-search-container mobile-search-container" ref={mobileSearchRef}>
            <div className="header-search-wrapper">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, bài viết..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleSearchSubmit}
                className="header-search-input"
              />
              <i className="fa-solid fa-magnifying-glass search-icon" style={{ cursor: 'pointer' }} onClick={handleSearchIconClick}></i>
              {searchQuery && (
                <button className="search-clear-btn" onClick={clearSearch}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {isDropdownOpen && (searchQuery.trim().length > 0 || isLoading) && (
              <div className="search-results-dropdown">
                {isLoading ? (
                  <div className="search-dropdown-loading">
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang tìm kiếm...
                  </div>
                ) : (
                  <div className="search-dropdown-content">
                    {/* Products Section */}
                    <div className="search-section">
                      <h4 className="search-section-title">
                        <i className="fa-solid fa-bag-shopping"></i> Sản phẩm ({results.products.length})
                      </h4>
                      {results.products.length > 0 ? (
                        <ul className="search-items-list">
                          {results.products.map(product => (
                            <li key={product.id} className="search-item">
                              <Link to={`/product/${product.slug || product.id}`} onClick={handleResultClick} className="search-item-link">
                                <img src={processImage(product.imageUrl)} alt={product.name} className="search-item-img" />
                                <div className="search-item-info">
                                  <span className="search-item-name">{product.name}</span>
                                  <span className="search-item-price">{product.price?.toLocaleString('vi-VN')} VND</span>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-results-text">Không tìm thấy sản phẩm nào</p>
                      )}
                    </div>

                    {/* Vertical Divider */}
                    <div className="search-dropdown-divider"></div>

                    {/* Posts Section */}
                    <div className="search-section">
                      <h4 className="search-section-title">
                        <i className="fa-regular fa-newspaper"></i> Bài viết ({results.posts.length})
                      </h4>
                      {results.posts.length > 0 ? (
                        <ul className="search-items-list">
                          {results.posts.map(post => (
                            <li key={post.id} className="search-item">
                              <Link to={`/blog/${post.slug || post.id}`} onClick={handleResultClick} className="search-item-link">
                                <img src={processImage(post.imageUrl)} alt={post.title} className="search-item-img" />
                                <div className="search-item-info">
                                  <span className="search-item-name">{post.title}</span>
                                  <span className="search-item-category">{post.categoryName}</span>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-results-text">Không tìm thấy bài viết nào</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </li>

        <li><Link className={currentView.name === 'home' ? 'active' : ''} to="/" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link></li>
        <li><Link className={currentView.name === 'products' ? 'active' : ''} to="/products" onClick={() => setIsMobileMenuOpen(false)}>Sản phẩm</Link></li>
        <li><Link className={currentView.name === 'blog' ? 'active' : ''} to="/blog" onClick={() => setIsMobileMenuOpen(false)}>Bài viết</Link></li>
        <li><Link className={currentView.name === 'about' ? 'active' : ''} to="/about" onClick={() => setIsMobileMenuOpen(false)}>Về chúng tôi</Link></li>

        {/* Mobile Cart Section */}
        <li className="mobile-only-item mobile-cart-item">
          <Link className="mobile-nav-action-link" to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
            <i className="fa-solid fa-bag-shopping"></i> Giỏ hàng {cartCount > 0 && `(${cartCount})`}
          </Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;
