import axiosClient from '../axiosClient';

const productService = {
    // API lấy tất cả sản phẩm có phân trang và bộ lọc nâng cao
    getAllProducts: (pageNumber, pageSize, keyword = '', minPrice = null, maxPrice = null, categoryId = null) => {
        let url = `/product?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        if (minPrice !== null && minPrice !== undefined && minPrice !== '') {
            url += `&minPrice=${minPrice}`;
        }
        if (maxPrice !== null && maxPrice !== undefined && maxPrice !== '') {
            url += `&maxPrice=${maxPrice}`;
        }
        if (categoryId !== null && categoryId !== undefined && categoryId !== 'all') {
            url += `&categoryId=${categoryId}`;
        }
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