import axiosClient from '../axiosClient';

const paymentService = {
    // Gọi API để lấy đường dẫn thanh toán VNPay
    createVnPayPayment: (orderId) => {
        return axiosClient.post(`/payment/vnpay/create?orderId=${orderId}`);
    },

    // Gọi API để xác thực chữ ký kết quả thanh toán từ VNPay
    verifyVnPayReturn: (params) => {
        const queryStr = new URLSearchParams(params).toString();
        return axiosClient.get(`/payment/vnpay/verify-return?${queryStr}`);
    }
};

export default paymentService;
