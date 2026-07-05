import axiosClient from '../axiosClient';

const orderService = {
    // API lấy lịch sử đơn hàng theo ID khách hàng
    getOrdersByCustomerId: (customerId) => {
        const url = `/orders/customer/${customerId}`;
        return axiosClient.get(url);
    },

    // API đặt hàng (checkout đơn hàng)
    checkout: (orderData) => {
        const url = '/orders';
        return axiosClient.post(url, orderData);
    },

    // API lấy chi tiết một đơn hàng (bao gồm danh sách mặt hàng và tổng tiền)
    getOrderDetailById: (orderId) => {
        const url = `/order-details/order/${orderId}`;
        return axiosClient.get(url);
    }
};

export default orderService;