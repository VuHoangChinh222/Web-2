/* 
 * HEROBANNER COMPONENT - REUSABLE HIGH-END HERO COMPONENT
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import React, { useState, useEffect } from 'react';
import bannerService from '../services/bannerService';
import '../assets/css/HeroBanner.css';

import { IMAGE_BASE_URL } from '../config';

const BASE_URL = IMAGE_BASE_URL;

const HeroBanner = ({ tag, title, desc, image, buttonText, onButtonClick }) => {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    bannerService.getActiveBanners()
      .then(data => {
        if (isMounted && data && Array.isArray(data)) {
          setBanners(data);
        }
      })
      .catch(err => {
        console.error("Lỗi khi tải danh sách banner từ API:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Tự động chuyển slide mỗi 6 giây nếu có nhiều hơn 1 banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex(prev => (prev + 1) % banners.length);
  };

  // 1. Trường hợp có banner từ Database
  if (banners.length > 0) {
    return (
      <div className="hero-banner-container slider-mode">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`hero-banner-slide ${index === activeIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${getImageUrl(banner.imageUrl)})` }}
          >
            <div className="hero-banner-overlay"></div>
            <div className="hero-banner-content">
              <span className="hero-banner-tag">Khuyến mãi & Tin tức</span>
              <h1 className="hero-banner-title">
                {banner.name}
              </h1>
              {banner.description && <p className="hero-banner-desc">{banner.description}</p>}
            </div>
          </div>
        ))}

        {/* Nút chuyển slide */}
        {banners.length > 1 && (
          <>
            <button className="hero-banner-control prev" onClick={handlePrev} aria-label="Slide trước">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="hero-banner-control next" onClick={handleNext} aria-label="Slide sau">
              <i className="fa-solid fa-chevron-right"></i>
            </button>

            {/* Dots */}
            <div className="hero-banner-dots">
              {banners.map((_, index) => (
                <span
                  key={index}
                  className={`hero-banner-dot ${index === activeIndex ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
                ></span>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // 2. Fallback sang chế độ truyền Props tĩnh
  return (
    <div className="hero-banner-container" style={{ backgroundImage: `url(${image})` }}>
      <div className="hero-banner-overlay"></div>
      <div className="hero-banner-content">
        {tag && <span className="hero-banner-tag">{tag}</span>}
        {title && <h1 className="hero-banner-title">{title}</h1>}
        {desc && <p className="hero-banner-desc">{desc}</p>}
        {buttonText && (
          <button className="btn btn-primary hero-banner-btn" onClick={onButtonClick}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
