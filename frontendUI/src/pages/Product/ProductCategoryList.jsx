/* 
 * PRODUCTCATEGORYLIST COMPONENT - DYNAMIC DATABASE API CATEGORIES
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề WEB 2 & ReactJS
 */

import React, { useState, useEffect } from 'react';
import categoryProductService from '../../services/categoryProductService';
import '../../assets/css/productCSS/ProductCategoryList.css';

import { resolveImageUrl } from '../../config';

const ProductCategoryList = ({ activeCategoryId, onSelectCategory, onCategoriesLoaded }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Tải danh sách chuyên mục sản phẩm từ Database API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryProductService.getAllCategoryProducts();
        const categoryList = Array.isArray(data) ? data : (data?.content || data?.Content || []);

        // Kiểm tra xem backend đã trả về "Tất cả sản phẩm" chưa
        const hasAll = categoryList.some(c => c.name === 'Tất cả sản phẩm');
        const dynamicCategories = hasAll ? categoryList : [{ id: 'all', name: 'Tất cả sản phẩm' }, ...categoryList];

        setCategories(dynamicCategories);
        if (onCategoriesLoaded) {
          onCategoriesLoaded(dynamicCategories);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh mục sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [onCategoriesLoaded]);

  if (loading) {
    return (
      <div className="product-category-loading">
        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Đang nạp danh mục...
      </div>
    );
  }

  return (
    <div className="product-category-card">
      <h5 className="product-category-title">
        <i className="fa-solid fa-tags"></i> Danh mục sản phẩm
      </h5>
      <div className="product-category-list">
        {categories.map(cat => {
          const imageSrc = cat.id === 'all'
            ? 'src/assets/images/hero_basketball_1778727871576.png'
            : resolveImageUrl(cat.imageUrl, 'src/assets/images/shoe_product_1_1778727884422.png');

          return (
            <button
              key={cat.id}
              className={`product-category-item ${activeCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className="product-category-item-left">
                <img src={imageSrc} alt={cat.name} className="product-category-img" />
                <span className="product-category-name">{cat.name}</span>
              </span>
              <span className="product-category-badge">Xem</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductCategoryList;
