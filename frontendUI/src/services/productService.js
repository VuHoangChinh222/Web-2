import axiosClient from '../axiosClient';

const productService = {
    // API lấy tất cả sản phẩm có phân trang và bộ lọc nâng cao
    getAllProducts: (pageNumber, pageSize, keyword = '', minPrice = null, maxPrice = null, categoryId = null) => {
        let url = `/products?page=${pageNumber > 0 ? pageNumber - 1 : 0}&size=${pageSize}`;
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
        const url = `/products/category/${categoryId}?page=${pageNumber > 0 ? pageNumber - 1 : 0}&size=${pageSize}`;
        return axiosClient.get(url);
    },

    // API lấy chi tiết sản phẩm theo mã sản phẩm
    getProductById: (productId) => {
        const url = `/products/${productId}`;
        return axiosClient.get(url);
    },

    // API lấy chi tiết sản phẩm theo slug (SEO)
    getProductBySlug: (slug) => {
        const url = `/products/slug/${slug}`;
        return axiosClient.get(url);
    },

    // API lấy 5 sản phẩm mới nhất
    getNewestProducts: () => {
        const url = '/products/newest';
        return axiosClient.get(url);
    },

    // API lấy 5 sản phẩm bán chạy nhất
    getBestSellers: () => {
        const url = '/products/best-sellers';
        return axiosClient.get(url);
    }
};

export default productService;