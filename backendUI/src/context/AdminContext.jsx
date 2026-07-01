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

  // --- CRUD ACTIONS ---

  // Products
  const addProduct = async (body) => {
    try {
      const newProduct = await productService.create(body);
      setProducts(prev => [newProduct, ...prev]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm sản phẩm: " + err.message);
      return { success: false, error: err.message };
    }
  };

  const updateProduct = async (id, body) => {
    try {
      const updated = await productService.update(id, body);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật sản phẩm: " + err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa sản phẩm: " + err.message);
      return false;
    }
  };

  // Product Categories
  const addCategoryProduct = async (body) => {
    try {
      const newCat = await categoryProductService.create(body);
      setCategoriesProduct(prev => [...prev, newCat]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm danh mục sản phẩm: " + err.message);
      return { success: false };
    }
  };

  const updateCategoryProduct = async (id, body) => {
    try {
      const updated = await categoryProductService.update(id, body);
      setCategoriesProduct(prev => prev.map(c => c.id === id ? updated : c));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi sửa danh mục sản phẩm: " + err.message);
      return { success: false };
    }
  };

  const deleteCategoryProduct = async (id) => {
    try {
      await categoryProductService.delete(id);
      setCategoriesProduct(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa danh mục sản phẩm: " + err.message);
      return false;
    }
  };

  // Blog Categories
  const addCategoryBlog = async (body) => {
    try {
      const newCat = await categoryBlogService.create(body);
      setCategoriesBlog(prev => [...prev, newCat]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm danh mục bài viết: " + err.message);
      return { success: false };
    }
  };

  const updateCategoryBlog = async (id, body) => {
    try {
      const updated = await categoryBlogService.update(id, body);
      setCategoriesBlog(prev => prev.map(c => c.id === id ? updated : c));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi sửa danh mục bài viết: " + err.message);
      return { success: false };
    }
  };

  const deleteCategoryBlog = async (id) => {
    try {
      await categoryBlogService.delete(id);
      setCategoriesBlog(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa danh mục bài viết: " + err.message);
      return false;
    }
  };

  // Orders
  const addOrder = async (body) => {
    try {
      const newOrder = await orderService.create(body);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo đơn hàng: " + err.message);
      return null;
    }
  };

  const addOrderDetail = async (body) => {
    try {
      const newDetail = await orderService.createDetail(body);
      setOrderDetails(prev => [...prev, newDetail]);
      return newDetail;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const updateOrder = async (id, body) => {
    try {
      const updated = await orderService.update(id, body);
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật đơn hàng: " + err.message);
      return { success: false };
    }
  };

  const deleteOrder = async (id) => {
    try {
      await orderService.delete(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa đơn hàng: " + err.message);
      return false;
    }
  };

  const deleteOrderDetail = async (id) => {
    try {
      await orderService.deleteDetail(id);
      setOrderDetails(prev => prev.filter(d => d.id !== id));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa sản phẩm khỏi đơn hàng: " + err.message);
      return { success: false };
    }
  };

  // Customers
  const addCustomer = async (body) => {
    try {
      const newCustomer = await customerService.create(body);
      setCustomers(prev => [...prev, newCustomer]);
      return { success: true, data: newCustomer };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm khách hàng: " + err.message);
      return { success: false };
    }
  };

  const updateCustomer = async (id, body) => {
    try {
      const updated = await customerService.update(id, body);
      setCustomers(prev => prev.map(c => c.id === id ? updated : c));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật khách hàng: " + err.message);
      return { success: false };
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await customerService.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa khách hàng: " + err.message);
      return false;
    }
  };

  // User Addresses
  const addUserAddress = async (body) => {
    try {
      const newAddr = await userAddressService.create(body);
      setUserAddresses(prev => [...prev, newAddr]);
      return newAddr;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const updateUserAddress = async (id, body) => {
    try {
      const updated = await userAddressService.update(id, body);
      setUserAddresses(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Users
  const addUser = async (body) => {
    try {
      const newUser = await userService.create(body);
      setUsers(prev => [...prev, newUser]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm người dùng: " + err.message);
      return { success: false };
    }
  };

  const updateUser = async (id, body) => {
    try {
      const updated = await userService.update(id, body);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật người dùng: " + err.message);
      return { success: false };
    }
  };

  const deleteUser = async (id) => {
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa người dùng: " + err.message);
      return false;
    }
  };

  // Banners
  const addBanner = async (body) => {
    try {
      const newBanner = await bannerService.create(body);
      setBanners(prev => [newBanner, ...prev]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo Banner: " + err.message);
      return { success: false };
    }
  };

  const updateBanner = async (id, body) => {
    try {
      const updated = await bannerService.update(id, body);
      setBanners(prev => prev.map(b => b.id === id ? updated : b));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi sửa Banner: " + err.message);
      return { success: false };
    }
  };

  const deleteBanner = async (id) => {
    try {
      await bannerService.delete(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa Banner: " + err.message);
      return false;
    }
  };

  // Blogs
  const addBlog = async (body) => {
    try {
      const newBlog = await blogService.create(body);
      setBlogs(prev => [newBlog, ...prev]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm bài viết: " + err.message);
      return { success: false };
    }
  };

  const updateBlog = async (id, body) => {
    try {
      const updated = await blogService.update(id, body);
      setBlogs(prev => prev.map(b => b.id === id ? updated : b));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi sửa bài viết: " + err.message);
      return { success: false };
    }
  };

  const deleteBlog = async (id) => {
    try {
      await blogService.delete(id);
      setBlogs(prev => prev.filter(b => b.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa bài viết: " + err.message);
      return false;
    }
  };

  // Role permissions
  const updateRolePermissions = async (roleId, permissions) => {
    try {
      const roleObj = roles.find(r => r.id === roleId);
      if (!roleObj) return { success: false, message: 'Role not found' };
      const body = {
        name: roleObj.name,
        description: roleObj.description,
        permissions: permissions
      };
      const updated = await roleService.updatePermissions(roleId, body);
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: updated.permissions || [] } : r));
      return { success: true };
    } catch (err) {
      console.error("Error updating role permissions:", err);
      alert("Lỗi cập nhật quyền: " + err.message);
      return { success: false };
    }
  };

  // Roles CRUD
  const addRole = async (body) => {
    try {
      const newRole = await roleService.create(body);
      setRoles(prev => [...prev, newRole]);
      return { success: true, data: newRole };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm vai trò: " + err.message);
      return { success: false, error: err.message };
    }
  };

  const updateRole = async (id, body) => {
    try {
      const updated = await roleService.update(id, body);
      setRoles(prev => prev.map(r => r.id === id ? updated : r));
      return { success: true, data: updated };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật vai trò: " + err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteRole = async (id) => {
    try {
      await roleService.delete(id);
      setRoles(prev => prev.filter(r => r.id !== id));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa vai trò: " + err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <AdminContext.Provider value={{
      roles,
      users,
      customers,
      categoriesProduct,
      categoriesBlog,
      products,
      orders,
      orderDetails,
      banners,
      blogs,
      loading,

      addProduct,
      updateProduct,
      deleteProduct,

      addCategoryProduct,
      updateCategoryProduct,
      deleteCategoryProduct,

      addCategoryBlog,
      updateCategoryBlog,
      deleteCategoryBlog,

      addOrder,
      addOrderDetail,
      updateOrder,
      deleteOrder,
      deleteOrderDetail,

      addCustomer,
      updateCustomer,
      deleteCustomer,
      userAddresses,
      addUserAddress,
      updateUserAddress,

      addUser,
      updateUser,
      deleteUser,

      addBanner,
      updateBanner,
      deleteBanner,

      addBlog,
      updateBlog,
      deleteBlog,

      updateRolePermissions,
      addRole,
      updateRole,
      deleteRole,
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
