/* 
 * HOMEVIEW COMPONENT - AUTOMATED DATABASE & API INTEGRATION (HOMEPAGE VIEW)
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import HeroBanner from '../../components/HeroBanner';
import productService from '../../services/productService';
import postService from '../../services/postService';
import FeaturedProducts from './FeaturedProducts';
import LatestBlogs from './LatestBlogs';

// Import các file CSS cần thiết
import '../../assets/css/HomeView.css';

const HomeView = ({ navigate, addToCart }) => {
  const [newestProducts, setNewestProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Tải dữ liệu Trang chủ (Top 5 sản phẩm mới, top 5 bán chạy, top 5 tin tức)
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);

        // Tải top 5 sản phẩm mới nhất
        const newestRes = await productService.getNewestProducts();
        if (newestRes && Array.isArray(newestRes)) {
          setNewestProducts(newestRes.slice(0, 5));
        }

        // Tải top 5 sản phẩm bán chạy nhất
        const sellerRes = await productService.getBestSellers();
        if (sellerRes && Array.isArray(sellerRes)) {
          setBestSellers(sellerRes.slice(0, 5));
        }

        // Tải top 5 bài viết mới nhất
        const postRes = await postService.getLatestPosts(1, 5);
        const postsArray = Array.isArray(postRes) ? postRes : (postRes?.content || postRes?.Content || postRes?.data || postRes?.Data || []);
        if (postsArray && Array.isArray(postsArray)) {
          setLatestPosts(postsArray.slice(0, 5));
        }
      } catch (err) {
        console.error("Lỗi khi đồng bộ dữ liệu trang chủ từ CSDL:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="page-transition">
      {/* SECTION 1: HERO BANNER */}
      <HeroBanner
        tag="Bộ sưu tập mới 2026"
        title={<>ELEVATE YOUR <span>GAME</span></>}
        desc="Trang bị những sản phẩm bóng rổ đỉnh cao nhất. Từ đôi giày hiệu năng cao đến trang phục chuyên nghiệp, Chinh Hoops đồng hành cùng bạn trên mọi mặt sân."
        image="src/assets/images/hero_basketball_1778727871576.png"
        buttonText="Mua Sắm Ngay"
        onButtonClick={() => navigate('products')}
      />

      {/* SECTION 3: SẢN PHẨM NỔI BẬT & BÁN CHẠY */}
      <FeaturedProducts
        loading={loading}
        newestProducts={newestProducts}
        bestSellers={bestSellers}
        navigate={navigate}
        addToCart={addToCart}
      />

      {/* SECTION 3: BẢNG TIN XU HƯỚNG THỜI TRANG (TOP 5 LATEST BLOGS) */}
      <LatestBlogs
        loading={loading}
        latestPosts={latestPosts}
        navigate={navigate}
      />
    </div>
  );
};

export default HomeView;
