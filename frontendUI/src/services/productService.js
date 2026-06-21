import axiosClient from '../axiosClient';

const mapProductFromBackend = (prod) => {
    if (!prod) return null;
    return {
        ...prod,
        price: prod.discountPrice !== undefined && prod.discountPrice !== null ? parseFloat(prod.discountPrice) : (prod.basePrice ? parseFloat(prod.basePrice) : 0),
        stockQuantity: 120, // default stock count since it is handled by variants in database
        categoryName: prod.category ? prod.category.name : 'Giày bóng rổ',
        category: prod.category ? prod.category.name : 'Giày bóng rổ',
        image: prod.thumbnail || 'src/assets/images/default_product.png',
        imageUrl: prod.thumbnail || 'src/assets/images/default_product.png',
        badge: prod.id % 3 === 0 ? 'Mới' : (prod.id % 5 === 0 ? 'Bán chạy' : null)
    };
};

const productService = {
    // API lấy tất cả sản phẩm có phân trang
    getAllProducts: (pageNumber, pageSize) => {
        const url = `/products?page=${pageNumber - 1}&size=${pageSize}`;
        return axiosClient.get(url).then(res => ({
            data: (res.content || []).map(mapProductFromBackend),
            totalPages: res.totalPages || 1
        }));
    },

    // API lọc sản phẩm theo mã danh mục có phân trang
    getProductsByCategory: (categoryId, pageNumber, pageSize) => {
        const url = `/products/category/${categoryId}?page=${pageNumber - 1}&size=${pageSize}`;
        return axiosClient.get(url).then(res => ({
            data: (res.content || []).map(mapProductFromBackend),
            totalPages: res.totalPages || 1
        }));
    },

    // API lấy chi tiết sản phẩm theo mã sản phẩm
    getProductById: (productId) => {
        const url = `/products/${productId}`;
        return axiosClient.get(url).then(mapProductFromBackend);
    },

    // API lấy chi tiết sản phẩm theo slug (SEO)
    getProductBySlug: (slug) => {
        const url = `/products/slug/${slug}`;
        return axiosClient.get(url).then(mapProductFromBackend);
    },

    // API lấy 5 sản phẩm mới nhất
    getNewestProducts: () => {
        const url = '/products?page=0&size=5&sortBy=id&sortDir=desc';
        return axiosClient.get(url).then(res => {
            const list = res.content || res || [];
            return list.map(mapProductFromBackend);
        });
    },

    // API lấy 5 sản phẩm bán chạy nhất
    getBestSellers: () => {
        const url = '/products?page=0&size=5';
        return axiosClient.get(url).then(res => {
            const list = res.content || res || [];
            return list.map(mapProductFromBackend);
        });
    }
};

export default productService;