
import { Link } from 'react-router-dom';

export const productsData = [
  { id: 1, name: 'Ignite Red X', category: 'Giày bóng rổ', price: 3500000, image: 'src/assets/images/shoe_product_1_1778727884422.png', badge: 'Mới', desc: 'Đôi giày bứt phá mọi giới hạn tốc độ. Thiết kế ôm sát cổ chân, đế đệm bật nảy cực cao, giúp bạn thực hiện những pha lên rổ hoàn hảo.' },
  { id: 2, name: 'Velocity HX-1 Neo', category: 'Giày bóng rổ', price: 4200000, image: 'src/assets/images/shoe_product_2_1778727899404.png', badge: 'Bán chạy', desc: 'Trang bị công nghệ viền đèn Neon ẩn, Velocity HX-1 mang đến vẻ ngoài đến từ tương lai cùng hiệu năng đỉnh cao. Chất liệu siêu nhẹ hỗ trợ bứt tốc.' },
  { id: 3, name: 'Nights Owl Jersey', category: 'Áo', price: 1200000, image: 'src/assets/images/shirt_product_1778727913549.png', badge: 'Limited', desc: 'Áo đấu phiên bản giới hạn "Nights Owl" với chất liệu siêu thoáng khí, công nghệ dệt 3D giúp thấm hút mồ hôi cực tốt trong các trận đấu căng thẳng.' },
  { id: 4, name: 'Elite Performance Shorts', category: 'Quần', price: 850000, image: 'src/assets/images/pants_product_1778727928285.png', badge: 'Hot', desc: 'Quần short siêu nhẹ, viền sọc cam đặc trưng. Form chuẩn dành cho những pha di chuyển mượt mà trên sân.' },
  { id: 5, name: 'Nike Classic Elite Socks', category: 'Vớ', price: 350000, image: 'src/assets/images/socks_product_1778727946646.png', desc: 'Vớ bóng rổ dày dặn, đệm lót ở gót và mũi chân hỗ trợ giảm chấn thương vùng mắt cá và bàn chân tối đa.' }
];


export const categories = ['Tất cả', 'Giày bóng rổ', 'Áo', 'Quần', 'Vớ'];

export const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const ProductCard = ({ product }) => {
  const imageSrc = product.image || (product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `https://localhost:7291${product.imageUrl}`) : 'src/assets/images/default_product.png');

  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className="product-card"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {product.badge && <div className="product-badge">{product.badge}</div>}
      <div className="product-img">
        <img src={imageSrc} alt={product.name} />
        <div className="product-action">
          <button type="button">
            <i className="fa-solid fa-eye"></i> Xem chi tiết
          </button>
        </div>
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">{formatPrice(product.price)}</div>
      </div>
    </Link>
  );
};

export default ProductCard;
