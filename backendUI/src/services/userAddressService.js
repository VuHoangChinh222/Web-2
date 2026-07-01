import apiClient from './apiClient';

const userAddressService = {
  getAll: () => apiClient.get('/user-addresses'),
  getByCustomer: (customerId) => apiClient.get(`/user-addresses/customer/${customerId}`),
  create: (address) => apiClient.post('/user-addresses', address),
  update: (id, address) => apiClient.put(`/user-addresses/${id}`, address),
  delete: (id) => apiClient.delete(`/user-addresses/${id}`)
};

export default userAddressService;
