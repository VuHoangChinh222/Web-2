import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import VibrantBackground from './components/VibrantBackground';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Page imports
import Dashboard from './pages/Dashboard/Index';
import Products from './pages/Products/Index';
import Categories from './pages/Categories/Index';
import Orders from './pages/Orders/Index';
import Customers from './pages/Customers/Index';
import Blogs from './pages/Blogs/Index';
import Banners from './pages/Banners/Index';
import Users from './pages/Users/Index';
import Roles from './pages/Roles/Index';
import Login from './pages/Login/Index';

const PAGE_PERMISSIONS = {
  'dashboard': 'dashboard_view',
  'products': 'manage_product',
  'categories': 'manage_categoryproduct',
  'orders': 'manage_order',
  'customers': 'manage_customer',
  'blogs': 'manage_blog',
  'banners': 'manage_banner',
  'users': 'manage_user',
  'roles': 'manage_role'
};

const DashboardContent = () => {
  const { users, roles, currentUser, setCurrentUser } = useAdmin();
  const [activePage, setActivePage] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Shared Order Details Modal State (allows opening from Dashboard or Orders list)
  const [selectedOrderId, setSelectedOrderId] = useState('ord-1001');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Sync activePage with URL pathname and enforce permissions
  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.replace(/^\//, '') || 'dashboard';
      const validPages = ['dashboard', 'products', 'categories', 'orders', 'customers', 'blogs', 'banners', 'users', 'roles', 'unauthorized'];
      if (validPages.includes(path)) {
        if (!currentUser) return;
        const requiredPerm = PAGE_PERMISSIONS[path];
        const userPermissions = currentUser?.role?.permissions || [];

        if (requiredPerm && !userPermissions.includes(requiredPerm)) {
          // Find first allowed page
          const firstAllowedPage = Object.keys(PAGE_PERMISSIONS).find(p =>
            userPermissions.includes(PAGE_PERMISSIONS[p])
          );
          setActivePage(firstAllowedPage || 'unauthorized');
        } else {
          setActivePage(path);
        }
      }
    };
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [currentUser]);

  // Enforce permissions whenever activePage or currentUser changes
  React.useEffect(() => {
    if (!currentUser) return;
    const requiredPerm = PAGE_PERMISSIONS[activePage];
    if (requiredPerm) {
      const userPermissions = currentUser?.role?.permissions || [];
      if (!userPermissions.includes(requiredPerm)) {
        const firstAllowedPage = Object.keys(PAGE_PERMISSIONS).find(p =>
          userPermissions.includes(PAGE_PERMISSIONS[p])
        );
        setActivePage(firstAllowedPage || 'unauthorized');
      }
    }
  }, [activePage, currentUser]);

  // Update URL pathname when activePage changes
  React.useEffect(() => {
    const newPath = activePage === 'dashboard' ? '/' : `/${activePage}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  }, [activePage]);

  const handleChangeUser = (newUser) => {
    setCurrentUser(newUser);

    const requiredPerm = PAGE_PERMISSIONS[activePage];
    const userPermissions = newUser?.role?.permissions || [];
    if (requiredPerm && !userPermissions.includes(requiredPerm)) {
      const firstAllowedPage = Object.keys(PAGE_PERMISSIONS).find(p =>
        userPermissions.includes(PAGE_PERMISSIONS[p])
      );
      setActivePage(firstAllowedPage || 'unauthorized');
    }
  };

  // Content Router
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            setActivePage={setActivePage}
            setSelectedOrderId={setSelectedOrderId}
            setIsOrderModalOpen={setIsOrderModalOpen}
          />
        );
      case 'products':
        return (
          <Products
            setSelectedOrderId={setSelectedOrderId}
            setIsOrderModalOpen={setIsOrderModalOpen}
            setActivePage={setActivePage}
          />
        );
      case 'categories':
        return <Categories />;
      case 'orders':
        return (
          <Orders
            selectedOrderId={selectedOrderId}
            setSelectedOrderId={setSelectedOrderId}
            isOpen={isOrderModalOpen}
            setIsOpen={setIsOrderModalOpen}
          />
        );
      case 'customers':
        return <Customers />;
      case 'blogs':
        return <Blogs />;
      case 'banners':
        return <Banners />;
      case 'users':
        return <Users currentUser={currentUser} />;
      case 'roles':
        return <Roles />;
      case 'unauthorized':
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#0F1224]/30 backdrop-blur-md rounded-2xl border border-white/5">
            <h2 className="text-2xl font-bold text-rose-400 mb-2">Access Denied</h2>
            <p className="text-slate-400 text-sm">Bạn không có quyền truy cập vào chức năng hoặc trang này.</p>
          </div>
        );
      default:
        {
          const userPermissions = currentUser?.role?.permissions || [];
          if (userPermissions.includes('dashboard_view')) {
            return (
              <Dashboard
                setActivePage={setActivePage}
                setSelectedOrderId={setSelectedOrderId}
                setIsOrderModalOpen={setIsOrderModalOpen}
              />
            );
          } else {
            return (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#0F1224]/30 backdrop-blur-md rounded-2xl border border-white/5">
                <h2 className="text-2xl font-bold text-rose-400 mb-2">Access Denied</h2>
                <p className="text-slate-400 text-sm">Bạn không có quyền truy cập vào chức năng hoặc trang này.</p>
              </div>
            );
          }
        }
    }
  };

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen">
      {/* Dynamic Animated Space Background */}
      <VibrantBackground />

      {/* Collapsible Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        currentUser={currentUser}
      />

      {/* Main Panel Content Area */}
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col
          ${isCollapsed ? 'pl-[76px]' : 'pl-[260px]'}`}
      >
        {/* Navigation Control Bar */}
        <Navbar
          activePage={activePage}
          currentUser={currentUser}
          onChangeUser={handleChangeUser}
        />

        {/* Dynamic Page content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AdminProvider>
      <DashboardContent />
    </AdminProvider>
  );
};

export default App;
