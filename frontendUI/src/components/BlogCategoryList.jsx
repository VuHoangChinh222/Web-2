/* 
 * BLOGCATEGORYLIST COMPONENT - DYNAMIC DATABASE API CATEGORIES
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import React, { useState, useEffect } from 'react';
import postService from '../services/postService';
import '../assets/css/BlogCategoryList.css';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const BlogCategoryList = ({ activeCategoryId, onSelectCategory, onCategoriesLoaded }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Tải danh sách chuyên mục bài viết từ Database API qua postService
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await postService.getBlogCategories();
        
        // Kiểm tra xem backend đã trả về "Tất cả bài viết" chưa
        const hasAll = (data || []).some(c => c.name === 'Tất cả bài viết');
        const dynamicCategories = hasAll ? (data || []) : [{ id: 'all', name: 'Tất cả bài viết' }, ...(data || [])];
        
        setCategories(dynamicCategories);
        if (onCategoriesLoaded) {
          onCategoriesLoaded(dynamicCategories);
        }
      } catch (err) {
        console.error("Lỗi khi tải chuyên mục bài viết:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [onCategoriesLoaded]);

  if (loading) {
    return (
      <div className="blog-category-loading">
        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Đang nạp chủ đề...
      </div>
    );
  }

  return (
    <div className="blog-category-card">
      <h5 className="blog-category-title">
        <i className="fa-solid fa-tags"></i> Chủ đề bài viết
      </h5>
      <div className="blog-category-list">
        {categories.map(cat => {
          const imageSrc = cat.id === 'all'
            ? 'src/assets/images/hero_basketball_1778727871576.png'
            : (cat.imageUrl
              ? (cat.imageUrl.startsWith('data:') || cat.imageUrl.startsWith('http://') || cat.imageUrl.startsWith('https://')
                ? cat.imageUrl
                : `${BASE_URL}${cat.imageUrl.startsWith('/') ? '' : '/'}${cat.imageUrl}`)
              : 'src/assets/images/shoe_product_1_1778727884422.png');

          return (
            <button
              key={cat.id}
              className={`blog-category-item ${activeCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className="blog-category-item-left">
                <img src={imageSrc} alt={cat.name} className="blog-category-img" />
                <span className="blog-category-name">{cat.name}</span>
              </span>
              <span className="blog-category-badge">Đọc</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BlogCategoryList;
