/* 
 * SEARCHVIEW COMPONENT - AUTOMATED DATABASE SEARCH INTEGRATION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import productService from '../../services/productService';
import '../../assets/css/SearchView.css';

const SearchView = ({ navigate }) => {
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Tải toàn bộ sản phẩm từ Database để chuẩn bị cho việc tìm kiếm tức thì (Instant Search)
  useEffect(() => {
    productService.getAllProducts(1, 100)
      .then(res => {
        setAllProducts(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải danh sách sản phẩm để tìm kiếm:", err);
        setLoading(false);
      });
  }, []);

  // 2. Lọc sản phẩm theo chuỗi truy vấn trong bộ nhớ (In-memory Filter)
  const results = query.trim() === '' ? [] : allProducts.filter(p =>
    (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
    (p.categoryName && p.categoryName.toLowerCase().includes(query.toLowerCase())) ||
    (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="page-container page-transition">
      <h2 className="page-title">Tìm kiếm <span>Sản phẩm</span></h2>

      <div className="search-bar-container">
        <input
          type="text"
          className="form-input search-input-custom"
          placeholder="Nhập tên giày, áo đấu, quần short..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <i className="fa-solid fa-magnifying-glass search-icon-inside"></i>
      </div>

      {loading ? (
        <div className="search-loading-box">
          <i className="fa-solid fa-spinner fa-spin search-spinner"></i> Đang nạp cơ sở dữ liệu tìm kiếm...
        </div>
      ) : (
        <>
          {query && results.length > 0 && (
            <div>
              <p className="search-result-stats">
                <i className="fa-solid fa-circle-check search-success-icon"></i>
                Tìm thấy <strong>{results.length}</strong> kết quả phù hợp với từ khóa "{query}"
              </p>
              <div className="products-grid-5-columns">
                {results.map(product => (
                  <ProductCard key={product.id} product={product} navigate={navigate} />
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="search-empty-state">
              <i className="fa-solid fa-ban search-error-icon"></i>
              <p className="search-result-stats">Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}".</p>
            </div>
          )}

          {!query && (
            <div className="search-empty-state">
              <i className="fa-solid fa-keyboard search-keyboard-icon"></i>
              <p className="search-result-stats">Nhập từ khóa phía trên để bắt đầu tìm kiếm sản phẩm.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchView;
