import axiosClient from '../axiosClient';

const paymentService = {
    // Gọi API để lấy đường dẫn thanh toán VNPay
    createVnPayPayment: (orderId) => {
        const returnUrl = window.location.origin + '/payment-result?gateway=vnpay';
        return axiosClient.post(`/payment/vnpay/create?orderId=${orderId}&returnUrl=${encodeURIComponent(returnUrl)}`);
    },

    // Gọi API để xác thực chữ ký kết quả thanh toán từ VNPay
    verifyVnPayReturn: (params) => {
        const queryStr = new URLSearchParams(params).toString();
        return axiosClient.get(`/payment/vnpay/verify-return?${queryStr}`);
    },

    // Gọi API để lấy đường dẫn thanh toán MoMo
    createMomoPayment: (orderId, requestType = 'captureWallet') => {
        const redirectUrl = window.location.origin + '/payment-result?gateway=momo';
        return axiosClient.post(`/payment/momo/create?orderId=${orderId}&requestType=${requestType}&redirectUrl=${encodeURIComponent(redirectUrl)}`);
    },

    // Gọi API để xác thực chữ ký kết quả thanh toán từ MoMo
    verifyMomoReturn: (params) => {
        const queryStr = new URLSearchParams(params).toString();
        return axiosClient.get(`/payment/momo/verify-return?${queryStr}`);
    }
};

export default paymentService;
