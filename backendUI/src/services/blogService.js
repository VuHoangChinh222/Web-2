import apiClient from './apiClient';

const blogService = {
  getAll: () => apiClient.get('/blogs?size=1000'),
  create: (blog) => apiClient.post('/blogs', blog),
  update: (id, blog) => apiClient.put(`/blogs/${id}`, blog),
  delete: (id) => apiClient.delete(`/blogs/${id}`)
};

export default blogService;
