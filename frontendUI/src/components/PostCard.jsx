import React from 'react';
import { Link } from 'react-router-dom';

import { resolveImageUrl } from '../config';

const PostCard = ({ post }) => {
    const imageSrc = post.image || resolveImageUrl(post.imageUrl, 'src/assets/images/default_post.png');

    return (
        <Link
            to={`/blog/${post.slug || post.id}`}
            className="product-card post-card-sync"
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
                <div className="product-category">{post.categoryBlog?.name || 'Xu hướng'}</div>

                <h3 className="product-name">
                    {post.title}
                </h3>

                <div className="product-date">
                    📅 {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : '26/05/2026'}
                </div>
            </div>
        </Link>
    );
};

export default PostCard;