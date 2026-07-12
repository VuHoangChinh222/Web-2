/* 
 * APP COMPONENT - CORE ROUTING SYSTEM WITH REACT ROUTER DOM
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề WEB 2 & ReactJS
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import { getCookie } from './utils/cookieHelper';
import HomeView from './pages/Home/Index';
import ProductView from './pages/Product/Index';
import ProductDetailView from './pages/Product/Detail';
import CartView from './pages/Cart/Index';
import CheckoutView from './pages/Checkout/Index';
import PaymentView from './pages/Checkout/PaymentView';
import LoginView from './pages/Login/Index';
import RegisterView from './pages/Register/Index';
import ForgotPasswordView from './pages/ForgotPassword/ForgotPassword';
import UserInfoView from './pages/User/Index';
import UserInfo from './pages/User/UserInfo';
import AddressManagement from './pages/User/AddressManagement';
import AboutView from './pages/About/Index';
import PostDetailView from './pages/Blog/Detail';
import BlogView from './pages/Blog/Index';
import ReturnPolicyView from './pages/ReturnPolicy/Index';
import PrivacyPolicyView from './pages/PrivacyPolicy/Index';
import SizeGuideView from './pages/SizeGuide/Index';

// Wrapper Component để xử lý giỏ hàng, định tuyến và truyền props kế thừa cho các View
const AppContent = ({ cart, addToCart, updateQty, removeFromCart, clearCart }) => {
  const routerNavigate = useNavigate();
  const location = useLocation();

  // Tự động cuộn trang lên đầu mỗi khi chuyển đổi URL
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Xử lý các sản phẩm chờ mua/thêm vào giỏ sau khi đăng nhập thành công
  useEffect(() => {
    const customer = getCookie('customer');
    if (!customer) return;

    // 1. Kiểm tra sản phẩm chờ thêm vào giỏ hàng
    const pendingCart = localStorage.getItem('pending_cart_item');
    if (pendingCart) {
      try {
        const item = JSON.parse(pendingCart);
        if (item && item.product) {
          addToCart(item.product, item.size, item.qty);
          localStorage.removeItem('pending_cart_item');
          alert(`Đã tự động thêm sản phẩm "${item.product.name}" vào giỏ hàng của bạn!`);
          routerNavigate('/cart');
        }
      } catch (e) {
        console.error("Lỗi parse pending_cart_item:", e);
        localStorage.removeItem('pending_cart_item');
      }
      return;
    }

    // 2. Kiểm tra sản phẩm chờ "Mua ngay"
    const pendingBuy = localStorage.getItem('pending_buy_now');
    if (pendingBuy) {
      try {
        const item = JSON.parse(pendingBuy);
        if (item && item.product) {
          addToCart(item.product, item.size, item.qty);
          localStorage.removeItem('pending_buy_now');
          routerNavigate('/checkout');
        }
      } catch (e) {
        console.error("Lỗi parse pending_buy_now:", e);
        localStorage.removeItem('pending_buy_now');
      }
    }
  }, [routerNavigate]);

  // Bộ chuyển đổi điều hướng tương thích ngược với thiết kế `navigate('viewName', params)` cũ của dự án
  const navigate = (name, params = {}) => {
    let path = '/' + name;
    if (name === 'home') path = '/';

    // Ánh xạ sang các đường dẫn URL đẹp bằng React Router DOM
    if (name === 'detail') {
      const idOrSlug = params.slug || params.id;
      routerNavigate(`/product/${idOrSlug}`);
      return;
    }
    if (name === 'postDetail') {
      const id = params.id;
      routerNavigate(`/blog/${id}`);
      return;
    }

    // Gắn tham số truy vấn (Query Parameters) nếu có
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (key !== 'slug' && key !== 'id') {
        query.set(key, params[key]);
      }
    });
    const queryString = query.toString();
    routerNavigate(queryString ? `${path}?${queryString}` : path);
  };

  // Tính toán view hiện tại dựa trên địa chỉ URL để phục vụ đánh dấu Active Menu trên Header
  const getActiveView = () => {
    const pathname = location.pathname;
    if (pathname === '/' || pathname === '/home') {
      return { name: 'home' };
    }

    // Lấy phần tử gốc trong URL làm tên view (ví dụ: /product/123 -> product)
    const firstSegment = pathname.replace(/^\//, '').split('/')[0];

    // Đồng bộ tên view để tô sáng đúng menu trên Header
    if (firstSegment === 'product') return { name: 'products' };
    if (firstSegment === 'products') return { name: 'products' };
    if (firstSegment === 'blog') return { name: 'blog' };

    return { name: firstSegment };
  };

  const currentView = getActiveView();

  return (
    <div>
      {/* Thanh điều hướng đầu trang */}
      <Header
        currentView={currentView}
        navigate={navigate}
        cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
      />

      {/* Khu vực phân phối nội dung động dựa vào URL */}
      <main>
        <Routes>
          <Route path="/" element={<HomeView navigate={navigate} addToCart={addToCart} />} />
          <Route path="/home" element={<HomeView navigate={navigate} addToCart={addToCart} />} />

          <Route path="/products" element={<ProductsRoute navigate={navigate} addToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetailRoute navigate={navigate} addToCart={addToCart} />} />

          <Route path="/blog" element={<BlogView navigate={navigate} />} />
          <Route path="/blog/:id" element={<PostDetailRoute navigate={navigate} />} />

          <Route path="/cart" element={<CartView cart={cart} updateQty={updateQty} removeFromCart={removeFromCart} navigate={navigate} />} />
          <Route path="/checkout" element={<CheckoutView cart={cart} clearCart={clearCart} navigate={navigate} />} />
          <Route path="/payment" element={<PaymentView navigate={navigate} clearCart={clearCart} cart={cart} />} />

          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/user" element={<UserInfoView navigate={navigate} />} />
          <Route path="/user-info" element={<UserInfo navigate={navigate} />} />
          <Route path="/addresses" element={<AddressManagement navigate={navigate} />} />
          <Route path="/about" element={<AboutView />} />
          <Route path="/return-policy" element={<ReturnPolicyView />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyView />} />
          <Route path="/size-guide" element={<SizeGuideView />} />

          {/* Xử lý lỗi 404 không tìm thấy trang */}
          <Route path="*" element={
            <div className="container text-center py-5 my-5" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/580/580185.png"
                alt="404"
                className="mb-4"
                style={{ width: '100px', opacity: 0.6 }}
              />
              <h2 className="fw-bold text-secondary">404 - KHÔNG TÌM THẤY TRANG</h2>
              <p className="text-muted">Đường dẫn bạn truy cập không tồn tại trên hệ thống.</p>
              <button onClick={() => navigate('home')} className="btn btn-primary btn-sm mt-2" style={{ borderRadius: '20px', padding: '8px 24px' }}>
                Quay lại Trang Chủ
              </button>
            </div>
          } />
        </Routes>
      </main>

      {/* Chân trang */}
      <Footer navigate={navigate} />
    </div>
  );
};

// Route wrapper cho trang danh sách sản phẩm để trích xuất CategoryId từ Query String
const ProductsRoute = ({ navigate, addToCart }) => {
  const [searchParams] = useSearchParams();
  const categoryIdVal = searchParams.get('categoryId');
  const keyword = searchParams.get('keyword') || undefined;
  // Chuyển đổi định dạng ID sang số nguyên nếu hợp lệ
  const categoryId = categoryIdVal ? (isNaN(Number(categoryIdVal)) ? categoryIdVal : Number(categoryIdVal)) : undefined;

  return <ProductView params={{ categoryId, keyword }} navigate={navigate} addToCart={addToCart} />;
};

// Route wrapper cho trang chi tiết sản phẩm
const ProductDetailRoute = ({ navigate, addToCart }) => {
  const { id } = useParams();
  return <ProductDetailView params={{ slug: id }} navigate={navigate} addToCart={addToCart} />;
};

// Route wrapper cho trang chi tiết bài viết
const PostDetailRoute = ({ navigate }) => {
  const { id } = useParams();
  return <PostDetailView params={{ slug: id }} navigate={navigate} />;
};

// Component chính App bao bọc Router ngoài cùng
const App = () => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, size, qty, suppressAlert = false) => {
    // Tính tổng số lượng sản phẩm này đã có trong giỏ hàng (không phân biệt kích cỡ)
    const currentQtyInCart = cart
      .filter(item => item.id === product.id)
      .reduce((sum, item) => sum + item.qty, 0);

    const newTotalQty = currentQtyInCart + qty;
    const stockLimit = product.stockQuantity !== undefined && product.stockQuantity !== null ? product.stockQuantity : 0;

    if (newTotalQty > stockLimit) {
      if (!suppressAlert) {
        alert(`Số lượng đặt mua vượt quá số lượng hàng tồn kho của sản phẩm (${stockLimit} sản phẩm)!`);
      }
      return false;
    }

    const existing = cart.find(item => item.id === product.id && item.size === size && (item.color || 'Mặc định') === (product.color || 'Mặc định'));
    if (existing) {
      setCart(cart.map(item => item.cartId === existing.cartId ? { ...item, qty: existing.qty + qty } : item));
    } else {
      setCart([...cart, { ...product, size, qty, cartId: Date.now() + Math.random() }]);
    }
    return true;
  };

  const updateQty = (cartId, newQty) => {
    if (newQty === '') {
      setCart(cart.map(item => item.cartId === cartId ? { ...item, qty: '' } : item));
      return;
    }
    if (newQty < 1) {
      removeFromCart(cartId);
      return;
    }

    const targetItem = cart.find(item => item.cartId === cartId);
    if (!targetItem) return;

    // Tính tổng số lượng của sản phẩm này ở các dòng khác (khác size) trong giỏ hàng
    const otherQty = cart
      .filter(item => item.id === targetItem.id && item.cartId !== cartId)
      .reduce((sum, item) => sum + item.qty, 0);

    const newTotalQty = otherQty + newQty;
    const stockLimit = targetItem.stockQuantity !== undefined && targetItem.stockQuantity !== null ? targetItem.stockQuantity : 0;

    if (newTotalQty > stockLimit) {
      const maxAllowedForThisItem = Math.max(0, stockLimit - otherQty);
      alert(`Số lượng đặt mua vượt quá số lượng hàng tồn kho của sản phẩm (${stockLimit} sản phẩm)!`);
      setCart(cart.map(item => item.cartId === cartId ? { ...item, qty: maxAllowedForThisItem } : item));
      return;
    }

    setCart(cart.map(item => item.cartId === cartId ? { ...item, qty: newQty } : item));
  };

  const removeFromCart = (cartId) => setCart(cart.filter(item => item.cartId !== cartId));
  const clearCart = () => setCart([]);

  return (
    <Router>
      <AppContent
        cart={cart}
        addToCart={addToCart}
        updateQty={updateQty}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
      />
      {/* Trợ lý AI Chatbot tư vấn bán hàng - Đặt ở đây để tránh bị bẫy bởi CSS transform của phần tử con */}
      <ChatWidget />
    </Router>
  );
};

export default App;
