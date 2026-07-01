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
import { IMAGE_BASE_URL, resolveImageUrl } from '../../config';

const BASE_URL = IMAGE_BASE_URL;

const ProductView = ({ params, navigate, addToCart }) => {
    // --- Khai báo các State quản lý dữ liệu ---
    const [products, setProducts] = useState([]);          // Mảng chứa danh sách sản phẩm hiển thị
    const [categories, setCategories] = useState([]);      // Mảng chứa danh mục [{id: 'all', name: 'Tất cả'}, {id: 1, name: 'Giày'}, ...]
    const [activeCategoryId, setActiveCategoryId] = useState(params?.categoryId || 'all'); // Lưu ID danh mục đang chọn

    // Lắng nghe sự thay đổi của danh mục truyền qua route params (ví dụ từ Footer)
    useEffect(() => {
        if (params?.categoryId) {
            setActiveCategoryId(params.categoryId);
            setPageNumber(1);
        } else {
            setActiveCategoryId('all');
            setPageNumber(1);
        }
    }, [params?.categoryId]);

    // State quản lý phân trang
    const [pageNumber, setPageNumber] = useState(1);       // Trang hiện tại
    const [totalPages, setTotalPages] = useState(1);       // Tổng số trang do API tính toán trả về
    const [loading, setLoading] = useState(true);          // Trạng thái chờ tải dữ liệu
    const [hasError, setHasError] = useState(false);       // Trạng thái lỗi kết nối API

    const pageSize = 8; // Yêu cầu: Hiển thị tối đa 8 sản phẩm trên 1 trang

    // ==========================================
    // GỌI API LẤY SẢN PHẨM (Chạy lại khi ĐỔI TRANG hoặc ĐỔI DANH MỤC)
    // ==========================================
    useEffect(() => {
        setLoading(true);

        // Khai báo biến hứng dữ liệu phản hồi chung
        let apiCall;

        // Tìm ID của danh mục "Tất cả sản phẩm" từ DB nếu có
        const allCat = categories.find(c => c.name === 'Tất cả sản phẩm');
        const allCatId = allCat ? allCat.id : 'all';

        if (activeCategoryId === 'all' || activeCategoryId === allCatId) {
            // Nếu đang chọn danh mục "Tất cả sản phẩm" -> Gọi API lấy toàn bộ sản phẩm (có phân trang)
            apiCall = productService.getAllProducts(pageNumber, pageSize);
        } else {
            // Nếu chọn danh mục cụ thể (Giày, Áo, Quần...) -> Gọi API lọc theo Category ID (có phân trang)
            apiCall = productService.getProductsByCategory(activeCategoryId, pageNumber, pageSize);
        }

        // Tiến hành xử lý dữ liệu nhận về sau khi bóc tách qua AxiosClient
        apiCall
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
    }, [pageNumber, activeCategoryId, categories]); // Lắng nghe sự thay đổi của cả số trang lẫn bộ lọc danh mục

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
                    {/* CỘT TRÁI: DANH MỤC SẢN PHẨM */}
                    <aside className="product-sidebar">
                        <ProductCategoryList
                            activeCategoryId={activeCategoryId}
                            onSelectCategory={handleCategoryClick}
                            onCategoriesLoaded={setCategories}
                        />
                    </aside>

                    {/* CỘT PHẢI: LƯỚI SẢN PHẨM VÀ PHÂN TRANG */}
                    <main className="product-main">
                        {loading ? (
                            <IsLoading message="Đang tải sản phẩm từ hệ thống..." />
                        ) : hasError ? (
                            <div className="loading-text" style={{ color: '#ef4444' }}>
                                <i className="fa-solid fa-circle-exclamation"></i> Lỗi kết nối đến máy chủ. Vui lòng kiểm tra đường truyền!
                            </div>
                        ) : products.length === 0 ? (
                            <div className="loading-text">Danh mục này hiện tại chưa có sản phẩm nào.</div>
                        ) : (
                            <>
                                {/* LƯỚI HIỂN THỊ CHUẨN 4 SẢN PHẨM TRÊN 1 HÀNG KHI CÓ SIDEBAR */}
                                <div className="products-grid-4-columns">
                                    {products.map(product => {
                                        const processedProduct = {
                                            ...product,
                                            image: resolveImageUrl(product.imageUrl, 'src/assets/images/default_product.png')
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