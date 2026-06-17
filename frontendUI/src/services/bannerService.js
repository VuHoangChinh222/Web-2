/* 
 * BANNERSERVICE - DATABASE API INTEGRATION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import axiosClient from '../axiosClient';

const bannerService = {
  // Lấy danh sách banner đang hiển thị (Status = 1)
  getActiveBanners: () => {
    return axiosClient.get('/banners');
  }
};

export default bannerService;
