import { getCookie } from '../utils/cookieHelper';
import '../assets/css/productCSS/ProductCard.css';
import { IMAGE_BASE_URL, resolveImageUrl } from '../config';

export const productsData = [
  { id: 1, name: 'Ignite Red X', category: 'Giày bóng rổ', price: 3500000, image: 'src/assets/images/shoe_product_1_1778727884422.png', badge: 'Mới', desc: 'Đôi giày bứt phá mọi giới hạn tốc độ. Thiết kế ôm sát cổ chân, đế đệm bật nảy cực cao, giúp bạn thực hiện những pha lên rổ hoàn hảo.' },
  { id: 2, name: 'Velocity HX-1 Neo', category: 'Giày bóng rổ', price: 4200000, image: 'src/assets/images/shoe_product_2_1778727899404.png', badge: 'Bán chạy', desc: 'Trang bị công nghệ viền đèn Neon ẩn, Velocity HX-1 mang đến vẻ ngoài đến từ tương lai cùng hiệu năng đỉnh cao. Chất liệu siêu nhẹ hỗ trợ bứt tốc.' },
  { id: 3, name: 'Nights Owl Jersey', category: 'Áo', price: 1200000, image: 'src/assets/images/shirt_product_1778727913549.png', badge: 'Limited', desc: 'Áo đấu phiên bản giới hạn "Nights Owl" với chất liệu siêu thoáng khí, công nghệ dệt 3D giúp thấm hút mồ hôi cực tốt trong các trận đấu căng thẳng.' },
  { id: 4, name: 'Elite Performance Shorts', category: 'Quần', price: 850000, image: 'src/assets/images/pants_product_1778727928285.png', badge: 'Hot', desc: 'Quần short siêu nhẹ, viền sọc cam đặc trưng. Form chuẩn dành cho những pha di chuyển mượt mà trên sân.' },
  { id: 5, name: 'Nike Classic Elite Socks', category: 'Vớ', price: 350000, image: 'src/assets/images/socks_product_1778727946646.png', desc: 'Vớ bóng rổ dày dặn, đệm lót ở gót và mũi chân hỗ trợ giảm chấn thương vùng mắt cá và bàn chân tối đa.' }
];

export const categories = ['Tất cả', 'Giày bóng rổ', 'Áo', 'Quần', 'Vớ'];

export const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const ProductCard = ({ product, addToCart, navigate }) => {
  const imageSrc = resolveImageUrl(product.image || product.imageUrl, 'src/assets/images/default_product.png');
  const categoryName = product.categoryName || product.category || '';
  const stock = product.stockQuantity !== undefined && product.stockQuantity !== null ? product.stockQuantity : 99;

  const handleCardClick = () => {
    navigate('detail', { slug: product.slug || product.id });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (stock <= 0) {
      alert("Sản phẩm đã hết hàng!");
      return;
    }

    let defaultSize = 'M';
    if (categoryName.toLowerCase().includes('giày') || categoryName.toLowerCase().includes('shoe')) {
      defaultSize = 'US 8';
    } else if (categoryName.toLowerCase().includes('vớ') || categoryName.toLowerCase().includes('tất')) {
      defaultSize = 'Free';
    }

    const productForCart = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageSrc,
      categoryName: categoryName,
      stockQuantity: stock
    };

    const customer = getCookie('customer');
    if (!customer) {
      alert("Hệ thống bảo mật: Bạn chưa đăng nhập. Hệ thống sẽ tự động thêm sản phẩm này vào giỏ sau khi bạn đăng nhập thành công!");
      localStorage.setItem('pending_cart_item', JSON.stringify({ product: productForCart, size: defaultSize, qty: 1 }));
      navigate('login');
      return;
    }

    addToCart(productForCart, defaultSize, 1);
    alert(`Đã thêm sản phẩm "${product.name}" vào giỏ hàng thành công!`);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();

    if (stock <= 0) {
      alert("Sản phẩm đã hết hàng!");
      return;
    }

    let defaultSize = 'M';
    if (categoryName.toLowerCase().includes('giày') || categoryName.toLowerCase().includes('shoe')) {
      defaultSize = 'US 8';
    } else if (categoryName.toLowerCase().includes('vớ') || categoryName.toLowerCase().includes('tất')) {
      defaultSize = 'Free';
    }

    const productForCart = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageSrc,
      categoryName: categoryName,
      stockQuantity: stock
    };

    const customer = getCookie('customer');
    if (!customer) {
      alert("Hệ thống bảo mật: Bạn chưa đăng nhập. Hệ thống sẽ tự động đưa bạn đến trang Đặt hàng sau khi bạn đăng nhập thành công!");
      localStorage.setItem('pending_buy_now', JSON.stringify({ product: productForCart, size: defaultSize, qty: 1 }));
      navigate('login');
      return;
    }

    addToCart(productForCart, defaultSize, 1);
    navigate('checkout');
  };

  return (
    <div
      onClick={handleCardClick}
      className="product-card"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {product.badge && <div className="product-badge">{product.badge}</div>}
      <div className="product-img">
        <img src={imageSrc} alt={product.name} />
        <div className="product-action" style={{ gap: '8px', padding: '10px' }}>
          <button
            type="button"
            onClick={handleAddToCart}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              color: '#f8fafc',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#334155';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1e293b';
            }}
          >
            <i className="fa-solid fa-cart-plus"></i> Giỏ hàng
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              backgroundColor: 'var(--accent)',
              border: 'none',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
          >
            <i className="fa-solid fa-bolt"></i> Mua ngay
          </button>
        </div>
      </div>
      <div className="product-info">
        <div className="product-category">{categoryName}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">{formatPrice(product.price)}</div>
      </div>
    </div>
  );
};

export default ProductCard;
