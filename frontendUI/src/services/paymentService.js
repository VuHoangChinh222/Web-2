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
    },

    // Gọi API để lấy đường dẫn thanh toán MoMo
    createMomoPayment: (orderId, requestType = 'captureWallet') => {
        return axiosClient.post(`/payment/momo/create?orderId=${orderId}&requestType=${requestType}`);
    },

    // Gọi API để xác thực chữ ký kết quả thanh toán từ MoMo
    verifyMomoReturn: (params) => {
        const queryStr = new URLSearchParams(params).toString();
        return axiosClient.get(`/payment/momo/verify-return?${queryStr}`);
    }
};

export default paymentService;
