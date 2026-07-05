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
    },

    // API Cập nhật thông tin tài khoản khách hàng
    updateCustomer: (id, customerData) => {
        const url = `/customers/${id}`;
        return axiosClient.put(url, customerData);
    },

    // API Quên mật khẩu khách hàng
    forgotPassword: (email) => {
        const url = '/customers/forgot-password';
        return axiosClient.post(url, { email });
    }
};

export default customerService;