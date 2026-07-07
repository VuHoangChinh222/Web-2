import apiClient from './apiClient';

const productImageService = {
  getByProductId: (productId) => apiClient.get(`/product-images/product/${productId}`),
  create: (data) => apiClient.post('/product-images', data),
  delete: (id) => apiClient.delete(`/product-images/${id}`)
};

export default productImageService;
