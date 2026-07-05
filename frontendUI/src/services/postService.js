/* 
 * POSTSERVICE - DATABASE API INTEGRATION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề ASP.NET Core & ReactJS
 */

import axiosClient from '../axiosClient';

const postService = {
  // 1. API lấy danh sách bài viết mới nhất (Có phân trang)
  // 1. API lấy danh sách bài viết mới nhất (Có phân trang)
  getLatestPosts: (pageNumber = 1, pageSize = 5, keyword = '') => {
    const url = `/post?pageNumber=${pageNumber}&pageSize=${pageSize}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`;
    return axiosClient.get(url);
  },

  // 2. API lấy chi tiết bài viết theo ID
  getPostById: (id) => {
    const url = `/post/${id}`;
    return axiosClient.get(url);
  },

  // 3. API lấy tất cả danh sách chuyên mục bài viết (Category)
  getBlogCategories: () => {
    const url = '/post/categories';
    return axiosClient.get(url);
  },

  // 4. API lọc danh sách bài viết theo chuyên mục (Có phân trang)
  getPostsByCategory: (categoryId, pageNumber = 1, pageSize = 5) => {
    const url = `/post/category/${categoryId}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return axiosClient.get(url);
  },

  // 5. API lấy chi tiết bài viết theo slug (SEO)
  getPostBySlug: (slug) => {
    const url = `/post/slug/${slug}`;
    return axiosClient.get(url);
  }
};

export default postService;