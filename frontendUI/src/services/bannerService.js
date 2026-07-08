/* 
 * BANNERSERVICE - DATABASE API INTEGRATION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề WEB 2 & ReactJS
 */

import axiosClient from '../axiosClient';

const bannerService = {
  // Lấy danh sách banner đang hiển thị (Status = 1) và sắp xếp theo vị trí
  getActiveBanners: () => {
    return axiosClient.get('/banners/active');
  }
};

export default bannerService;
