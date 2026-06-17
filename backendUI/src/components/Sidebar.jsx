import React from 'react';
import { 
  LayoutDashboard, ShoppingBag, FolderKanban, ShoppingCart, 
  Users2, FileText, Tags, Image, UserCog, ShieldAlert, Sparkles, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const Sidebar = ({ activePage, setActivePage, isCollapsed, setIsCollapsed, currentUser }) => {
  const { logout } = useAdmin();
  const menuGroups = [
    {
      title: "Core Commerce",
      items: [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard_view' },
        { id: 'products', name: 'Products', icon: ShoppingBag, permission: 'products_manage' },
        { id: 'categories', name: 'Categories', icon: FolderKanban, permission: 'products_manage' },
        { id: 'orders', name: 'Orders', icon: ShoppingCart, permission: 'orders_manage' },
        { id: 'customers', name: 'Customers', icon: Users2, permission: 'customers_manage' },
      ]
    },
    {
      title: "Content & Promo",
      items: [
        { id: 'blogs', name: 'Blogs', icon: FileText, permission: 'blogs_manage' },
        { id: 'banners', name: 'Banners', icon: Image, permission: 'banners_manage' },
      ]
    },
    {
      title: "System & Access",
      items: [
        { id: 'users', name: 'Staff Users', icon: UserCog, permission: 'users_manage' },
        { id: 'roles', name: 'Roles & Permissions', icon: ShieldAlert, permission: 'users_manage' },
      ]
    }
  ];

  // Helper to check user permission (simplified check for mock frontend)
  const hasPermission = (itemPermission) => {
    if (!currentUser || !currentUser.role) return true;
    return currentUser.role.permissions.includes(itemPermission);
  };

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-white/5 bg-[#090A10]/60 backdrop-blur-xl flex flex-col justify-between
        ${isCollapsed ? 'w-[76px]' : 'w-[260px]'}`}
    >
      {/* Sidebar Header Logo */}
      <div>
        <div className="flex items-center justify-between p-5 border-b border-white/5 h-16">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20 text-white flex-shrink-0 animate-pulse-slow">
              <Sparkles size={18} />
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-400 tracking-wider text-lg">
                CHINH
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4 overflow-y-auto max-h-[calc(100vh-140px)] glass-scrollbar px-3 space-y-5">
          {menuGroups.map((group, groupIdx) => {
            // Filter menu items based on role permission
            const visibleItems = group.items.filter(item => hasPermission(item.permission));
            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                {!isCollapsed && (
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 py-1">
                    {group.title}
                  </p>
                )}
                <div className="space-y-[2px]">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative
                          ${isActive 
                            ? 'bg-gradient-to-r from-purple-500/15 to-pink-500/5 text-purple-300 font-semibold border-l-2 border-purple-500' 
                            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.03] border-l-2 border-transparent'
                          }`}
                      >
                        <Icon size={18} className={`transition-transform duration-200 group-hover:scale-110 flex-shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                        {!isCollapsed && <span className="text-sm">{item.name}</span>}
                        
                        {/* Tooltip for collapsed mode */}
                        {isCollapsed && (
                          <div className="absolute left-20 scale-0 group-hover:scale-100 bg-slate-900 border border-white/10 text-white text-xs rounded-md px-2 py-1 transition-all duration-150 origin-left whitespace-nowrap shadow-xl z-50">
                            {item.name}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Information Footer */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-2.5 overflow-hidden bg-black/10">
        <div className="flex items-center gap-3 w-full">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.fullname} 
            className="w-10 h-10 rounded-full border border-purple-500/30 object-cover flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="overflow-hidden flex-1">
              <h4 className="text-xs font-semibold text-white truncate">{currentUser.fullname}</h4>
              <p className="text-[10px] text-purple-400 font-mono truncate">{currentUser.role.name}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all font-semibold"
          title="Logout Session"
        >
          <LogOut size={14} className="flex-shrink-0" />
          {!isCollapsed && <span className="text-xs">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
