import React, { useState } from 'react';
import { Bell, Search, RefreshCw, UserCheck, Shield } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const Navbar = ({ activePage, currentUser, onChangeUser }) => {
  const { users, roles, resolveImageUrl } = useAdmin();
  const [showNotification, setShowNotification] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Capitalize active page title
  const getPageTitle = () => {
    if (activePage === 'categories') return 'Categories Management';
    if (activePage === 'roles') return 'Roles & Security';
    if (activePage === 'users') return 'System Staff Users';
    return activePage.charAt(0).toUpperCase() + activePage.slice(1);
  };

  const notificationList = [
    { id: 1, text: "New pending order #ord-1003 received.", time: "10 mins ago", unread: true },
    { id: 2, text: "Product 'Aura Soundbar Gen 2' is now out of stock.", time: "2 hours ago", unread: true },
    { id: 3, text: "Role settings updated for Sales Agent role.", time: "1 day ago", unread: false }
  ];

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

      {/* Quick Search & Controls */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block w-64">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search records, analytics..." 
            className="w-full pl-10 pr-4 py-1.5 rounded-lg text-xs glass-input"
          />
        </div>

        {/* Quick Role Switcher Button */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 text-xs glass-btn px-3 py-1.5 rounded-lg border border-purple-500/20 text-purple-300 hover:border-purple-500/40"
          >
            <Shield size={14} className="text-purple-400" />
            <span className="hidden sm:inline">Role: {currentUser.role.name}</span>
            <RefreshCw size={12} className="animate-spin-slow" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0F1224] p-1.5 shadow-2xl z-50">
              <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Switch Active Actor
              </div>
              <div className="space-y-0.5">
                {users.map(u => {
                  const roleObj = roles.find(r => r.id === u.roleId);
                  return (
                    <button
                       key={u.id}
                       onClick={() => {
                         onChangeUser({ ...u, role: roleObj });
                         setShowUserMenu(false);
                       }}
                       className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors
                         ${currentUser.id === u.id 
                           ? 'bg-purple-600/25 text-purple-300 border border-purple-500/30' 
                           : 'text-slate-300 hover:bg-white/5 hover:text-white'
                         }`}
                     >
                      <img src={resolveImageUrl(u.avatar)} alt={u.fullname} className="w-6 h-6 rounded-full object-cover" />
                      <div className="overflow-hidden">
                        <p className="font-semibold truncate">{u.fullname}</p>
                        <p className="text-[10px] text-slate-400 truncate">{roleObj?.name}</p>
                      </div>
                      {currentUser.id === u.id && <UserCheck size={14} className="ml-auto text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotification(!showNotification)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 relative transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 shadow-md shadow-pink-500/50" />
          </button>

          {showNotification && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#0F1224] shadow-2xl p-1 z-50">
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">System Alerts</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-300">2 New</span>
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
