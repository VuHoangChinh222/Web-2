import { useState, useEffect } from 'react';
import postService from '../../services/postService';
import IsLoading from '../../components/IsLoading';

// Import css
import '../../assets/css/PostDetailView.css';

import { IMAGE_BASE_URL, resolveImageUrl } from '../../config';

// Cấu hình URL Backend để lấy hình ảnh từ wwwroot/uploads
const BASE_URL = IMAGE_BASE_URL;



const PostDetailView = ({ params, navigate }) => {
    const slug = params?.slug;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Gọi API lấy dữ liệu bài viết chi tiết khi trang được nạp hoặc ID/Slug thay đổi
    useEffect(() => {
        if (!slug) return;

        setLoading(true);
        const isNumeric = !isNaN(Number(slug));
        const fetchPromise = isNumeric
            ? postService.getPostById(Number(slug))
            : postService.getPostBySlug(slug);

        fetchPromise
            .then(data => {
                setPost(data);
                setLoading(false);
                // Cuộn màn hình lên đầu trang để người dùng đọc từ đầu bài
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .catch(err => {
                console.error("Lỗi khi tải chi tiết bài viết:", err);
                setError("Không thể tải nội dung bài viết này hoặc bài viết không tồn tại.");
                setLoading(false);
            });
    }, [slug]);

    // Hàm bổ trợ xử lý ghép link domain Backend cho ảnh
    const processImage = (imageUrl) => {
        return resolveImageUrl(imageUrl, '');
    };

    // 1. Trạng thái đang tải dữ liệu
    if (loading) {
        return <IsLoading message="Đang tải nội dung bài viết chi tiết..." />;
    }

    // 2. Trạng thái xảy ra lỗi (Không tìm thấy ID)
    if (error || !post) {
        return (
            <div style={{ textAlign: 'center', padding: '10rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
                <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}></i>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Xảy Ra Lỗi!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || "Đã xảy ra sự cố không mong muốn."}</p>
                <button
                    onClick={() => navigate('home')} // Hoặc navigate('/') tùy cơ chế router của bạn
                    style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600' }}
                >
                    Quay lại Trang Chủ
                </button>
            </div>
        );
    }

    // 3. Giao diện chi tiết bài viết chuẩn Dark Mode
    return (
        <div className="page-transition" style={{ padding: '2rem 4%', maxWidth: '900px', margin: '0 auto' }}>

            {/* Nút quay lại */}
            <button
                onClick={() => navigate('home')}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '15px',
                    fontWeight: '500',
                    marginBottom: '2rem',
                    transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
            >
                <i className="fa-solid fa-arrow-left"></i> Quay lại tin tức
            </button>

            {/* Khung bài viết tổng quát */}
            <article style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>

                {/* Chuyên mục & Ngày tháng */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {post.categoryName || 'Xu hướng'}
                    </span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }}></span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        📅 {post.createdDate ? new Date(post.createdDate).toLocaleDateString('vi-VN') : '26/05/2026'}
                    </span>
                </div>

                {/* Tiêu đề lớn bài viết */}
                <h1 style={{
                    fontSize: '2.2rem',
                    fontWeight: '8xl',
                    lineHeight: '1.3',
                    color: 'var(--text-main)',
                    marginBottom: '2rem',
                    textTransform: 'none', // Giữ nguyên chữ hoa/thường nguyên bản của tiêu đề bài viết
                    letterSpacing: 'normal'
                }}>
                    {post.title}
                </h1>

                {/* Hình ảnh Banner đại diện bài viết */}
                {post.imageUrl && (
                    <div style={{ width: '100%', height: '450px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2.5rem', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}>
                        <img
                            src={processImage(post.imageUrl)}
                            alt={post.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                )}

                {/* Vùng hiển thị nội dung chi tiết bài viết (Hỗ trợ HTML Render) */}
                <div
                    className="post-detail-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    style={{
                        color: 'var(--text-main)',
                        fontSize: '16px',
                        lineHeight: '1.8',
                        textAlign: 'justify'
                    }}
                />

            </article>
        </div>
    );
};

export default PostDetailView;