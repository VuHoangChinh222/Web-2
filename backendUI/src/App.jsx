import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import VibrantBackground from './components/VibrantBackground';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Page imports
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Blogs from './pages/Blogs';
import Banners from './pages/Banners';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Login from './pages/Login';

const DashboardContent = () => {
  const { users, roles, currentUser, setCurrentUser } = useAdmin();
  const [activePage, setActivePage] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Shared Order Details Modal State (allows opening from Dashboard or Orders list)
  const [selectedOrderId, setSelectedOrderId] = useState('ord-1001');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Sync activePage with URL pathname
  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.replace(/^\//, '') || 'dashboard';
      const validPages = ['dashboard', 'products', 'categories', 'orders', 'customers', 'blogs', 'banners', 'users', 'roles'];
      if (validPages.includes(path)) {
        setActivePage(path);
      }
    };
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Update URL pathname when activePage changes
  React.useEffect(() => {
    const newPath = activePage === 'dashboard' ? '/' : `/${activePage}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  }, [activePage]);

  const handleChangeUser = (newUser) => {
    setCurrentUser(newUser);
    
    // Check if the page the user is viewing is allowed for the new role, if not fallback to dashboard
    const pagePermissions = {
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

    const requiredPerm = pagePermissions[activePage];
    const userPermissions = newUser?.role?.permissions || [];
    if (requiredPerm && !userPermissions.includes(requiredPerm)) {
      setActivePage('dashboard');
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
        return <Products />;
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
      default:
        return <Dashboard />;
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
