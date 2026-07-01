/* 
 * LATEST BLOGS SECTION - HOMEPAGE
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import React from 'react';
import PostCard from '../../components/PostCard';

const LatestBlogs = ({ loading, latestPosts, navigate }) => {
  if (loading || latestPosts.length === 0) return null;

  return (
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
  );
};

export default LatestBlogs;
