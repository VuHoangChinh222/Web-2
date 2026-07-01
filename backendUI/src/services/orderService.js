import apiClient from './apiClient';

const orderService = {
  getAll: () => apiClient.get('/orders?size=1000'),
  getAllDetails: () => apiClient.get('/order-details?size=1000'),
  create: (order) => apiClient.post('/orders', order),
  createDetail: (detail) => apiClient.post('/order-details', detail),
  update: (id, order) => apiClient.put(`/orders/${id}`, order),
  delete: (id) => apiClient.delete(`/orders/${id}`),
  deleteDetail: (id) => apiClient.delete(`/order-details/${id}`)
};

export default orderService;
