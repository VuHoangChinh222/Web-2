import axiosClient from '../axiosClient';

const mapBlogFromBackend = (blog) => {
    if (!blog) return null;
    return {
        ...blog,
        categoryName: blog.categoryBlog ? blog.categoryBlog.name : 'Xu hướng',
        createdDate: blog.createdAt || '2026-06-21T00:00:00Z',
        image: blog.thumbnail || 'src/assets/images/default_post.png',
        imageUrl: blog.thumbnail || 'src/assets/images/default_post.png'
    };
};

const postService = {
  // 1. API lấy danh sách bài viết mới nhất (Có phân trang)
  getLatestPosts: (pageNumber = 1, pageSize = 5) => {
    const url = `/blogs?page=${pageNumber - 1}&size=${pageSize}`;
    return axiosClient.get(url).then(res => ({
      data: (res.content || []).map(mapBlogFromBackend),
      totalPages: res.totalPages || 1
    }));
  },

  // 2. API lấy chi tiết bài viết theo ID
  getPostById: (id) => {
    const url = `/blogs/${id}`;
    return axiosClient.get(url).then(mapBlogFromBackend);
  },

  // 3. API lấy tất cả danh sách chuyên mục bài viết (Category)
  getBlogCategories: () => {
    const url = '/category-blogs?size=1000';
    return axiosClient.get(url).then(res => res.content || res);
  },

  // 4. API lọc danh sách bài viết theo chuyên mục (Có phân trang)
  getPostsByCategory: (categoryId, pageNumber = 1, pageSize = 5) => {
    const url = `/blogs/category/${categoryId}?page=${pageNumber - 1}&size=${pageSize}`;
    return axiosClient.get(url).then(res => ({
      data: (res.content || []).map(mapBlogFromBackend),
      totalPages: res.totalPages || 1
    }));
  }
};

export default postService;