import React from 'react';
import { Link } from 'react-router-dom';

import { resolveImageUrl } from '../config';

const PostCard = ({ post }) => {
    const imageSrc = post.image || resolveImageUrl(post.imageUrl, 'src/assets/images/default_post.png');

    return (
        <Link
            to={`/blog/${post.slug || post.id}`}
            className="product-card post-card-sync"
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            {/* Phần hình ảnh bài viết */}
            <div className="product-img">
                <img src={imageSrc} alt={post.title} />
                <div className="product-action">
                    <button type="button">
                        <i className="fa-solid fa-eye"></i> Xem chi tiết
                    </button>
                </div>
            </div>

            {/* Phần thông tin chữ (giữ nguyên giao diện Dark Mode đồng bộ) */}
            <div className="product-info">
                <div className="product-category">{post.categoryName || 'Xu hướng'}</div>

                <h3 className="product-name" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '44px',
                    lineHeight: '1.4',
                    textTransform: 'none',
                    letterSpacing: 'normal',
                    margin: '8px 0'
                }}>
                    {post.title}
                </h3>

                <div className="product-date" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📅 {post.createdDate ? new Date(post.createdDate).toLocaleDateString('vi-VN') : '26/05/2026'}
                </div>
            </div>
        </Link>
    );
};

export default PostCard;