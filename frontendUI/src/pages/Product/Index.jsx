// export default HomeView;
import { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import HeroBanner from '../../components/HeroBanner';

// IMPORT các file gọi API chuyên biệt của bạn (Hãy điều chỉnh lại đường dẫn ../ cho đúng thư mục dự án)
import productService from '../../services/productService';
import categoryProductService from '../../services/categoryProductService';

// Import css
import '../../assets/css/ProductView.css';

const BASE_URL = "https://localhost:7291"; // Cấu hình lấy ảnh từ wwwroot/uploads của Backend

export const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const ProductView = ({ params, navigate }) => {
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
    const [loading, setLoading] = useState(false);         // Trạng thái chờ tải dữ liệu

    const pageSize = 20; // Yêu cầu: Hiển thị tối đa 20 sản phẩm trên 1 trang

    // ==========================================
    // 1. GỌI API LẤY DANH MỤC SẢN PHẨM (Chạy 1 lần duy nhất khi load trang)
    // ==========================================
    useEffect(() => {
        categoryProductService.getAllCategoryProducts()
            .then(data => {
                // Kiểm tra xem backend đã trả về "Tất cả sản phẩm" chưa
                const hasAll = (data || []).some(c => c.name === 'Tất cả sản phẩm');
                const dynamicCategories = hasAll ? (data || []) : [{ id: 'all', name: 'Tất cả sản phẩm' }, ...(data || [])];
                setCategories(dynamicCategories);
            })
            .catch(err => console.error("Lỗi khi tải danh mục từ API:", err));
    }, []);

    // ==========================================
    // 2. GỌI API LẤY SẢN PHẨM (Chạy lại khi ĐỔI TRANG hoặc ĐỔI DANH MỤC)
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
                // Do backend trả về cấu trúc phân trang: { totalItems, totalPages, pageNumber, pageSize, data: [...] }
                setProducts(result.data || []);
                setTotalPages(result.totalPages || 1);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi khi tải danh sách sản phẩm:", err);
                setProducts([]);
                setLoading(false);
            });
    }, [pageNumber, activeCategoryId, categories]); // Lắng nghe sự thay đổi của cả số trang lẫn bộ lọc danh mục

    // ==========================================
    // 3. CÁC HÀM XỬ LÝ SỰ KIỆN (EVENT HANDLERS)
    // ==========================================

    // Hàm xử lý khi người dùng bấm chọn Danh mục
    const handleCategoryClick = (categoryId) => {
        setActiveCategoryId(categoryId);
        setPageNumber(1); // QUAN TRỌNG: Phải reset số trang về 1 khi đổi danh mục để tránh lỗi tràn trang
    };

    // Hàm xử lý chuyển trang điều hướng
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageNumber(newPage);
            // Cuộn trang mượt mà lên vị trí lưới sản phẩm để khách hàng tiện theo dõi
            document.getElementById('products-sec').scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Xử lý đường dẫn ảnh đại diện cho các danh mục sản phẩm (bao gồm ảnh 'Tất cả' mặc định)
    const processedCategories = categories.map(cat => {
        if (cat.id === 'all') {
            return {
                ...cat,
                image: 'src/assets/images/hero_basketball_1778727871576.png'
            };
        }
        return {
            ...cat,
            image: cat.imageUrl
                ? (cat.imageUrl.startsWith('http') ? cat.imageUrl : `${BASE_URL}${cat.imageUrl}`)
                : 'src/assets/images/shoe_product_1_1778727884422.png'
        };
    });

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
            <section id="products-sec" className="products-section">
                <div className="section-header-custom">
                    <h2 className="section-title">
                        {categories.find(c => c.id === activeCategoryId)?.name || 'Sản phẩm'}
                    </h2>
                    <p className="section-subtitle">Khám phá các danh mục sản phẩm thể thao chuyên nghiệp chất lượng hàng đầu</p>
                </div>

                {/* Danh sách danh mục dạng thẻ tròn cao cấp có hình ảnh đại diện */}
                <div className="category-cards-container">
                    {processedCategories.map(cat => (
                        <div
                            key={cat.id}
                            className={`category-card ${activeCategoryId === cat.id ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(cat.id)}
                        >
                            <div className="category-card-image-wrapper">
                                <img src={cat.image} alt={cat.name} className="category-card-image" />
                                <div className="category-card-overlay"></div>
                            </div>
                            <span className="category-card-name">{cat.name}</span>
                        </div>
                    ))}
                </div>

                {/* Khối hiển thị dữ liệu hoặc thông báo Loading */}
                {loading ? (
                    <div className="loading-text">Đang tải sản phẩm từ hệ thống...</div>
                ) : products.length === 0 ? (
                    <div className="loading-text">Danh mục này hiện tại chưa có sản phẩm nào.</div>
                ) : (
                    <>
                        {/* LƯỚI HIỂN THỊ CHUẨN 5 SẢN PHẨM TRÊN 1 HÀNG */}
                        <div className="products-grid-5-columns">
                            {products.map(product => {
                                // Xử lý gắn link domain Backend (https://localhost:7291) vào đường dẫn ảnh cục bộ (/uploads/xxx.png)
                                const processedProduct = {
                                    ...product,
                                    image: product.imageUrl
                                        ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_URL}${product.imageUrl}`)
                                        : 'src/assets/images/default_product.png'
                                };

                                return (
                                    <ProductCard
                                        key={product.id}
                                        product={processedProduct}
                                        navigate={navigate}
                                    />
                                );
                            })}
                        </div>

                        {/* THANH ĐIỀU HƯỚNG PHÂN TRANG (Chỉ hiển thị khi tổng số trang lớn hơn 1) */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <button
                                    className="page-btn"
                                    disabled={pageNumber === 1}
                                    onClick={() => handlePageChange(pageNumber - 1)}
                                >
                                    ❮ Trước
                                </button>

                                {/* Vòng lặp tự động render các số trang dựa trên totalPages */}
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
            </section>
        </div>
    );
};

export default ProductView;