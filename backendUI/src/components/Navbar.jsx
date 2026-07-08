import React, { useState } from 'react';
import { Bell, RefreshCw, UserCheck, Shield } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const Navbar = ({ activePage, currentUser, onChangeUser }) => {
  const { orders, customers, products, resolveImageUrl } = useAdmin();
  const [showNotification, setShowNotification] = useState(false);

  // Capitalize active page title
  const getPageTitle = () => {
    if (activePage === 'categories') return 'Categories Management';
    if (activePage === 'roles') return 'Roles & Security';
    if (activePage === 'users') return 'System Staff Users';
    return activePage.charAt(0).toUpperCase() + activePage.slice(1);
  };

  // Build dynamic system notifications from actual backend data
  const notificationList = [];

  // 1. Pending/Processing orders alerts
  const pendingOrders = (orders || [])
    .filter(o => o.orderStatus === '0' || o.orderStatus === 'Pending')
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

  pendingOrders.forEach(o => {
    notificationList.push({
      id: `order-${o.id}`,
      text: `New pending order #${o.orderCode || `ORD-${o.id}`} from ${o.recipientName || 'customer'}.`,
      time: "Awaiting approval",
      unread: true
    });
  });

  // 2. Recent customers alerts
  const recentCustomers = (customers || [])
    .sort((a, b) => b.id - a.id)
    .slice(0, 2);

  recentCustomers.forEach(c => {
    notificationList.push({
      id: `cust-${c.id}`,
      text: `New customer registered: ${c.fullName || c.email}.`,
      time: "New signup",
      unread: true
    });
  });

  // 3. Draft/suspended products status warnings
  const draftProducts = (products || [])
    .filter(p => p.status === 0)
    .slice(0, 2);

  draftProducts.forEach(p => {
    notificationList.push({
      id: `prod-${p.id}`,
      text: `Product '${p.name}' is currently set as Draft (hidden from store).`,
      time: "Catalog alert",
      unread: false
    });
  });

  // Fallback if everything is fully processed/active
  if (notificationList.length === 0) {
    notificationList.push({
      id: 'fallback-alert',
      text: "All commerce systems operational. No new alerts.",
      time: "Just now",
      unread: false
    });
  }

  const unreadCount = notificationList.filter(n => n.unread).length;

  return (
    <nav className="h-16 border-b border-white/5 bg-[#090A10]/45 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>CONSOLE</span>
          <span>/</span>
          <span className="text-purple-400 font-semibold">{activePage.toUpperCase()}</span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-wide">{getPageTitle()}</h1>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">

        {/* Current User Role Badge */}
        <div className="flex items-center gap-2 text-xs glass-btn px-3 py-1.5 rounded-lg border border-purple-500/20 text-purple-300">
          <Shield size={14} className="text-purple-400" />
          <span className="hidden sm:inline">Role: {currentUser.role?.name || 'Staff'}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 relative transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 shadow-md shadow-pink-500/50" />
            )}
          </button>

          {showNotification && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#0F1224] shadow-2xl p-1 z-50">
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">System Alerts</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-300">{unreadCount} New</span>
              </div>
              <div className="max-h-60 overflow-y-auto glass-scrollbar p-1">
                {notificationList.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg text-xs transition-colors hover:bg-white/[0.02] cursor-pointer flex gap-2
                      ${notif.unread ? 'bg-purple-900/10' : ''}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0
                      ${notif.unread ? 'bg-purple-400' : 'bg-slate-600'}`}
                    />
                    <div>
                      <p className={`text-slate-200 ${notif.unread ? 'font-semibold text-white' : ''}`}>
                        {notif.text}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
