/* 
 * ISLOADING COMPONENT - REUSABLE HIGH-END LOADING COMPONENT WITH TIMEOUT DETECTION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import React, { useState, useEffect } from 'react';
import '../assets/css/IsLoading.css';

const IsLoading = ({ message = 'Đang tải dữ liệu...' }) => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Thiết lập bộ đếm thời gian 30 giây (30000ms) để theo dõi kết nối mạng
    const timer = setTimeout(() => {
      setIsSlowConnection(true);
    }, 30000);

    // Dọn dẹp bộ đếm khi dữ liệu tải xong và component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="loading-container">
      <div className="loading-spinner-wrapper">
        <div className="loading-spinner"></div>
        <div className="loading-spinner-inner"></div>
      </div>
      <div className="loading-text">
        {message}
      </div>
      {isSlowConnection && (
        <div className="loading-warning">
          <i className="fa-solid fa-circle-exclamation"></i> Kết nối không ổn định
        </div>
      )}
    </div>
  );
};

export default IsLoading;
