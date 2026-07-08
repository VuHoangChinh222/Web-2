import axiosClient from '../axiosClient';

const productVariantService = {
    // API Lấy danh sách tất cả các biến thể
    getAllVariants: (pageNumber = 1, pageSize = 10, sortBy = 'id', sortDir = 'asc') => {
        const url = `/product-variants?page=${pageNumber - 1}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;
        return axiosClient.get(url);
    },

    // API Lấy danh sách biến thể của một Sản phẩm cụ thể
    getVariantsByProductId: (productId, pageNumber = 1, pageSize = 100, sortBy = 'id', sortDir = 'asc') => {
        const url = `/product-variants/product/${productId}?page=${pageNumber - 1}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;
        return axiosClient.get(url);
    },

    // API lấy chi tiết một biến thể
    getVariantById: (id) => {
        const url = `/product-variants/${id}`;
        return axiosClient.get(url);
    }
};

export default productVariantService;
