/* 
 * POSTSERVICE - DATABASE API INTEGRATION
 * Sinh viên: Vũ Hoàng Chính
 * Môn học: Chuyên đề WEB 2 & ReactJS
 */

import axiosClient from '../axiosClient';

const postService = {
  // 1. API lấy danh sách bài viết mới nhất (Có phân trang)
  getLatestPosts: (pageNumber = 1, pageSize = 5, keyword = '') => {
    const url = `/blogs?page=${pageNumber - 1}&size=${pageSize}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`;
    return axiosClient.get(url);
  },

  // 2. API lấy chi tiết bài viết theo ID
  getPostById: (id) => {
    const url = `/blogs/${id}`;
    return axiosClient.get(url);
  },

  // 3. API lấy tất cả danh sách chuyên mục bài viết (Category)
  getBlogCategories: () => {
    const url = '/category-blogs';
    return axiosClient.get(url);
  },

  // 4. API lọc danh sách bài viết theo chuyên mục (Có phân trang)
  getPostsByCategory: (categoryId, pageNumber = 1, pageSize = 5) => {
    const url = `/blogs/category/${categoryId}?page=${pageNumber - 1}&size=${pageSize}`;
    return axiosClient.get(url);
  },

  // 5. API lấy chi tiết bài viết theo slug (SEO)
  getPostBySlug: (slug) => {
    const url = `/blogs/slug/${slug}`;
    return axiosClient.get(url);
  }
};

export default postService;