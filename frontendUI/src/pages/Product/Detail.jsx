/* 
 * PRODUCTDETAILVIEW COMPONENT - DYNAMIC DATABASE API INTEGRATION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import productService from '../../services/productService';
import { getCookie } from '../../utils/cookieHelper';
import '../../assets/css/ProductDetailView.css';

// Cấu hình URL Backend để lấy hình ảnh từ wwwroot/uploads
const BASE_URL = "https://localhost:7291";

export const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const ProductDetailView = ({ params, addToCart, navigate }) => {
  const productSlug = params.slug;
  const productId = params.id;
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Tải chi tiết sản phẩm từ API (ưu tiên gọi theo Slug, fallback ID)
  useEffect(() => {
    if (!productSlug && !productId) return;
    setLoading(true);

    const fetchPromise = productSlug
      ? productService.getProductBySlug(productSlug)
      : productService.getProductById(productId);

    fetchPromise
      .then(data => {
        setProduct(data);
        setLoading(false);
        // Chọn size mặc định
        const category = data.categoryName || '';
        if (category.toLowerCase().includes('giày') || category.toLowerCase().includes('shoe')) {
          setSize('US 8');
        } else if (category.toLowerCase().includes('vớ') || category.toLowerCase().includes('tất')) {
          setSize('Free');
        } else {
          setSize('M');
        }
      })
      .catch(err => {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
        setError("Không thể tải chi tiết sản phẩm này.");
        setLoading(false);
      });
  }, [productSlug, productId]);

  if (loading) {
    return (
      <div className="detail-loading-container">
        <i className="fa-solid fa-spinner fa-spin detail-loading-spinner"></i>
        <p>Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="detail-error-container">
        <i className="fa-solid fa-circle-exclamation detail-error-icon"></i>
        <h2>Lỗi!</h2>
        <p className="detail-error-message">{error || "Không tìm thấy sản phẩm này."}</p>
        <button className="btn btn-primary" onClick={() => navigate('home')}>Quay lại Trang Chủ</button>
      </div>
    );
  }

  // Quyết định các kích cỡ hỗ trợ
  const category = product.categoryName || '';
  const sizes = (category.toLowerCase().includes('giày') || category.toLowerCase().includes('shoe'))
    ? ['US 7', 'US 8', 'US 9', 'US 10', 'US 11']
    : (category.toLowerCase().includes('vớ') || category.toLowerCase().includes('tất'))
      ? ['Free']
      : ['S', 'M', 'L', 'XL'];

  // Xử lý thêm vào giỏ hàng
  const handleAdd = () => {
    // KHÓA BẢO MẬT: Bắt buộc đăng nhập
    const customer = getCookie('customer');
    if (!customer) {
      alert("Hệ thống bảo mật: Bạn phải đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate('login');
      return;
    }

    if (product.stockQuantity <= 0) {
      alert("Sản phẩm đã hết hàng!");
      return;
    }

    if (qty > product.stockQuantity) {
      alert(`Số lượng đặt mua vượt quá số lượng hàng tồn kho (${product.stockQuantity} sản phẩm)!`);
      return;
    }

    // Tiến hành add to cart (chuẩn hóa thuộc tính hình ảnh cho giỏ hàng)
    const productForCart = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || (product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_URL}${product.imageUrl}`) : 'src/assets/images/default_product.png'),
      categoryName: product.categoryName,
      stockQuantity: product.stockQuantity
    };

    addToCart(productForCart, size, qty);
    navigate('cart');
  };

  const imageSrc = product.image || (product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_URL}${product.imageUrl}`) : 'src/assets/images/default_product.png');

  return (
    <div className="page-container page-transition">
      <button onClick={() => navigate('home')} className="btn btn-outline detail-back-button">
        <i className="fa-solid fa-arrow-left"></i> Quay lại cửa hàng
      </button>

      <div className="detail-grid">
        <div className="detail-img">
          <img src={imageSrc} alt={product.name} />
        </div>
        <div className="detail-info">
          <div className="product-category">{product.categoryName}</div>
          <h1 className="detail-name-heading">{product.name}</h1>
          <div className="detail-price">{formatPrice(product.price)}</div>

          <div className="detail-stock-row">
            {product.stockQuantity > 0 ? (
              <span className="detail-badge-instock">
                Còn hàng: {product.stockQuantity} sản phẩm
              </span>
            ) : (
              <span className="detail-badge-outofstock">
                Hết hàng
              </span>
            )}
          </div>

          <p className="detail-desc">{product.description}</p>

          <span className="detail-section-title">Kích cỡ / Size:</span>
          <div className="size-selector">
            {sizes.map(s => (
              <button
                key={s}
                className={`size-btn ${size === s ? 'active' : ''}`}
                onClick={() => setSize(s)}
                disabled={product.stockQuantity <= 0}
              >
                {s}
              </button>
            ))}
          </div>

          <span className="detail-section-title">Số lượng mua:</span>
          <div className="add-cart-wrap">
            <input
              type="number"
              className="form-input qty-input"
              value={qty}
              min="1"
              max={product.stockQuantity || 1}
              disabled={product.stockQuantity <= 0}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                // Không cho nhập quá số lượng trong kho
                if (val > product.stockQuantity) {
                  setQty(product.stockQuantity);
                } else {
                  setQty(Math.max(1, val));
                }
              }}
            />
            {product.stockQuantity > 0 ? (
              <button className="btn btn-primary detail-add-cart-btn" onClick={handleAdd}>
                <i className="fa-solid fa-cart-plus detail-cart-icon"></i> Thêm vào giỏ
              </button>
            ) : (
              <button className="btn btn-secondary detail-outofstock-btn" disabled>
                <i className="fa-solid fa-ban detail-ban-icon"></i> Đã hết hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
