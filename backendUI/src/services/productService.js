import apiClient from './apiClient';

const productService = {
  getAll: () => apiClient.get('/products?size=1000&sortDir=desc'),
  getProductById: (id) => apiClient.get(`/products/${id}`),
  create: (product) => apiClient.post('/products', product),
  update: (id, product) => apiClient.put(`/products/${id}`, product),
  delete: (id) => apiClient.delete(`/products/${id}`)
};

export default productService;
