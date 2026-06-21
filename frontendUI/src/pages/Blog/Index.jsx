/* 
 * BLOGVIEW COMPONENT - DEDICATED BLOG PORTAL WITH DYNAMIC CATEGORY FILTER & PAGINATION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCategoryList from '../../components/BlogCategoryList';
import PostCard from '../../components/PostCard';
import postService from '../../services/postService';

// Import CSS
import '../../assets/css/BlogView.css';

const BlogView = ({ navigate }) => {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6; // 6 bài viết mỗi trang để grid cân đối

  // States dành cho Slider bài viết nổi bật (Bản tin mới nhất)
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  // Mảng chứa chuyên mục bài viết để tìm chuyên mục "Tất cả bài viết" từ DB
  const [categories, setCategories] = useState([]);

  // Reset trang về 1 khi đổi chuyên mục lọc
  const handleCategorySelect = (categoryId) => {
    setActiveCategoryId(categoryId);
    setCurrentPage(1);
  };

  // Nạp 5 bài viết mới nhất cho Slider khi load trang
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await postService.getLatestPosts(1, 5);
        if (response) {
          setFeaturedPosts(response.data || response.Data || []);
        }
      } catch (err) {
        console.error("Lỗi khi tải bài viết nổi bật:", err);
      }
    };
    fetchFeatured();
  }, []);

  // Tự động chuyển slide sau mỗi 5 giây
  useEffect(() => {
    if (featuredPosts.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % featuredPosts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredPosts]);

  // Nạp bài viết từ API khi thay đổi chuyên mục hoặc trang hiện tại
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let response;

        // Tìm ID của chuyên mục "Tất cả bài viết" từ DB nếu có
        const allCat = categories.find(c => c.name === 'Tất cả bài viết');
        const allCatId = allCat ? allCat.id : 'all';

        if (activeCategoryId === 'all' || activeCategoryId === allCatId) {
          response = await postService.getLatestPosts(currentPage, pageSize);
        } else {
          response = await postService.getPostsByCategory(activeCategoryId, currentPage, pageSize);
        }

        if (response) {
          setPosts(response.data || response.Data || []);
          setTotalPages(response.totalPages || response.TotalPages || 1);
        } else {
          setPosts([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách bài viết:", err);
        setPosts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeCategoryId, currentPage]);

  return (
    <div className="blog-view-container page-transition">
      {/* BANNER HERO SLIDER - 5 HÌNH ẢNH BẢN TIN MỚI NHẤT */}
      {featuredPosts.length > 0 ? (
        <div className="blog-hero-slider">
          {featuredPosts.map((post, index) => {
            const imageSrc = post.image || (post.imageUrl
              ? (post.imageUrl.startsWith('data:') || post.imageUrl.startsWith('http://') || post.imageUrl.startsWith('https://')
                ? post.imageUrl
                : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}${post.imageUrl.startsWith('/') ? '' : '/'}${post.imageUrl}`)
              : 'src/assets/images/default_post.png');

            return (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className={`blog-slide ${index === activeSlide ? 'active' : ''}`}
                style={{ backgroundImage: `url(${imageSrc})`, textDecoration: 'none', color: 'inherit' }}
              >
                <div className="blog-slide-overlay"></div>
                <div className="blog-slide-content">
                  <span className="blog-slide-tag">{post.categoryName || 'Bản Tin Mới Nhất'}</span>
                  <h1 className="blog-slide-title">{post.title}</h1>
                  <p className="blog-slide-desc">Nhấn vào đây để xem chi tiết bài viết và cập nhật xu hướng bóng rổ mới nhất.</p>
                  <div className="blog-slide-meta">
                    <span>📅 {post.createdDate ? new Date(post.createdDate).toLocaleDateString('vi-VN') : '26/05/2026'}</span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Nút điều hướng Slider */}
          <button className="slider-control prev" onClick={(e) => { e.stopPropagation(); setActiveSlide(prev => (prev - 1 + featuredPosts.length) % featuredPosts.length); }}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button className="slider-control next" onClick={(e) => { e.stopPropagation(); setActiveSlide(prev => (prev + 1) % featuredPosts.length); }}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          {/* Dots hiển thị vị trí */}
          <div className="slider-dots">
            {featuredPosts.map((_, index) => (
              <span
                key={index}
                className={`slider-dot ${index === activeSlide ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setActiveSlide(index); }}
              ></span>
            ))}
          </div>
        </div>
      ) : (
        <div className="blog-hero">
          <h1>BẢNG TIN <span>XU HƯỚNG</span></h1>
          <p>Cập nhật những tin tức bóng rổ mới nhất, chia sẻ kinh nghiệm tập luyện và xu hướng thời trang thể thao đỉnh cao.</p>
        </div>
      )}

      <div className="blog-layout">
        {/* CỘT TRÁI: DANH MỤC CHỦ ĐỀ (BÀI TẬP TỰ LÀM BUỔI 8) */}
        <aside className="blog-sidebar">
          <BlogCategoryList
            activeCategoryId={activeCategoryId}
            onSelectCategory={handleCategorySelect}
            onCategoriesLoaded={setCategories}
          />
        </aside>

        {/* CỘT PHẢI: GRID BÀI VIẾT VÀ PHÂN TRANG */}
        <main className="blog-main">
          {loading ? (
            <div className="blog-loading">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span>Đang tải các bài viết...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="blog-empty">
              <i className="fa-regular fa-folder-open"></i>
              <p>Hiện chưa có bài viết nào thuộc chủ đề này.</p>
            </div>
          ) : (
            <>
              {/* Grid 3 cột bài viết */}
              <div className="blog-grid">
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    navigate={navigate}
                  />
                ))}
              </div>

              {/* BỘ PHÂN TRANG ĐỘNG (Dữ liệu từ database API) */}
              {totalPages > 1 && (
                <div className="blog-pagination">
                  <button
                    className="blog-page-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <i className="fa-solid fa-chevron-left"></i> Trước
                  </button>

                  <span className="blog-page-info">
                    Trang {currentPage} / {totalPages}
                  </span>

                  <button
                    className="blog-page-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Tiếp <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default BlogView;
