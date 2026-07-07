/* 
 * PRODUCTDETAILVIEW COMPONENT - DYNAMIC DATABASE API INTEGRATION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import productService from '../../services/productService';
import { getCookie } from '../../utils/cookieHelper';
import IsLoading from '../../components/IsLoading';
import '../../assets/css/productCSS/ProductDetail.css';
import { resolveImageUrl } from '../../config';

export const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const ProductDetailView = ({ params, addToCart, navigate }) => {
  const productSlug = params.slug;
  const productId = params.id;
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [stockWarning, setStockWarning] = useState(false);
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
        setQty(1);
        setStockWarning(false);
        setLoading(false);
        // Chọn size mặc định
        const category = data.categoryName || '';
        if (category.toLowerCase().includes('giày') || category.toLowerCase().includes('shoe')) {
          setSize('US 8');
        } else if (category.toLowerCase().includes('vớ') || category.toLowerCase().includes('tất')) {
          setSize('Free');
        } else if (category.toLowerCase().includes('quả') || category.toLowerCase().includes('bóng')) {
          setSize('7');
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

  // Chuyển đổi thẻ oembed từ CKEditor thành iframe phát video thời gian thực
  useEffect(() => {
    if (!product) return;

    const timer = setTimeout(() => {
      const container = document.querySelector('.description-content');
      if (container) {
        const oembeds = container.querySelectorAll('oembed');
        oembeds.forEach(oembed => {
          const url = oembed.getAttribute('url');
          if (url) {
            let embedUrl = '';

            // Phân tích đường dẫn Youtube
            const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
            const ytMatch = url.match(ytRegex);
            if (ytMatch && ytMatch[1]) {
              embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
            }

            // Phân tích đường dẫn Vimeo
            const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]+)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/i;
            const vimeoMatch = url.match(vimeoRegex);
            if (vimeoMatch && vimeoMatch[1]) {
              embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
            }

            if (embedUrl) {
              const iframe = document.createElement('iframe');
              iframe.src = embedUrl;
              iframe.width = "100%";
              iframe.height = "480";
              iframe.setAttribute('frameborder', '0');
              iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
              iframe.setAttribute('allowfullscreen', 'true');
              iframe.style.borderRadius = "8px";
              iframe.style.marginTop = "15px";
              iframe.style.marginBottom = "15px";
              iframe.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";

              if (oembed.parentNode) {
                oembed.parentNode.replaceChild(iframe, oembed);
              }
            }
          }
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [product]);

  if (loading) {
    return <IsLoading message="Đang tải chi tiết sản phẩm..." />;
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
      : (category.toLowerCase().includes('quả') || category.toLowerCase().includes('bóng'))
        ? ['5', '6', '7']
        : ['S', 'M', 'L', 'XL'];

  // Chuẩn hóa và bảo vệ số lượng tồn kho để tránh lỗi so sánh với undefined/null
  const stockQuantity = product.stockQuantity !== undefined && product.stockQuantity !== null ? product.stockQuantity : 0;

  // Xử lý thêm vào giỏ hàng
  const handleAdd = () => {
    // KHÓA BẢO MẬT: Bắt buộc đăng nhập
    const customer = getCookie('customer');
    if (!customer) {
      alert("Hệ thống bảo mật: Bạn phải đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate('login');
      return;
    }

    if (stockQuantity <= 0) {
      alert("Sản phẩm đã hết hàng!");
      return;
    }

    if (qty > stockQuantity) {
      alert("Số lượng sản phẩm trong kho không đủ!");
      return;
    }

    // Tiến hành add to cart (chuẩn hóa thuộc tính hình ảnh cho giỏ hàng)
    const productForCart = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || resolveImageUrl(product.imageUrl, 'src/assets/images/shoe_product_1_1778727884422.png'),
      categoryName: product.categoryName,
      stockQuantity: stockQuantity
    };

    const success = addToCart(productForCart, size, qty);
    if (success) {
      navigate('cart');
    }
  };

  const imageSrc = product.image || resolveImageUrl(product.imageUrl, 'src/assets/images/shoe_product_1_1778727884422.png');

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
            {stockQuantity > 0 ? (
              <span className="detail-badge-instock">
                Còn hàng: {stockQuantity} sản phẩm
              </span>
            ) : (
              <span className="detail-badge-outofstock">
                Hết hàng
              </span>
            )}
          </div>

          <span className="detail-section-title">Kích cỡ / Size:</span>
          <div className="size-selector">
            {sizes.map(s => (
              <button
                key={s}
                className={`size-btn ${size === s ? 'active' : ''}`}
                onClick={() => setSize(s)}
                disabled={stockQuantity <= 0}
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
              max={stockQuantity || 1}
              disabled={stockQuantity <= 0}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (isNaN(val)) {
                  setQty('');
                  setStockWarning(false);
                  return;
                }
                if (val > stockQuantity) {
                  setQty(stockQuantity);
                  setStockWarning(true);
                } else {
                  setQty(Math.max(1, val));
                  setStockWarning(false);
                }
              }}
              onBlur={() => {
                if (qty === '' || qty < 1) {
                  setQty(1);
                }
              }}
            />
            {stockQuantity > 0 ? (
              <button className="btn btn-primary detail-add-cart-btn" onClick={handleAdd}>
                <i className="fa-solid fa-cart-plus detail-cart-icon"></i> Thêm vào giỏ
              </button>
            ) : (
              <button className="btn btn-secondary detail-outofstock-btn" disabled>
                <i className="fa-solid fa-ban detail-ban-icon"></i> Đã hết hàng
              </button>
            )}
          </div>
          {stockWarning && (
            <div className="stock-warning-text" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: '500' }}>
              <i className="fa-solid fa-circle-exclamation"></i> Số lượng đặt mua đã được tự động giới hạn ở mức tối đa tồn kho ({stockQuantity} sản phẩm).
            </div>
          )}
        </div>
      </div>

      {/* PHẦN MÔ TẢ CHI TIẾT SẢN PHẨM Ở DƯỚI CĂN GIỮA TRANG */}
      <div className="product-description-section">
        <h2 className="description-section-title">MÔ TẢ CHI TIẾT SẢN PHẨM</h2>
        <div className="description-content ck-content" dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.' }} />
      </div>
    </div>
  );
};

export default ProductDetailView;
