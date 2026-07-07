/* 
 * PRODUCT VIEW COMPONENT - DEDICATED SHOP PORTAL WITH SIDEBAR CATEGORY FILTER & PAGINATION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import HeroBanner from '../../components/HeroBanner';
import productService from '../../services/productService';
import ProductCategoryList from './ProductCategoryList';
import IsLoading from '../../components/IsLoading';
import '../../assets/css/productCSS/Product.css';
import { resolveImageUrl } from '../../config';

const ProductView = ({ params, navigate, addToCart }) => {
    // --- Khai báo các State quản lý dữ liệu ---
    const [products, setProducts] = useState([]);          // Mảng chứa danh sách sản phẩm hiển thị
    const [categories, setCategories] = useState([]);      // Mảng chứa danh mục [{id: 'all', name: 'Tất cả'}, {id: 1, name: 'Giày'}, ...]
    const [activeCategoryId, setActiveCategoryId] = useState(params?.categoryId || 'all'); // Lưu ID danh mục đang chọn

    // Lắng nghe sự thay đổi của danh mục và từ khóa truyền qua route params (ví dụ từ Footer hoặc Header Search)
    useEffect(() => {
        if (params?.categoryId) {
            setActiveCategoryId(params.categoryId);
        } else {
            setActiveCategoryId('all');
        }

        if (params?.keyword) {
            setKeyword(params.keyword);
            setTempKeyword(params.keyword);
        } else {
            setKeyword('');
            setTempKeyword('');
        }

        setPageNumber(1);
    }, [params?.categoryId, params?.keyword]);

    // State quản lý tìm kiếm từ khóa
    const [keyword, setKeyword] = useState('');
    const [tempKeyword, setTempKeyword] = useState('');

    // State quản lý bộ lọc khoảng giá
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [tempMinPrice, setTempMinPrice] = useState('');
    const [tempMaxPrice, setTempMaxPrice] = useState('');
    const [priceError, setPriceError] = useState('');

    // State quản lý phân trang
    const [pageNumber, setPageNumber] = useState(1);       // Trang hiện tại
    const [totalPages, setTotalPages] = useState(1);       // Tổng số trang do API tính toán trả về
    const [loading, setLoading] = useState(true);          // Trạng thái chờ tải dữ liệu
    const [hasError, setHasError] = useState(false);       // Trạng thái lỗi kết nối API

    const pageSize = 8; // Yêu cầu: Hiển thị tối đa 8 sản phẩm trên 1 trang

    // Kiểm tra tính hợp lệ của khoảng giá nhập vào
    useEffect(() => {
        const minVal = parseFloat(tempMinPrice);
        const maxVal = parseFloat(tempMaxPrice);
        if (!isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal) {
            setPriceError('Giá tối thiểu không được lớn hơn giá tối đa.');
        } else {
            setPriceError('');
        }
    }, [tempMinPrice, tempMaxPrice]);

    // Debounce tìm kiếm từ khóa để tự động gọi API khi người dùng gõ phím (sau 400ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            if (tempKeyword !== keyword) {
                setKeyword(tempKeyword);
                setPageNumber(1);
            }
        }, 400);

        return () => {
            clearTimeout(handler);
        };
    }, [tempKeyword, keyword]);

    // ==========================================
    // GỌI API LẤY SẢN PHẨM (Chạy lại khi có bất kỳ thay đổi nào từ bộ lọc hoặc phân trang)
    // ==========================================
    useEffect(() => {
        setLoading(true);

        // Gọi API getAllProducts với đầy đủ các tham số lọc nâng cao
        productService.getAllProducts(pageNumber, pageSize, keyword, minPrice, maxPrice, activeCategoryId)
            .then(result => {
                setProducts(result.data || []);
                setTotalPages(result.totalPages || 1);
                setHasError(false);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi khi tải danh sách sản phẩm:", err);
                setProducts([]);
                setTotalPages(1);
                setHasError(true);
                setLoading(false);
            });
    }, [pageNumber, activeCategoryId, keyword, minPrice, maxPrice]);

    // ==========================================
    // CÁC HÀM XỬ LÝ SỰ KIỆN (EVENT HANDLERS)
    // ==========================================

    // Hàm xử lý khi người dùng bấm chọn Danh mục
    const handleCategoryClick = (categoryId) => {
        setActiveCategoryId(categoryId);
        setPageNumber(1); // Reset số trang về 1 khi đổi danh mục
    };

    // Hàm xử lý chuyển trang điều hướng
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageNumber(newPage);
            document.getElementById('products-sec').scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Hàm áp dụng khoảng giá lọc
    const handleApplyFilters = () => {
        if (priceError) return;
        setMinPrice(tempMinPrice);
        setMaxPrice(tempMaxPrice);
        setPageNumber(1);
    };

    // Hàm xóa toàn bộ bộ lọc hiện tại
    const handleClearAllFilters = () => {
        setTempMinPrice('');
        setTempMaxPrice('');
        setMinPrice('');
        setMaxPrice('');
        setTempKeyword('');
        setKeyword('');
        setActiveCategoryId('all');
        setPageNumber(1);
    };

    // Hàm thực hiện tìm kiếm từ khóa
    const handleSearchSubmit = () => {
        setKeyword(tempKeyword);
        setPageNumber(1);
    };

    // Hàm xóa từ khóa tìm kiếm
    const handleClearSearch = () => {
        setTempKeyword('');
        setKeyword('');
        setPageNumber(1);
    };

    return (
        <div className="page-transition">
            {/* SECTION HERO */}
            <HeroBanner
                tag="Bộ sưu tập mới 2026"
                title={<>ELEVATE YOUR <span>GAME</span></>}
                desc="Trang bị những sản phẩm bóng rổ đỉnh cao nhất. Từ đôi giày hiệu năng cao đến trang phục chuyên nghiệp, Chinh Hoops đồng hành cùng bạn trên mọi mặt sân."
                image="src/assets/images/hero_basketball_1778727871576.png"
                buttonText="Mua Sắm Ngay"
                onButtonClick={() => document.getElementById('products-sec').scrollIntoView({ behavior: 'smooth' })}
            />

            {/* SECTION DANH SÁCH SẢN PHẨM */}
            <section id="products-sec" className="products-section container py-5">
                <div className="section-header-custom">
                    <h2 className="section-title">
                        {categories.find(c => c.id === activeCategoryId)?.name || 'Sản phẩm'}
                    </h2>
                    <p className="section-subtitle">Khám phá các danh mục sản phẩm thể thao chuyên nghiệp chất lượng hàng đầu</p>
                </div>

                <div className="product-layout">
                    {/* CỘT TRÁI: DANH MỤC SẢN PHẨM & LỌC GIÁ */}
                    <aside className="product-sidebar">
                        <ProductCategoryList
                            activeCategoryId={activeCategoryId}
                            onSelectCategory={handleCategoryClick}
                            onCategoriesLoaded={setCategories}
                        />

                        {/* BỘ LỌC GIÁ NÂNG CAO */}
                        <div className="product-price-filter-card">
                            <h5 className="product-price-filter-title">
                                <i className="fa-solid fa-sliders"></i> Khoảng giá (VNĐ)
                            </h5>

                            <div className="price-inputs">
                                <div className="price-input-group">
                                    <label>Từ</label>
                                    <input
                                        type="number"
                                        placeholder="Min..."
                                        value={tempMinPrice}
                                        onChange={(e) => setTempMinPrice(e.target.value)}
                                        min="0"
                                    />
                                </div>
                                <div className="price-input-group">
                                    <label>Đến</label>
                                    <input
                                        type="number"
                                        placeholder="Max..."
                                        value={tempMaxPrice}
                                        onChange={(e) => setTempMaxPrice(e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {priceError && (
                                <div className="price-filter-error">
                                    <i className="fa-solid fa-triangle-exclamation"></i> {priceError}
                                </div>
                            )}

                            <div className="price-filter-actions">
                                <button
                                    className="btn-apply-filter"
                                    onClick={handleApplyFilters}
                                    disabled={!!priceError}
                                >
                                    Áp dụng
                                </button>
                                {(minPrice || maxPrice || keyword || activeCategoryId !== 'all') && (
                                    <button className="btn-clear-filter" onClick={handleClearAllFilters}>
                                        Xóa lọc
                                    </button>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* CỘT PHẢI: LƯỚI SẢN PHẨM VÀ PHÂN TRANG */}
                    <main className="product-main">
                        {/* THANH TÌM KIẾM VÀ TỔNG HỢP Ở ĐẦU LƯỚI SẢN PHẨM */}
                        <div className="product-main-header">
                            <div className="product-count-summary">
                                Hiển thị <strong>{products.length}</strong> sản phẩm
                            </div>
                            <div className="product-search-box">
                                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                                <input
                                    type="text"
                                    placeholder="Tìm sản phẩm..."
                                    value={tempKeyword}
                                    onChange={(e) => setTempKeyword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearchSubmit();
                                    }}
                                />
                                {tempKeyword && (
                                    <button className="search-clear-btn" onClick={handleClearSearch}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                )}
                                <button className="search-btn" onClick={handleSearchSubmit}>Tìm</button>
                            </div>
                        </div>

                        {loading ? (
                            <IsLoading message="Đang tải sản phẩm từ hệ thống..." />
                        ) : hasError ? (
                            <div className="loading-text" style={{ color: '#ef4444' }}>
                                <i className="fa-solid fa-circle-exclamation"></i> Lỗi kết nối đến máy chủ. Vui lòng kiểm tra đường truyền!
                            </div>
                        ) : products.length === 0 ? (
                            <div className="no-products-found-container" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4rem 2rem',
                                textAlign: 'center',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px dashed #cbd5e1',
                                margin: '2rem 0'
                            }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                                }}>
                                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '3rem', color: '#94a3b8' }}></i>
                                </div>
                                <h4 style={{ color: '#1e293b', fontWeight: '700', marginBottom: '0.5rem' }}>
                                    Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn
                                </h4>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px' }}>
                                    Vui lòng thử lại với từ khóa khác hoặc xóa bớt các bộ lọc khoảng giá của bạn.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* LƯỚI HIỂN THỊ CHUẨN 4 SẢN PHẨM TRÊN 1 HÀNG KHI CÓ SIDEBAR */}
                                <div className="products-grid-4-columns">
                                    {products.map(product => {
                                        const processedProduct = {
                                            ...product,
                                            image: resolveImageUrl(product.imageUrl, 'src/assets/images/shoe_product_1_1778727884422.png')
                                        };

                                        return (
                                            <ProductCard
                                                key={product.id}
                                                product={processedProduct}
                                                navigate={navigate}
                                                addToCart={addToCart}
                                            />
                                        );
                                    })}
                                </div>

                                {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
                                {totalPages > 1 && (
                                    <div className="pagination-container">
                                        <button
                                            className="page-btn"
                                            disabled={pageNumber === 1}
                                            onClick={() => handlePageChange(pageNumber - 1)}
                                        >
                                            ❮ Trước
                                        </button>

                                        {Array.from({ length: totalPages }, (_, index) => (
                                            <button
                                                key={index + 1}
                                                className={`page-btn ${pageNumber === index + 1 ? 'active' : ''}`}
                                                onClick={() => handlePageChange(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}

                                        <button
                                            className="page-btn"
                                            disabled={pageNumber === totalPages}
                                            onClick={() => handlePageChange(pageNumber + 1)}
                                        >
                                            Sau ❯
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </section>
        </div>
    );
};

export default ProductView;