import apiClient from './apiClient';

const categoryBlogService = {
  getAll: () => apiClient.get('/category-blogs?size=1000'),
  create: (cat) => apiClient.post('/category-blogs', cat),
  update: (id, cat) => apiClient.put(`/category-blogs/${id}`, cat),
  delete: (id) => apiClient.delete(`/category-blogs/${id}`)
};

export default categoryBlogService;
