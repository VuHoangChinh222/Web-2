import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

const API_BASE = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('chinh_admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Yêu cầu API thất bại');
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
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
  const [loading, setLoading] = useState(false);

  // --- Helper Mappers (Backend <=> Frontend) ---

  const mapUserFromBackend = (user) => {
    if (!user) return null;
    const active = user.status === 1;
    return {
      id: user.id,
      username: user.username,
      fullname: user.fullName || user.username,
      email: user.email,
      phone: user.phone || '',
      roleId: user.role ? user.role.id : null,
      role: user.role ? {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
        permissions: user.role.permissions || []
      } : null,
      active: active,
      avatar: user.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      status: user.status
    };
  };

  const mapProductFromBackend = (prod) => {
    if (!prod) return null;
    return {
      id: prod.id,
      name: prod.name,
      slug: prod.slug || '',
      description: prod.description || '',
      shortDescription: prod.shortDescription || '',
      price: prod.basePrice ? parseFloat(prod.basePrice) : 0,
      salePrice: prod.discountPrice ? parseFloat(prod.discountPrice) : (prod.basePrice ? parseFloat(prod.basePrice) : 0),
      stock: 120, // default stock count as it is variant-based on DB
      categoryId: prod.category ? prod.category.id : '',
      category: prod.category,
      image: prod.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
      status: prod.status === 1 ? 'Active' : 'Draft',
      createdAt: prod.createdAt
    };
  };

  const mapOrderFromBackend = (order) => {
    if (!order) return null;
    return {
      id: order.id,
      orderCode: order.orderCode,
      customerId: order.customer ? order.customer.id : null,
      customerName: order.customer ? order.customer.fullname : order.recipientName,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      shippingAddress: order.shippingAddress,
      totalPrice: order.totalPrice,
      shippingFee: order.shippingFee,
      grandTotal: order.grandTotal,
      totalAmount: order.grandTotal,
      orderDate: order.createdAt,
      status: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      note: order.note
    };
  };

  const mapOrderDetailFromBackend = (detail) => {
    if (!detail) return null;
    return {
      id: detail.id,
      orderId: detail.order ? detail.order.id : null,
      productId: detail.productVariant && detail.productVariant.product ? detail.productVariant.product.id : null,
      productName: detail.productVariant && detail.productVariant.product ? detail.productVariant.product.name : 'Sản phẩm',
      price: detail.price,
      quantity: detail.quantity,
      total: parseFloat(detail.price) * parseInt(detail.quantity)
    };
  };

  const mapBlogFromBackend = (blog) => {
    if (!blog) return null;
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug || '',
      summary: blog.summary || '',
      content: blog.content || '',
      categoryId: blog.categoryBlog ? blog.categoryBlog.id : '',
      authorId: blog.author ? blog.author.id : '',
      image: blog.thumbnail || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=300&q=80',
      status: blog.status === 1 ? 'Published' : 'Draft',
      createdAt: blog.createdAt
    };
  };

  const mapBannerFromBackend = (ban) => {
    if (!ban) return null;
    const positionMap = {
      1: 'Home Main',
      2: 'Sidebar Promo',
      3: 'Home Banner Carousel',
      4: 'Footer Banner'
    };
    return {
      id: ban.id,
      title: ban.title,
      subtitle: ban.title,
      image: ban.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80',
      link: '#',
      position: positionMap[ban.position] || 'Home Main',
      status: ban.status === 1 ? 'Active' : 'Inactive'
    };
  };

  const positionStringToId = (posString) => {
    const positionMap = {
      'Home Main': 1,
      'Sidebar Promo': 2,
      'Home Banner Carousel': 3,
      'Footer Banner': 4
    };
    return positionMap[posString] || 1;
  };

  // --- Core Loading Hook ---

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      
      // Fetch Roles
      try {
        const rolesData = await apiCall('/roles');
        const filteredRoles = (rolesData || []).filter(r => r.name !== 'Admin' && r.name !== 'Employee');
        setRoles(filteredRoles);
      } catch (e) {
        console.error("Error fetching roles:", e);
      }

      // Fetch Users
      try {
        const usersData = await apiCall('/users?size=1000');
        setUsers((usersData.content || []).map(mapUserFromBackend));
      } catch (e) {
        console.error("Error fetching users:", e);
      }

      // Fetch Customers
      try {
        const customersData = await apiCall('/customers?size=1000');
        setCustomers(customersData.content || []);
      } catch (e) {
        console.error("Error fetching customers:", e);
      }

      // Fetch Product Categories
      try {
        const catProdData = await apiCall('/category-products?size=1000');
        setCategoriesProduct(catProdData.content || []);
      } catch (e) {
        console.error("Error fetching product categories:", e);
      }

      // Fetch Blog Categories
      try {
        const catBlogData = await apiCall('/category-blogs?size=1000');
        setCategoriesBlog(catBlogData.content || []);
      } catch (e) {
        console.error("Error fetching blog categories:", e);
      }

      // Fetch Products
      try {
        const productsData = await apiCall('/products?size=1000');
        setProducts((productsData.content || []).map(mapProductFromBackend));
      } catch (e) {
        console.error("Error fetching products:", e);
      }

      // Fetch Orders
      try {
        const ordersData = await apiCall('/orders?size=1000');
        setOrders((ordersData.content || []).map(mapOrderFromBackend));
      } catch (e) {
        console.error("Error fetching orders:", e);
      }

      // Fetch Order Details
      try {
        const detailsData = await apiCall('/order-details?size=1000');
        setOrderDetails((detailsData.content || []).map(mapOrderDetailFromBackend));
      } catch (e) {
        console.error("Error fetching order details:", e);
      }

      // Fetch Banners
      try {
        const bannersData = await apiCall('/banners');
        setBanners((bannersData || []).map(mapBannerFromBackend));
      } catch (e) {
        console.error("Error fetching banners:", e);
      }

      // Fetch Blogs
      try {
        const blogsData = await apiCall('/blogs?size=1000');
        setBlogs((blogsData.content || []).map(mapBlogFromBackend));
      } catch (e) {
        console.error("Error fetching blogs:", e);
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

  // --- Auth Handlers ---

  const login = async (username, password) => {
    try {
      const res = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (res && res.token) {
        localStorage.setItem('chinh_admin_token', res.token);
        
        // Load user profile
        const usersPage = await apiCall('/users?size=1000');
        const usersList = usersPage.content || [];
        const foundUser = usersList.find(u => u.username === username);
        
        if (foundUser) {
          const mappedUser = mapUserFromBackend(foundUser);
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

  // --- Category Counts Calculators (Reactive UI Helpers) ---

  useEffect(() => {
    setCategoriesProduct(prev => (prev || []).map(cat => {
      const count = (products || []).filter(p => p.categoryId === cat.id).length;
      return { ...cat, productCount: count };
    }));
  }, [products]);

  useEffect(() => {
    setCategoriesBlog(prev => (prev || []).map(cat => {
      const count = (blogs || []).filter(b => b.categoryId === cat.id).length;
      return { ...cat, blogCount: count };
    }));
  }, [blogs]);

  // --- CRUD ACTIONS ---

  // Products
  const addProduct = async (product) => {
    try {
      const body = {
        categoryId: parseInt(product.categoryId),
        name: product.name,
        slug: product.slug || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        thumbnail: product.thumbnail || product.image || '',
        basePrice: parseFloat(product.price),
        discountPrice: parseFloat(product.salePrice || product.price),
        status: product.status === 'Active' ? 1 : 0
      };
      const newProduct = await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setProducts(prev => [mapProductFromBackend(newProduct), ...prev]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm sản phẩm: " + err.message);
      return { success: false, error: err.message };
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const body = {
        categoryId: parseInt(updatedProduct.categoryId),
        name: updatedProduct.name,
        slug: updatedProduct.slug || '',
        shortDescription: updatedProduct.shortDescription || '',
        description: updatedProduct.description || '',
        thumbnail: updatedProduct.thumbnail || updatedProduct.image || '',
        basePrice: parseFloat(updatedProduct.price),
        discountPrice: parseFloat(updatedProduct.salePrice || updatedProduct.price),
        status: updatedProduct.status === 'Active' ? 1 : 0
      };
      const updated = await apiCall(`/products/${updatedProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? mapProductFromBackend(updated) : p));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật sản phẩm: " + err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const hasOrders = orderDetails.some(det => det.productId === id);
      if (hasOrders) {
        alert("Không thể xóa sản phẩm: Đã có đơn hàng chứa mặt hàng này.");
        return false;
      }
      await apiCall(`/products/${id}`, {
        method: 'DELETE'
      });
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa sản phẩm: " + err.message);
      return false;
    }
  };

  // Product Categories
  const addCategoryProduct = async (cat) => {
    try {
      const body = {
        name: cat.name,
        slug: cat.slug || '',
        description: cat.description || '',
        imageUrl: cat.imageUrl || cat.image || '',
        status: 1
      };
      const newCat = await apiCall('/category-products', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setCategoriesProduct(prev => [...prev, newCat]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm danh mục sản phẩm: " + err.message);
      return { success: false };
    }
  };

  const updateCategoryProduct = async (cat) => {
    try {
      const body = {
        name: cat.name,
        slug: cat.slug || '',
        description: cat.description || '',
        imageUrl: cat.imageUrl || cat.image || '',
        status: 1
      };
      const updated = await apiCall(`/category-products/${cat.id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      setCategoriesProduct(prev => prev.map(c => c.id === cat.id ? updated : c));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi sửa danh mục sản phẩm: " + err.message);
      return { success: false };
    }
  };

  const deleteCategoryProduct = async (id) => {
    try {
      const count = products.filter(p => p.categoryId === id).length;
      if (count > 0) {
        alert("Không thể xóa danh mục: Vẫn còn sản phẩm thuộc danh mục này.");
        return false;
      }
      await apiCall(`/category-products/${id}`, {
        method: 'DELETE'
      });
      setCategoriesProduct(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa danh mục sản phẩm: " + err.message);
      return false;
    }
  };

  // Blog Categories
  const addCategoryBlog = async (cat) => {
    try {
      const body = {
        name: cat.name,
        slug: cat.slug || '',
        description: cat.description || '',
        imageUrl: cat.imageUrl || cat.image || ''
      };
      const newCat = await apiCall('/category-blogs', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setCategoriesBlog(prev => [...prev, newCat]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm danh mục bài viết: " + err.message);
      return { success: false };
    }
  };

  const updateCategoryBlog = async (cat) => {
    try {
      const body = {
        name: cat.name,
        slug: cat.slug || '',
        description: cat.description || '',
        imageUrl: cat.imageUrl || cat.image || ''
      };
      const updated = await apiCall(`/category-blogs/${cat.id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      setCategoriesBlog(prev => prev.map(c => c.id === cat.id ? updated : c));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi sửa danh mục bài viết: " + err.message);
      return { success: false };
    }
  };

  const deleteCategoryBlog = async (id) => {
    try {
      const count = blogs.filter(b => b.categoryId === id).length;
      if (count > 0) {
        alert("Không thể xóa danh mục: Vẫn còn bài viết thuộc danh mục này.");
        return false;
      }
      await apiCall(`/category-blogs/${id}`, {
        method: 'DELETE'
      });
      setCategoriesBlog(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa danh mục bài viết: " + err.message);
      return false;
    }
  };

  // Orders
  const addOrder = async (orderData, items) => {
    try {
      const cust = customers.find(c => c.id === orderData.customerId);
      const totalAmt = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const body = {
        customerId: orderData.customerId ? parseInt(orderData.customerId) : null,
        recipientName: cust ? cust.fullname : 'Khách Vãng Lai',
        recipientPhone: cust ? cust.phone : '0912345678',
        shippingAddress: orderData.shippingAddress || (cust ? cust.address : 'Hà Nội'),
        totalPrice: totalAmt,
        shippingFee: 0,
        paymentMethod: orderData.paymentMethod || 'COD',
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        note: 'Đơn hàng tạo từ trang quản trị'
      };
      
      const newOrder = await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      
      // Save items
      for (const item of items) {
        try {
          const detailBody = {
            orderId: newOrder.id,
            productVariantId: 1, // Default fallback variant
            price: item.price,
            quantity: item.quantity
          };
          await apiCall('/order-details', {
            method: 'POST',
            body: JSON.stringify(detailBody)
          });
        } catch (e) {
          console.error("Lỗi khi tạo chi tiết đơn hàng cho", item, e);
        }
      }
      
      // Refresh
      const ordersData = await apiCall('/orders?size=1000');
      setOrders((ordersData.content || []).map(mapOrderFromBackend));
      const detailsData = await apiCall('/order-details?size=1000');
      setOrderDetails((detailsData.content || []).map(mapOrderDetailFromBackend));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm đơn hàng: " + err.message);
      return { success: false };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const body = {
        customerId: order.customerId,
        orderCode: order.orderCode,
        recipientName: order.recipientName,
        recipientPhone: order.recipientPhone,
        shippingAddress: order.shippingAddress,
        totalPrice: parseFloat(order.totalPrice || order.totalAmount),
        shippingFee: parseFloat(order.shippingFee || 0),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: newStatus,
        note: order.note
      };
      
      const updated = await apiCall(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      
      setOrders(prev => prev.map(o => o.id === orderId ? mapOrderFromBackend(updated) : o));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật đơn hàng: " + err.message);
      return { success: false };
    }
  };

  // Customers
  const addCustomer = async (customer) => {
    try {
      const body = {
        fullname: customer.fullname,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || '',
        imageUrl: customer.avatar || customer.imageUrl || '',
        status: customer.active ? 1 : 0
      };
      const newCust = await apiCall('/customers', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setCustomers(prev => [...prev, newCust]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm khách hàng: " + err.message);
      return { success: false };
    }
  };

  const updateCustomer = async (customer) => {
    try {
      const body = {
        fullname: customer.fullname,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || '',
        imageUrl: customer.avatar || customer.imageUrl || '',
        status: customer.active ? 1 : 0
      };
      const updated = await apiCall(`/customers/${customer.id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      setCustomers(prev => prev.map(c => c.id === customer.id ? updated : c));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật khách hàng: " + err.message);
      return { success: false };
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const hasOrders = orders.some(o => o.customerId === id);
      if (hasOrders) {
        alert("Không thể xóa khách hàng: Khách đã có lịch sử đặt hàng.");
        return false;
      }
      await apiCall(`/customers/${id}`, {
        method: 'DELETE'
      });
      setCustomers(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa khách hàng: " + err.message);
      return false;
    }
  };

  // Users
  const addUser = async (user) => {
    try {
      const body = {
        username: user.username,
        password: user.password,
        fullName: user.fullname,
        email: user.email,
        phone: user.phone || '0912345678',
        imageUrl: user.avatar || '',
        status: user.active ? 1 : 0,
        role: {
          id: parseInt(user.roleId)
        }
      };
      const newUser = await apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setUsers(prev => [...prev, mapUserFromBackend(newUser)]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm người dùng: " + err.message);
      return { success: false };
    }
  };

  const updateUser = async (user) => {
    try {
      const body = {
        username: user.username,
        fullName: user.fullname,
        email: user.email,
        phone: user.phone || '0912345678',
        imageUrl: user.avatar || user.imageUrl || '',
        status: user.active ? 1 : 0,
        role: {
          id: parseInt(user.roleId)
        }
      };
      if (user.password && user.password.trim() !== '') {
        body.password = user.password;
      }
      const updated = await apiCall(`/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      setUsers(prev => prev.map(u => u.id === user.id ? mapUserFromBackend(updated) : u));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật người dùng: " + err.message);
      return { success: false };
    }
  };

  const deleteUser = async (id, loggedInUserId) => {
    if (id === loggedInUserId) {
      alert("Quy tắc bảo mật: Bạn không thể tự xóa chính mình.");
      return false;
    }
    try {
      await apiCall(`/users/${id}`, {
        method: 'DELETE'
      });
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa người dùng: " + err.message);
      return false;
    }
  };

  // Banners
  const addBanner = async (banner) => {
    try {
      const body = {
        title: banner.title,
        imageUrl: banner.image || banner.imageUrl || '',
        position: positionStringToId(banner.position),
        status: banner.status === 'Active' ? 1 : 0
      };
      const newBanner = await apiCall('/banners', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setBanners(prev => [mapBannerFromBackend(newBanner), ...prev]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo Banner: " + err.message);
      return { success: false };
    }
  };

  const updateBanner = async (banner) => {
    try {
      const body = {
        title: banner.title,
        imageUrl: banner.image || banner.imageUrl || '',
        position: positionStringToId(banner.position),
        status: banner.status === 'Active' ? 1 : 0
      };
      const updated = await apiCall(`/banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      setBanners(prev => prev.map(b => b.id === banner.id ? mapBannerFromBackend(updated) : b));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi sửa Banner: " + err.message);
      return { success: false };
    }
  };

  const deleteBanner = async (id) => {
    try {
      await apiCall(`/banners/${id}`, {
        method: 'DELETE'
      });
      setBanners(prev => prev.filter(b => b.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa Banner: " + err.message);
      return false;
    }
  };

  // Blogs
  const addBlog = async (blog) => {
    try {
      const body = {
        categoryId: parseInt(blog.categoryId),
        authorId: parseInt(currentUser.id) || 1,
        title: blog.title,
        slug: blog.slug || '',
        summary: blog.summary || '',
        content: blog.content || '',
        thumbnail: blog.thumbnail || blog.image || '',
        imageUrl: blog.image || blog.thumbnail || '',
        status: blog.status === 'Published' ? 1 : 0
      };
      const newBlog = await apiCall('/blogs', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setBlogs(prev => [mapBlogFromBackend(newBlog), ...prev]);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm bài viết: " + err.message);
      return { success: false };
    }
  };

  const updateBlog = async (blog) => {
    try {
      const body = {
        categoryId: parseInt(blog.categoryId),
        authorId: parseInt(blog.authorId || currentUser.id) || 1,
        title: blog.title,
        slug: blog.slug || '',
        summary: blog.summary || '',
        content: blog.content || '',
        thumbnail: blog.thumbnail || blog.image || '',
        imageUrl: blog.image || blog.thumbnail || '',
        status: blog.status === 'Published' ? 1 : 0
      };
      const updated = await apiCall(`/blogs/${blog.id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      setBlogs(prev => prev.map(b => b.id === blog.id ? mapBlogFromBackend(updated) : b));
      return { success: true };
    } catch (err) {
      console.error(err);
      alert("Lỗi khi sửa bài viết: " + err.message);
      return { success: false };
    }
  };

  const deleteBlog = async (id) => {
    try {
      await apiCall(`/blogs/${id}`, {
        method: 'DELETE'
      });
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
      const updated = await apiCall(`/roles/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: updated.permissions || [] } : r));
      return { success: true };
    } catch (err) {
      console.error("Error updating role permissions:", err);
      alert("Lỗi cập nhật quyền: " + err.message);
      return { success: false };
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
      updateOrderStatus,

      addCustomer,
      updateCustomer,
      deleteCustomer,

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
      currentUser,
      setCurrentUser,
      login,
      logout
    }}>
      {children}
    </AdminContext.Provider>
  );
};
