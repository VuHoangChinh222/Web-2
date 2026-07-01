import apiClient from './apiClient';

const roleService = {
  getAll: () => apiClient.get('/roles'),
  create: (roleObj) => apiClient.post('/roles', roleObj),
  update: (id, roleObj) => apiClient.put(`/roles/${id}`, roleObj),
  delete: (id) => apiClient.delete(`/roles/${id}`),
  updatePermissions: (id, roleObj) => apiClient.put(`/roles/${id}`, roleObj)
};

export default roleService;
