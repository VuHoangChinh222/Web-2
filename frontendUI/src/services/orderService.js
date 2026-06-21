import axiosClient from '../axiosClient';

const orderService = {
    // API lấy lịch sử đơn hàng theo ID khách hàng
    getOrdersByCustomerId: (customerId) => {
        const url = `/orders/customer/${customerId}?size=1000`;
        return axiosClient.get(url).then(res => res.content || res);
    },

    // API đặt hàng (checkout đơn hàng)
    checkout: (orderData) => {
        const url = '/orders';
        return axiosClient.post(url, orderData);
    }
};

export default orderService;