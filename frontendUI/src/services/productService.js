import axiosClient from '../axiosClient';

const productService = {
    // API lấy tất cả sản phẩm có phân trang
    getAllProducts: (pageNumber, pageSize) => {
        const url = `/product?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        return axiosClient.get(url);
    },

    // API lọc sản phẩm theo mã danh mục có phân trang
    getProductsByCategory: (categoryId, pageNumber, pageSize) => {
        const url = `/product/category/${categoryId}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        return axiosClient.get(url);
    },

    // API lấy chi tiết sản phẩm theo mã sản phẩm
    getProductById: (productId) => {
        const url = `/product/${productId}`;
        return axiosClient.get(url);
    },

    // API lấy chi tiết sản phẩm theo slug (SEO)
    getProductBySlug: (slug) => {
        const url = `/product/slug/${slug}`;
        return axiosClient.get(url);
    },

    // API lấy 5 sản phẩm mới nhất
    getNewestProducts: () => {
        const url = '/product/newest';
        return axiosClient.get(url);
    },

    // API lấy 5 sản phẩm bán chạy nhất
    getBestSellers: () => {
        const url = '/product/best-sellers';
        return axiosClient.get(url);
    }
};

export default productService;