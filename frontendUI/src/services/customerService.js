import axiosClient from '../axiosClient';

const customerService = {
    // API Đăng nhập khách hàng (Tạm thời nhận Email và Password)
    login: (email, password) => {
        const url = '/customer/login';
        return axiosClient.post(url, { email, password });
    },

    // API Đăng ký tài khoản khách hàng mới
    register: (customerData) => {
        const url = '/customer/register';
        return axiosClient.post(url, customerData);
    }
};

export default customerService;