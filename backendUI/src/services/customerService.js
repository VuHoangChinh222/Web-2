import apiClient from './apiClient';

const customerService = {
  getAll: () => apiClient.get('/customers?size=1000'),
  create: (customer) => apiClient.post('/customers', customer),
  update: (id, customer) => apiClient.put(`/customers/${id}`, customer),
  delete: (id) => apiClient.delete(`/customers/${id}`)
};

export default customerService;
