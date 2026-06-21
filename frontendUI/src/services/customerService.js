import axiosClient from '../axiosClient';

const customerService = {
    // API Đăng nhập khách hàng
    login: (email, password) => {
        const url = '/customers/login';
        return axiosClient.post(url, { email, password });
    },

    // API Đăng ký tài khoản khách hàng mới
    register: (customerData) => {
        const url = '/customers/register';
        return axiosClient.post(url, customerData);
    }
};

export default customerService;