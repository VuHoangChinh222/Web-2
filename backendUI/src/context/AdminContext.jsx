import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  // 1. Roles
  const [roles, setRoles] = useState([
    { id: 'role-1', name: 'Administrator', description: 'Full access to all system settings and records', permissions: ['dashboard_view', 'products_manage', 'orders_manage', 'customers_manage', 'users_manage', 'blogs_manage', 'banners_manage'] },
    { id: 'role-2', name: 'Editor', description: 'Manage products, blogs, categories and banners', permissions: ['dashboard_view', 'products_manage', 'blogs_manage', 'banners_manage'] },
    { id: 'role-3', name: 'Sales Agent', description: 'Access dashboard and manage orders and customers', permissions: ['dashboard_view', 'orders_manage', 'customers_manage'] }
  ]);

  // 2. Users
  const [users, setUsers] = useState([
    { id: 'user-1', username: 'admin_duong', fullname: 'Võ Quang Dương', email: 'duong.vq@chinh.com', roleId: 'role-1', active: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { id: 'user-2', username: 'editor_minh', fullname: 'Nguyễn Hoàng Minh', email: 'minh.nh@chinh.com', roleId: 'role-2', active: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { id: 'user-3', username: 'sales_lan', fullname: 'Trần Thị Mai Lan', email: 'lan.ttm@chinh.com', roleId: 'role-3', active: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }
  ]);

  // Active Session State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('chinh_admin_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const staticUsers = [
          { id: 'user-1', username: 'admin_duong', fullname: 'Võ Quang Dương', email: 'duong.vq@chinh.com', roleId: 'role-1', active: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
          { id: 'user-2', username: 'editor_minh', fullname: 'Nguyễn Hoàng Minh', email: 'minh.nh@chinh.com', roleId: 'role-2', active: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
          { id: 'user-3', username: 'sales_lan', fullname: 'Trần Thị Mai Lan', email: 'lan.ttm@chinh.com', roleId: 'role-3', active: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }
        ];
        const staticRoles = [
          { id: 'role-1', name: 'Administrator', description: 'Full access to all system settings and records', permissions: ['dashboard_view', 'products_manage', 'orders_manage', 'customers_manage', 'users_manage', 'blogs_manage', 'banners_manage'] },
          { id: 'role-2', name: 'Editor', description: 'Manage products, blogs, categories and banners', permissions: ['dashboard_view', 'products_manage', 'blogs_manage', 'banners_manage'] },
          { id: 'role-3', name: 'Sales Agent', description: 'Access dashboard and manage orders and customers', permissions: ['dashboard_view', 'orders_manage', 'customers_manage'] }
        ];
        const freshUser = staticUsers.find(u => u.id === parsed.id);
        if (freshUser && freshUser.active) {
          const roleObj = staticRoles.find(r => r.id === freshUser.roleId);
          return { ...freshUser, role: roleObj };
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const login = (username, password) => {
    const foundUser = users.find(u => u.username === username);
    if (!foundUser) {
      return { success: false, message: 'Username does not exist in the database.' };
    }
    if (!foundUser.active) {
      return { success: false, message: 'Your account has been suspended by system admin.' };
    }
    if (password !== 'chinh123' && password !== 'admin123') {
      return { success: false, message: 'Incorrect password.' };
    }
    const roleObj = roles.find(r => r.id === foundUser.roleId);
    const sessionUser = { ...foundUser, role: roleObj };
    setCurrentUser(sessionUser);
    localStorage.setItem('chinh_admin_session', JSON.stringify({ id: foundUser.id }));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('chinh_admin_session');
  };

  // 3. Customers
  const [customers, setCustomers] = useState([
    { id: 'cust-1', fullname: 'Phạm Minh Trí', email: 'tri.pm@gmail.com', phone: '0912345678', address: '123 Nguyễn Huệ, Quận 1, TP. HCM', orderCount: 5, totalSpent: 2450.00, active: true, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
    { id: 'cust-2', fullname: 'Lê Thanh Thảo', email: 'thao.lt@yahoo.com', phone: '0987654321', address: '456 Lê Lợi, Hải Châu, Đà Nẵng', orderCount: 3, totalSpent: 890.00, active: true, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
    { id: 'cust-3', fullname: 'Hoàng Quốc Anh', email: 'anh.hq@outlook.com', phone: '0905556677', address: '789 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', orderCount: 1, totalSpent: 120.00, active: true, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
    { id: 'cust-4', fullname: 'Vũ Ngọc Trinh', email: 'trinh.vn@gmail.com', phone: '0938889900', address: '12 Ba Tháng Hai, Quận 10, TP. HCM', orderCount: 4, totalSpent: 1650.00, active: false, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' }
  ]);

  // 4. Product Categories
  const [categoriesProduct, setCategoriesProduct] = useState([
    { id: 'cat-p1', name: 'Smartphones', slug: 'smartphones', description: 'Latest high-end mobile devices and accessories', productCount: 4 },
    { id: 'cat-p2', name: 'Laptops', slug: 'laptops', description: 'Ultrabooks, workstations and gaming machines', productCount: 3 },
    { id: 'cat-p3', name: 'Audio Equipment', slug: 'audio', description: 'Wireless earphones, studio headphones & soundbars', productCount: 2 },
    { id: 'cat-p4', name: 'Wearables', slug: 'wearables', description: 'Smartwatches, fitness bands and health trackers', productCount: 1 }
  ]);

  // 5. Blog Categories
  const [categoriesBlog, setCategoriesBlog] = useState([
    { id: 'cat-b1', name: 'Technology Reviews', slug: 'tech-reviews', description: 'In-depth reviews of recently released gadgets', blogCount: 2 },
    { id: 'cat-b2', name: 'Buying Guides', slug: 'buying-guides', description: 'Tips and recommendations to make the right purchase', blogCount: 1 },
    { id: 'cat-b3', name: 'Tech Lifestyle', slug: 'tech-lifestyle', description: 'How technology is shaping our daily routines', blogCount: 1 }
  ]);

  // 6. Products
  const [products, setProducts] = useState([
    { id: 'prod-1', name: 'Aether Phone 15 Pro', price: 999.00, salePrice: 949.00, stock: 45, categoryId: 'cat-p1', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80', status: 'Active', description: 'Flagship smartphone with titanium frame and next-gen camera sensor.' },
    { id: 'prod-2', name: 'Chronos Smartwatch X', price: 299.00, salePrice: 249.00, stock: 120, categoryId: 'cat-p4', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=300&q=80', status: 'Active', description: 'Premium smartwatch featuring LTE connection, 7-day battery life, and fitness tracker.' },
    { id: 'prod-3', name: 'Quantum Book Pro 16', price: 1899.00, salePrice: 1799.00, stock: 12, categoryId: 'cat-p2', image: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?auto=format&fit=crop&w=300&q=80', status: 'Active', description: 'High-performance laptop optimized for software engineers and graphic designers.' },
    { id: 'prod-4', name: 'Sonic Studio Headset', price: 349.00, salePrice: 349.00, stock: 35, categoryId: 'cat-p3', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80', status: 'Active', description: 'Active Noise Cancelling (ANC) studio-grade headphones.' },
    { id: 'prod-5', name: 'Aura Soundbar Gen 2', price: 499.00, salePrice: 449.00, stock: 0, categoryId: 'cat-p3', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=300&q=80', status: 'OutOfStock', description: 'Immersive Dolby Atmos soundbar for standard home theaters.' },
    { id: 'prod-6', name: 'Vortex Gaming Notebook', price: 2199.00, salePrice: 1999.00, stock: 8, categoryId: 'cat-p2', image: 'https://images.unsplash.com/photo-1603302576837-37561b2fe536?auto=format&fit=crop&w=300&q=80', status: 'Active', description: 'Ultimate gaming laptop equipped with the latest GPU and high-refresh screen.' }
  ]);

  // 7. Orders
  const [orders, setOrders] = useState([
    { id: 'ord-1001', customerId: 'cust-1', orderDate: '2026-06-14T15:30:00Z', totalAmount: 1198.00, status: 'Completed', paymentMethod: 'Card', shippingAddress: '123 Nguyễn Huệ, Quận 1, TP. HCM' },
    { id: 'ord-1002', customerId: 'cust-2', orderDate: '2026-06-15T08:15:00Z', totalAmount: 249.00, status: 'Processing', paymentMethod: 'Bank Transfer', shippingAddress: '456 Lê Lợi, Hải Châu, Đà Nẵng' },
    { id: 'ord-1003', customerId: 'cust-1', orderDate: '2026-06-15T09:40:00Z', totalAmount: 949.00, status: 'Pending', paymentMethod: 'COD', shippingAddress: '123 Nguyễn Huệ, Quận 1, TP. HCM' },
    { id: 'ord-1004', customerId: 'cust-4', orderDate: '2026-06-12T11:20:00Z', totalAmount: 1799.00, status: 'Shipped', paymentMethod: 'Card', shippingAddress: '12 Ba Tháng Hai, Quận 10, TP. HCM' },
    { id: 'ord-1005', customerId: 'cust-3', orderDate: '2026-06-13T16:45:00Z', totalAmount: 349.00, status: 'Cancelled', paymentMethod: 'COD', shippingAddress: '789 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội' }
  ]);

  // 8. Order Details
  const [orderDetails, setOrderDetails] = useState([
    // ord-1001 items
    { id: 'det-1', orderId: 'ord-1001', productId: 'prod-1', price: 949.00, quantity: 1, total: 949.00 },
    { id: 'det-2', orderId: 'ord-1001', productId: 'prod-2', price: 249.00, quantity: 1, total: 249.00 },
    // ord-1002 items
    { id: 'det-3', orderId: 'ord-1002', productId: 'prod-2', price: 249.00, quantity: 1, total: 249.00 },
    // ord-1003 items
    { id: 'det-4', orderId: 'ord-1003', productId: 'prod-1', price: 949.00, quantity: 1, total: 949.00 },
    // ord-1004 items
    { id: 'det-5', orderId: 'ord-1004', productId: 'prod-3', price: 1799.00, quantity: 1, total: 1799.00 },
    // ord-1005 items
    { id: 'det-6', orderId: 'ord-1005', productId: 'prod-4', price: 349.00, quantity: 1, total: 349.00 }
  ]);

  // 9. Banners
  const [banners, setBanners] = useState([
    { id: 'ban-1', title: 'Summer Cyber Sale', subtitle: 'Upgrade your gaming gear with up to 40% discount', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', link: '/promo/summer-cyber', position: 'Home Main', status: 'Active' },
    { id: 'ban-2', title: 'Next-Gen Audio Experience', subtitle: 'Indulge in noise-canceling studio headsets', image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80', link: '/category/audio', position: 'Sidebar Promo', status: 'Active' },
    { id: 'ban-3', title: 'Smart Wearables, Healthy Life', subtitle: 'Track your health 24/7 with Quantum Bands', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80', link: '/category/wearables', position: 'Home Banner Carousel', status: 'Inactive' }
  ]);

  // 10. Blogs
  const [blogs, setBlogs] = useState([
    { id: 'blog-1', title: 'Why Titanium is the Future of Mobile Hardware', summary: 'Explore the structural advantages of titanium alloys used in premium smartphones like the Aether Phone.', content: 'Titanium alloys offer one of the highest strength-to-weight ratios of any metal. In smartphones, this translates to incredibly light devices that do not sacrifice structural durability. Furthermore, titanium exhibits high resistance to corrosion and scratch-wear, offering a premium texture...', categoryId: 'cat-b1', authorId: 'user-1', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80', status: 'Published', createdAt: '2026-06-10T04:20:00Z' },
    { id: 'blog-2', title: 'Top 5 Noise Cancelling Headsets in 2026', summary: 'We analyze and compare the leading sound equipment brands to help you choose your next studio headset.', content: 'Active Noise Cancellation (ANC) has advanced rapidly. Modern microchips in headsets can process sound at over 40,000 times per second, effectively nullifying high and low-frequency static noise alike. In this review, we examine comfort, battery duration, and audio response curves of the Sonic Studio...', categoryId: 'cat-b1', authorId: 'user-2', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', status: 'Published', createdAt: '2026-06-12T13:10:00Z' },
    { id: 'blog-3', title: 'A Complete Buying Guide for Smartwatches', summary: 'What to look for in a smartwatch: from battery life and health trackers to phone connection features.', content: 'Choosing a smartwatch involves balancing style and functionality. Health monitoring features such as optical heart rate sensors, blood oxygen tracking (SpO2), and ECG have become standard. However, connectivity remains a main differentiator. If you require standalone operation, cellular capability...', categoryId: 'cat-b2', authorId: 'user-2', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80', status: 'Published', createdAt: '2026-06-14T09:00:00Z' },
    { id: 'blog-4', title: 'Work From Home Productivity Hacks', summary: 'Tips to configure a tech ecosystem that maximizes performance and wellness when working remotely.', content: 'Creating a clean environment is vital. Set up a docking station for swift switches between laptops. Consider high-refresh monitors to prevent eye fatigue. Incorporate wireless mechanical keyboards and ergonomic wrist supports to sustain speed and reduce physical stress throughout the workday.', categoryId: 'cat-b3', authorId: 'user-3', image: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?auto=format&fit=crop&w=600&q=80', status: 'Draft', createdAt: '2026-06-15T02:00:00Z' }
  ]);

  // Recalculate dynamic statistics whenever dependencies change
  useEffect(() => {
    // Dynamically update product counts in categoriesProduct
    setCategoriesProduct(prev => prev.map(cat => {
      const count = products.filter(p => p.categoryId === cat.id).length;
      return { ...cat, productCount: count };
    }));
  }, [products]);

  useEffect(() => {
    // Dynamically update blog counts in categoriesBlog
    setCategoriesBlog(prev => prev.map(cat => {
      const count = blogs.filter(b => b.categoryId === cat.id).length;
      return { ...cat, blogCount: count };
    }));
  }, [blogs]);

  // CRUD Actions
  
  // Product CRUD
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      price: parseFloat(product.price),
      salePrice: parseFloat(product.salePrice || product.price),
      stock: parseInt(product.stock)
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? {
      ...updatedProduct,
      price: parseFloat(updatedProduct.price),
      salePrice: parseFloat(updatedProduct.salePrice || updatedProduct.price),
      stock: parseInt(updatedProduct.stock)
    } : p));
  };

  const deleteProduct = (id) => {
    // Check if the product has orders associated with it
    const hasOrders = orderDetails.some(det => det.productId === id);
    if (hasOrders) {
      alert("Cannot delete product: There are active orders associated with this product.");
      return false;
    }
    setProducts(prev => prev.filter(p => p.id !== id));
    return true;
  };

  // Category Product CRUD
  const addCategoryProduct = (cat) => {
    setCategoriesProduct(prev => [...prev, { ...cat, id: `cat-p-${Date.now()}`, productCount: 0 }]);
  };

  const updateCategoryProduct = (cat) => {
    setCategoriesProduct(prev => prev.map(c => c.id === cat.id ? { ...c, ...cat } : c));
  };

  const deleteCategoryProduct = (id) => {
    const count = products.filter(p => p.categoryId === id).length;
    if (count > 0) {
      alert("Cannot delete category: There are products currently assigned to it.");
      return false;
    }
    setCategoriesProduct(prev => prev.filter(c => c.id !== id));
    return true;
  };

  // Category Blog CRUD
  const addCategoryBlog = (cat) => {
    setCategoriesBlog(prev => [...prev, { ...cat, id: `cat-b-${Date.now()}`, blogCount: 0 }]);
  };

  const updateCategoryBlog = (cat) => {
    setCategoriesBlog(prev => prev.map(c => c.id === cat.id ? { ...c, ...cat } : c));
  };

  const deleteCategoryBlog = (id) => {
    const count = blogs.filter(b => b.categoryId === id).length;
    if (count > 0) {
      alert("Cannot delete category: There are blog posts currently assigned to it.");
      return false;
    }
    setCategoriesBlog(prev => prev.filter(c => c.id !== id));
    return true;
  };

  // Order CRUD
  const addOrder = (orderData, items) => {
    const orderId = `ord-${Date.now()}`;
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder = {
      id: orderId,
      customerId: orderData.customerId,
      orderDate: new Date().toISOString(),
      totalAmount: totalAmount,
      status: 'Pending',
      paymentMethod: orderData.paymentMethod,
      shippingAddress: orderData.shippingAddress
    };

    const newDetails = items.map((item, idx) => ({
      id: `det-${Date.now()}-${idx}`,
      orderId: orderId,
      productId: item.productId,
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity),
      total: parseFloat(item.price) * parseInt(item.quantity)
    }));

    // Update customer stats
    setCustomers(prev => prev.map(c => {
      if (c.id === orderData.customerId) {
        return {
          ...c,
          orderCount: c.orderCount + 1,
          totalSpent: c.totalSpent + totalAmount
        };
      }
      return c;
    }));

    // Deduct inventory
    setProducts(prev => prev.map(p => {
      const item = items.find(i => i.productId === p.id);
      if (item) {
        const newStock = Math.max(0, p.stock - item.quantity);
        return {
          ...p,
          stock: newStock,
          status: newStock === 0 ? 'OutOfStock' : p.status
        };
      }
      return p;
    }));

    setOrders(prev => [newOrder, ...prev]);
    setOrderDetails(prev => [...prev, ...newDetails]);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // If order gets cancelled, refund stock
        if (newStatus === 'Cancelled' && o.status !== 'Cancelled') {
          const items = orderDetails.filter(d => d.orderId === orderId);
          setProducts(prevProd => prevProd.map(p => {
            const item = items.find(i => i.productId === p.id);
            if (item) {
              const newStock = p.stock + item.quantity;
              return { ...p, stock: newStock, status: p.status === 'OutOfStock' ? 'Active' : p.status };
            }
            return p;
          }));

          // Deduct from customer spent
          setCustomers(prevCust => prevCust.map(c => {
            if (c.id === o.customerId) {
              return {
                ...c,
                totalSpent: Math.max(0, c.totalSpent - o.totalAmount)
              };
            }
            return c;
          }));
        } else if (o.status === 'Cancelled' && newStatus !== 'Cancelled') {
          // If un-cancelled, deduct stock
          const items = orderDetails.filter(d => d.orderId === orderId);
          setProducts(prevProd => prevProd.map(p => {
            const item = items.find(i => i.productId === p.id);
            if (item) {
              const newStock = Math.max(0, p.stock - item.quantity);
              return { ...p, stock: newStock, status: newStock === 0 ? 'OutOfStock' : p.status };
            }
            return p;
          }));

          // Add to customer spent
          setCustomers(prevCust => prevCust.map(c => {
            if (c.id === o.customerId) {
              return {
                ...c,
                totalSpent: c.totalSpent + o.totalAmount
              };
            }
            return c;
          }));
        }
        return { ...o, status: newStatus };
      }
      return o;
    }));
  };

  // Customer CRUD
  const addCustomer = (customer) => {
    setCustomers(prev => [...prev, { ...customer, id: `cust-${Date.now()}`, orderCount: 0, totalSpent: 0 }]);
  };

  const updateCustomer = (customer) => {
    setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, ...customer } : c));
  };

  const deleteCustomer = (id) => {
    const hasOrders = orders.some(o => o.customerId === id);
    if (hasOrders) {
      alert("Cannot delete customer: This customer has order histories in the system.");
      return false;
    }
    setCustomers(prev => prev.filter(c => c.id !== id));
    return true;
  };

  // User CRUD
  const addUser = (user) => {
    setUsers(prev => [...prev, { ...user, id: `user-${Date.now()}`, active: true }]);
  };

  const updateUser = (user) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...user } : u));
  };

  const deleteUser = (id, loggedInUserId) => {
    if (id === loggedInUserId) {
      alert("Security rule: You cannot delete yourself.");
      return false;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    return true;
  };

  // Banner CRUD
  const addBanner = (banner) => {
    setBanners(prev => [{ ...banner, id: `ban-${Date.now()}` }, ...prev]);
  };

  const updateBanner = (banner) => {
    setBanners(prev => prev.map(b => b.id === banner.id ? banner : b));
  };

  const deleteBanner = (id) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  // Blog CRUD
  const addBlog = (blog) => {
    setBlogs(prev => [{ ...blog, id: `blog-${Date.now()}`, createdAt: new Date().toISOString() }, ...prev]);
  };

  const updateBlog = (blog) => {
    setBlogs(prev => prev.map(b => b.id === blog.id ? blog : b));
  };

  const deleteBlog = (id) => {
    setBlogs(prev => prev.filter(b => b.id !== id));
  };

  // Role CRUD
  const updateRolePermissions = (roleId, permissions) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r));
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
