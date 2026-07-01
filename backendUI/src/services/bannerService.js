import apiClient from './apiClient';

const bannerService = {
  getAll: () => apiClient.get('/banners'),
  create: (banner) => apiClient.post('/banners', banner),
  update: (id, banner) => apiClient.put(`/banners/${id}`, banner),
  delete: (id) => apiClient.delete(`/banners/${id}`)
};

export default bannerService;
