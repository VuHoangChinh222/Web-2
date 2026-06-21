import axiosClient from '../axiosClient';

const categoryProductService = {
    /**
     * Hàm lấy toàn bộ danh mục SẢN PHẨM từ Backend
     */
    getAllCategoryProducts: () => {
        const url = '/category-products?size=1000';
        return axiosClient.get(url).then(res => res.content || res);
    }
};

export default categoryProductService;
