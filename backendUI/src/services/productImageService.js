import apiClient from './apiClient';

const productImageService = {
  getByProductId: (productId) => apiClient.get(`/product-images/product/${productId}`),
  create: (data) => apiClient.post('/product-images', data),
  update: (id, data) => apiClient.put(`/product-images/${id}`, data),
  delete: (id) => apiClient.delete(`/product-images/${id}`)
};

export default productImageService;
