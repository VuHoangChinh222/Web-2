import apiClient from './apiClient';

const categoryProductService = {
  getAll: () => apiClient.get('/category-products?size=1000'),
  create: (cat) => apiClient.post('/category-products', cat),
  update: (id, cat) => apiClient.put(`/category-products/${id}`, cat),
  delete: (id) => apiClient.delete(`/category-products/${id}`)
};

export default categoryProductService;
