import apiClient from './apiClient';

const productVariantService = {
  // Lấy tất cả biến thể của 1 sản phẩm
  getByProductId: (productId, page = 0, size = 100) => {
    return apiClient.get(`/product-variants/product/${productId}?page=${page}&size=${size}`);
  },

  // Lấy chi tiết 1 biến thể
  getById: (id) => {
    return apiClient.get(`/product-variants/${id}`);
  },

  // Tạo mới biến thể
  create: (data) => {
    return apiClient.post('/product-variants', data);
  },

  createBulk: (dataArray) => {
    return apiClient.post('/product-variants/bulk', dataArray);
  },

  // Cập nhật biến thể
  update: (id, data) => {
    return apiClient.put(`/product-variants/${id}`, data);
  },

  // Xóa biến thể
  delete: (id) => {
    return apiClient.delete(`/product-variants/${id}`);
  }
};

export default productVariantService;
