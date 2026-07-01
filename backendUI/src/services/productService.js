import apiClient from './apiClient';

const productService = {
  getAll: () => apiClient.get('/products?size=1000'),
  create: (product) => apiClient.post('/products', product),
  update: (id, product) => apiClient.put(`/products/${id}`, product),
  delete: (id) => apiClient.delete(`/products/${id}`)
};

export default productService;
