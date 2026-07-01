/* 
 * FEATURED PRODUCTS SECTION - HOMEPAGE
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import React from 'react';
import ProductCard from '../../components/ProductCard';
import IsLoading from '../../components/IsLoading';

const FeaturedProducts = ({ loading, newestProducts, bestSellers, navigate, addToCart }) => {
  return (
    <section className="featured-sections" style={{ padding: '3rem 4%', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {loading ? (
        <IsLoading message="Đang tải dữ liệu trang chủ..." />
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
                  <ProductCard key={product.id} product={{ ...product, badge: 'MỚI' }} navigate={navigate} addToCart={addToCart} />
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
                  <ProductCard key={product.id} product={{ ...product, badge: 'HOT' }} navigate={navigate} addToCart={addToCart} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default FeaturedProducts;
