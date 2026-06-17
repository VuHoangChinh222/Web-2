/* 
 * HOMEVIEW COMPONENT - AUTOMATED DATABASE & API INTEGRATION (HOMEPAGE VIEW)
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import PostCard from '../../components/PostCard';
import HeroBanner from '../../components/HeroBanner';
import productService from '../../services/productService';
import postService from '../../services/postService';

// Import các file CSS cần thiết
import '../../assets/css/HomeView.css';

const HomeView = ({ navigate }) => {
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
        const bestRes = await productService.getBestSellers();
        if (bestRes && Array.isArray(bestRes)) {
          setBestSellers(bestRes.slice(0, 5));
        }

        // Tải top 5 bài viết mới nhất
        const postsRes = await postService.getLatestPosts(1, 5);
        const postsArray = postsRes.data || postsRes;
        if (postsArray && Array.isArray(postsArray)) {
          setLatestPosts(postsArray.slice(0, 5));
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
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

      {/* SECTION 2: GỢI Ý MUA SẮM THÔNG MINH (TOP 5 MỚI & BÁN CHẠY) */}
      <section className="featured-sections" style={{ padding: '3rem 4%', display: 'flex', flexDirection: 'column', gap: '4rem' }}>

        {loading ? (
          <div className="loading-text">
            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Đang tải dữ liệu trang chủ...
          </div>
        ) : (
          <>
            {/* Khối 1: Top 5 sản phẩm mới nhất */}
            {newestProducts.length > 0 && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">⭐ SẢN PHẨM MỚI NHẤT</h2>
                  <p className="section-desc">Top 5 sản phẩm cực hot vừa cập bến cửa hàng</p>
                </div>
                <div className="products-grid-5-columns">
                  {newestProducts.map(product => (
                    <ProductCard key={product.id} product={{ ...product, badge: 'MỚI' }} navigate={navigate} />
                  ))}
                </div>
              </div>
            )}

            {/* Khối 2: Top 5 sản phẩm bán chạy nhất */}
            {bestSellers.length > 0 && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">🔥 BÁN CHẠY NHẤT</h2>
                  <p className="section-desc">Những sản phẩm được đông đảo cầu thủ tin dùng dựa trên số lượng đã bán</p>
                </div>
                <div className="products-grid-5-columns">
                  {bestSellers.map(product => (
                    <ProductCard key={product.id} product={{ ...product, badge: 'HOT' }} navigate={navigate} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </section>

      {/* SECTION 3: BẢNG TIN XU HƯỚNG THỜI TRANG (TOP 5 LATEST BLOGS) */}
      {!loading && latestPosts.length > 0 && (
        <section id="posts-sec" style={{ padding: '3rem 4%', background: 'var(--bg-card-dark, rgba(0,0,0,0.2))', borderTop: '1px solid var(--border-color)' }}>
          <div className="section-header">
            <h2 className="section-title">📰 BẢNG TIN XU HƯỚNG</h2>
            <p className="section-desc">Khám phá các mẹo bổ ích, xu hướng thời trang & kiến thức thể thao mới nhất</p>
          </div>
          <div className="products-grid-5-columns">
            {latestPosts.map(post => {
              const displayTitle = post.title.length > 50
                ? post.title.substring(0, 47) + '...'
                : post.title;
              return (
                <PostCard
                  key={post.id}
                  post={{ ...post, title: displayTitle }}
                  navigate={navigate}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomeView;
