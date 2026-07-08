import axiosClient from '../axiosClient';

const userAddressService = {
    getByCustomerId: (customerId) => {
        const url = `/user-addresses/customer/${customerId}`;
        return axiosClient.get(url);
    },

    create: (addressData) => {
        const url = '/user-addresses';
        return axiosClient.post(url, addressData);
    },

    update: (id, addressData) => {
        const url = `/user-addresses/${id}`;
        return axiosClient.put(url, addressData);
    },

    delete: (id) => {
        const url = `/user-addresses/${id}`;
        return axiosClient.delete(url);
    }
};

export default userAddressService;
