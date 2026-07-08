import axiosClient from '../axiosClient';

const categoryProductService = {
    /**
     * Hàm lấy toàn bộ danh mục SẢN PHẨM từ Backend
     * Endpoint này kết nối tới CategoryProductController trong WEB 2
     */
    getAllCategoryProducts: () => {
        // Đường dẫn định tuyến khớp chính xác với cấu trúc định tuyến [Route("api/[controller]")] của Backend
        const url = '/category-products';
        return axiosClient.get(url);
    }
};

export default categoryProductService;
