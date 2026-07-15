import axios from 'axios';
import { API_BASE_URL } from './config';
import { getCookie } from './utils/cookieHelper';

// Khởi tạo một thực thể axios với cấu hình base chung
const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // Thời gian tối đa chờ phản hồi từ server (60 giây cho Render Free Tier)
});

// Thêm Request Interceptor để tự động đính kèm JWT Token vào Header
axiosClient.interceptors.request.use(
    (config) => {
        const token = getCookie('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        // Nếu phản hồi thành công, bóc tách lấy thẳng cục data bên trong dữ liệu JSON
        return response.data;
    },
    (error) => {
        // Xử lý lỗi tập trung tại đây (Ví dụ: Server sập, lỗi 404, lỗi 500)
        console.error('Lỗi kết nối API:', error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;

