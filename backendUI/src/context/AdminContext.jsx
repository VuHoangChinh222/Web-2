import React, { createContext, useContext, useState, useEffect } from 'react';
import bannerService from '../services/bannerService';
import categoryProductService from '../services/categoryProductService';
import categoryBlogService from '../services/categoryBlogService';
import customerService from '../services/customerService';
import orderService from '../services/orderService';
import blogService from '../services/blogService';
import productService from '../services/productService';
import userService from '../services/userService';
import roleService from '../services/roleService';
import userAddressService from '../services/userAddressService';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('chinh_admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const AdminProvider = ({ children }) => {
  // --- States ---
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('chinh_admin_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [customers, setCustomers] = useState([]);
  const [categoriesProduct, setCategoriesProduct] = useState([]);
  const [categoriesBlog, setCategoriesBlog] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [banners, setBanners] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Core Loading Hook ---

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);

      // Fetch Roles
      try {
        const rolesData = await roleService.getAll();
        setRoles(rolesData || []);
      } catch (e) {
        console.error("Error fetching roles:", e);
      }

      // Fetch Users
      try {
        const usersData = await userService.getAll();
        setUsers(usersData.content || []);
      } catch (e) {
        console.error("Error fetching users:", e);
      }

      // Fetch Customers
      try {
        const customersData = await customerService.getAll();
        setCustomers(customersData.content || []);
      } catch (e) {
        console.error("Error fetching customers:", e);
      }

      // Fetch Product Categories
      try {
        const catProdData = await categoryProductService.getAll();
        setCategoriesProduct(catProdData.content || []);
      } catch (e) {
        console.error("Error fetching product categories:", e);
      }

      // Fetch Blog Categories
      try {
        const catBlogData = await categoryBlogService.getAll();
        setCategoriesBlog(catBlogData.content || []);
      } catch (e) {
        console.error("Error fetching blog categories:", e);
      }

      // Fetch Products
      try {
        const productsData = await productService.getAll();
        setProducts(productsData.content || []);
      } catch (e) {
        console.error("Error fetching products:", e);
      }

      // Fetch Orders
      try {
        const ordersData = await orderService.getAll();
        setOrders(ordersData.content || []);
      } catch (e) {
        console.error("Error fetching orders:", e);
      }

      // Fetch Order Details
      try {
        const detailsData = await orderService.getAllDetails();
        setOrderDetails(detailsData.content || []);
      } catch (e) {
        console.error("Error fetching order details:", e);
      }

      // Fetch Banners
      try {
        const bannersData = await bannerService.getAll();
        setBanners(bannersData || []);
      } catch (e) {
        console.error("Error fetching banners:", e);
      }

      // Fetch Blogs
      try {
        const blogsData = await blogService.getAll();
        setBlogs(blogsData.content || []);
      } catch (e) {
        console.error("Error fetching blogs:", e);
      }

      // Fetch User Addresses
      try {
        const addrData = await userAddressService.getAll();
        setUserAddresses(addrData || []);
      } catch (e) {
        console.error("Error fetching user addresses:", e);
      }

    } catch (error) {
      console.error("General error loading admin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Auth Operations
  const login = async (username, password) => {
    try {
      const res = await userService.login({ username, password });

      if (res && res.token) {
        localStorage.setItem('chinh_admin_token', res.token);

        // Load user profile from the list of users
        const usersPage = await userService.getAll();
        const usersList = usersPage.content || [];
        const foundUser = usersList.find(u => u.username === username);

        if (foundUser) {
          const mappedUser = {
            id: foundUser.id,
            username: foundUser.username,
            fullname: foundUser.fullName || foundUser.username,
            email: foundUser.email,
            phone: foundUser.phone || '',
            roleId: foundUser.role ? foundUser.role.id : null,
            role: foundUser.role ? {
              id: foundUser.role.id,
              name: foundUser.role.name,
              description: foundUser.role.description,
              permissions: foundUser.role.permissions || []
            } : null,
            active: foundUser.status === 1,
            avatar: foundUser.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
            status: foundUser.status
          };
          if (!mappedUser.active) {
            localStorage.removeItem('chinh_admin_token');
            return { success: false, message: 'Tài khoản của bạn đã bị khóa.' };
          }
          setCurrentUser(mappedUser);
          localStorage.setItem('chinh_admin_session', JSON.stringify(mappedUser));
          return { success: true };
        } else {
          // Fallback user setting
          const fallbackUser = {
            id: 1,
            username: res.username,
            fullname: res.fullName,
            role: {
              name: 'ROLE_ADMIN',
              permissions: [
                'dashboard_view',
                'manage_product',
                'manage_categoryproduct',
                'manage_productvariant',
                'manage_productimage',
                'manage_order',
                'manage_orderdetail',
                'manage_customer',
                'manage_categoryblog',
                'manage_blog',
                'manage_banner',
                'manage_user',
                'manage_role'
              ]
            },
            active: true
          };
          setCurrentUser(fallbackUser);
          localStorage.setItem('chinh_admin_session', JSON.stringify(fallbackUser));
          return { success: true };
        }
      }
      return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu.' };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message || 'Lỗi kết nối tới Server.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('chinh_admin_session');
    localStorage.removeItem('chinh_admin_token');
  };

  // Upload image to backend static folder
  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = `${API_BASE}/uploads/image`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          ...getAuthHeaders()
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }
      return await response.text();
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      throw err;
    }
  };

  const resolveImageUrl = (url, defaultImage = '') => {
    if (!url) return defaultImage;
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
    return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  };

  // --- EXPOSE STATES AND SETTERS ONLY ---

  return (
    <AdminContext.Provider value={{
      roles,
      setRoles,
      users,
      setUsers,
      customers,
      setCustomers,
      categoriesProduct,
      setCategoriesProduct,
      categoriesBlog,
      setCategoriesBlog,
      products,
      setProducts,
      orders,
      setOrders,
      orderDetails,
      setOrderDetails,
      banners,
      setBanners,
      blogs,
      setBlogs,
      userAddresses,
      setUserAddresses,
      loading,
      setLoading,
      currentUser,
      setCurrentUser,
      login,
      logout,
      uploadImage,
      resolveImageUrl
    }}>
      {children}
    </AdminContext.Provider>
  );
};
