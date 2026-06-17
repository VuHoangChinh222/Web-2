import axiosClient from '../axiosClient';

const orderService = {
    // API lấy lịch sử đơn hàng theo ID khách hàng
    getOrdersByCustomerId: (customerId) => {
        const url = `/order/customer/${customerId}`;
        return axiosClient.get(url);
    },

    // API đặt hàng (checkout đơn hàng)
    checkout: (orderData) => {
        const url = '/order/checkout';
        return axiosClient.post(url, orderData);
    }
};

export default orderService;