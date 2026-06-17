/* 
 * APP COMPONENT - CORE ROUTING SYSTEM WITH REACT ROUTER DOM
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './pages/Home/Index';
import ProductView from './pages/Product/Index';
import ProductDetailView from './pages/Product/Detail';
import CartView from './pages/Cart/Index';
import CheckoutView from './pages/Checkout/Index';
import PaymentView from './pages/Checkout/PaymentView';
import SearchView from './pages/Search/Index';
import LoginView from './pages/Login/Index';
import RegisterView from './pages/Register/Index';
import UserInfoView from './pages/User/Index';
import AboutView from './pages/About/Index';
import PostDetailView from './pages/Blog/Detail';
import BlogView from './pages/Blog/Index';

// Wrapper Component để xử lý giỏ hàng, định tuyến và truyền props kế thừa cho các View
const AppContent = ({ cart, addToCart, updateQty, removeFromCart, clearCart }) => {
  const routerNavigate = useNavigate();
  const location = useLocation();

  // Tự động cuộn trang lên đầu mỗi khi chuyển đổi URL
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
          <Route path="/" element={<HomeView navigate={navigate} />} />
          <Route path="/home" element={<HomeView navigate={navigate} />} />

          <Route path="/products" element={<ProductsRoute navigate={navigate} />} />
          <Route path="/product/:id" element={<ProductDetailRoute navigate={navigate} addToCart={addToCart} />} />

          <Route path="/blog" element={<BlogView navigate={navigate} />} />
          <Route path="/blog/:id" element={<PostDetailRoute navigate={navigate} />} />

          <Route path="/cart" element={<CartView cart={cart} updateQty={updateQty} removeFromCart={removeFromCart} navigate={navigate} />} />
          <Route path="/checkout" element={<CheckoutView cart={cart} clearCart={clearCart} navigate={navigate} />} />
          <Route path="/payment" element={<PaymentView navigate={navigate} clearCart={clearCart} />} />

          <Route path="/search" element={<SearchView navigate={navigate} />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/user" element={<UserInfoView navigate={navigate} />} />
          <Route path="/about" element={<AboutView />} />

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
const ProductsRoute = ({ navigate }) => {
  const [searchParams] = useSearchParams();
  const categoryIdVal = searchParams.get('categoryId');
  // Chuyển đổi định dạng ID sang số nguyên nếu hợp lệ
  const categoryId = categoryIdVal ? (isNaN(Number(categoryIdVal)) ? categoryIdVal : Number(categoryIdVal)) : undefined;

  return <ProductView params={{ categoryId }} navigate={navigate} />;
};

// Route wrapper cho trang chi tiết sản phẩm
const ProductDetailRoute = ({ navigate, addToCart }) => {
  const { id } = useParams();
  return <ProductDetailView params={{ slug: id }} navigate={navigate} addToCart={addToCart} />;
};

// Route wrapper cho trang chi tiết bài viết
const PostDetailRoute = ({ navigate }) => {
  const { id } = useParams();
  // Chuyển đổi ID bài viết sang định dạng số nguyên
  const postId = id ? Number(id) : 0;

  return <PostDetailView id={postId} navigate={navigate} />;
};

// Component chính App bao bọc Router ngoài cùng
const App = () => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, size, qty) => {
    const existing = cart.find(item => item.id === product.id && item.size === size);
    if (existing) {
      setCart(cart.map(item => item.cartId === existing.cartId ? { ...item, qty: item.qty + qty } : item));
    } else {
      setCart([...cart, { ...product, size, qty, cartId: Date.now() + Math.random() }]);
    }
  };

  const updateQty = (cartId, newQty) => {
    if (newQty < 1) removeFromCart(cartId);
    else setCart(cart.map(item => item.cartId === cartId ? { ...item, qty: newQty } : item));
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
    </Router>
  );
};

export default App;
