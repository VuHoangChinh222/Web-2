import axiosClient from '../axiosClient';

const productImageService = {
  getByProductId: (productId) => {
    return axiosClient.get(`/product-images/product/${productId}`);
  }
};

export default productImageService;
