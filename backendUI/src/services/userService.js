import apiClient from './apiClient';

const userService = {
  getAll: () => apiClient.get('/users?size=1000'),
  create: (user) => apiClient.post('/users', user),
  update: (id, user) => apiClient.put(`/users/${id}`, user),
  delete: (id) => apiClient.delete(`/users/${id}`),
  login: (credentials) => apiClient.post('/auth/login', credentials)
};

export default userService;
