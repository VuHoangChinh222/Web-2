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

    // API Lấy chi tiết thông tin khách hàng
    getCustomerById: (id) => {
        const url = `/customers/${id}`;
        return axiosClient.get(url);
    },

    // API Quên mật khẩu khách hàng
    forgotPassword: (email) => {
        const url = '/customers/forgot-password';
        return axiosClient.post(url, { email });
    },

    // API Đặt lại mật khẩu khách hàng bằng token
    resetPassword: (token, password) => {
        const url = '/customers/reset-password';
        return axiosClient.post(url, { token, password });
    },

    // API Đăng nhập bằng tài khoản Google
    googleLogin: (idToken) => {
        const url = '/customers/google-login';
        return axiosClient.post(url, { idToken });
    }
};

export default customerService;