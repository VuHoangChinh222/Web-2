import React from 'react';
import { 
  DollarSign, ShoppingCart, Package, Users2, 
  ArrowUpRight, AlertTriangle, TrendingUp, CheckCircle, Clock 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { useAdmin } from '../context/AdminContext';
import GlassCard from '../components/GlassCard';

const Dashboard = ({ setActivePage, setSelectedOrderId, setIsOrderModalOpen }) => {
  const { products, orders, customers, categoriesProduct } = useAdmin();

  // 1. Calculate general statistics
  const completedOrders = orders.filter(o => o.status === 'Completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const activeCustomersCount = customers.filter(c => c.active).length;
  const lowStockProducts = products.filter(p => p.stock <= 10);

  // 2. Prepare sales chart data (last 7 days simulation)
  const salesChartData = [
    { name: 'Mon', sales: 420, orders: 3 },
    { name: 'Tue', sales: 980, orders: 4 },
    { name: 'Wed', sales: 710, orders: 2 },
    { name: 'Thu', sales: 1200, orders: 5 },
    { name: 'Fri', sales: 850, orders: 3 },
    { name: 'Sat', sales: 1600, orders: 7 },
    { name: 'Sun', sales: totalRevenue > 2000 ? totalRevenue - 2500 : 900, orders: 4 },
  ];

  // 3. Prepare category chart data
  const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];
  const categoryData = categoriesProduct.map((cat, idx) => ({
    name: cat.name,
    count: cat.productCount,
    color: COLORS[idx % COLORS.length]
  }));

  // Helper for Order Status colors
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Completed</span>;
      case 'Processing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">Processing</span>;
      case 'Shipped':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">Shipped</span>;
      case 'Pending':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Pending</span>;
      case 'Cancelled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400">{status}</span>;
    }
  };

  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Message */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-pink-900/20 to-transparent border border-purple-500/20 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Welcome back to CHINH Control Panel</h2>
          <p className="text-xs text-slate-400 mt-1">Here is a comprehensive look at your commerce store analytics and activities.</p>
        </div>
        <button 
          onClick={() => setActivePage('orders')}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          Manage Sales <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <GlassCard hoverEffect={true} className="relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-purple-500">
            <DollarSign size={100} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <TrendingUp size={12} />
              <span>+12.4% vs last week</span>
            </p>
          </div>
        </GlassCard>

        {/* Metric 2 */}
        <GlassCard hoverEffect={true} className="relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-pink-500">
            <ShoppingCart size={100} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Orders</span>
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{pendingOrdersCount}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Requires immediate action
            </p>
          </div>
        </GlassCard>

        {/* Metric 3 */}
        <GlassCard hoverEffect={true} className="relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-blue-500">
            <Package size={100} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{products.length}</h3>
            <p className="text-xs text-amber-400 flex items-center gap-1 mt-1 font-semibold">
              <AlertTriangle size={12} />
              <span>{lowStockProducts.length} low-stock items</span>
            </p>
          </div>
        </GlassCard>

        {/* Metric 4 */}
        <GlassCard hoverEffect={true} className="relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-emerald-500">
            <Users2 size={100} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Customers</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users2 size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{activeCustomersCount}</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-semibold font-mono">
              <span>{Math.round((activeCustomersCount / customers.length) * 100)}% active rate</span>
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <GlassCard hoverEffect={false} title="Revenue Analytics" className="lg:col-span-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" h="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F1224', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Product Categories Share */}
        <GlassCard hoverEffect={false} title="Product Stock Share" subtitle="Item distribution by category">
          <div className="h-72 flex flex-col justify-between">
            <div className="flex-1 min-h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <XAxis type="number" stroke="#64748B" fontSize={10} hide />
                  <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0F1224', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={10}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 border-t border-white/5 pt-4">
              {categoryData.slice(0, 4).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate">{entry.name} ({entry.count})</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tables Row: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <GlassCard hoverEffect={false} title="Recent Orders" className="lg:col-span-2" subtitle="Latest store checkouts">
          <div className="overflow-x-auto glass-scrollbar -mx-5 px-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-medium">
                  <th className="py-3 pr-2">ID</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Total</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.slice(0, 4).map((order) => {
                  const cust = customers.find(c => c.id === order.customerId);
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 pr-2 font-mono text-purple-400 font-semibold">{order.id}</td>
                      <td className="py-3 font-medium text-white">{cust ? cust.fullname : 'Unknown'}</td>
                      <td className="py-3 text-slate-400">{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td className="py-3 font-semibold text-white">${order.totalAmount.toFixed(2)}</td>
                      <td className="py-3">{getStatusBadge(order.status)}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => handleViewOrder(order.id)}
                          className="glass-btn px-2.5 py-1 rounded-md text-[11px] font-semibold hover:border-purple-500/40 hover:text-purple-300"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Inventory Warning Alerts */}
        <GlassCard hoverEffect={false} title="Stock Alerts" subtitle="Items with critical stock levels (<= 10)">
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 glass-scrollbar">
            {lowStockProducts.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-500 gap-1.5">
                <CheckCircle size={24} className="text-emerald-500" />
                <span className="text-xs font-semibold">All products fully stocked.</span>
              </div>
            ) : (
              lowStockProducts.map((prod) => (
                <div key={prod.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors">
                  <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{prod.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">Category: {categoriesProduct.find(c => c.id === prod.categoryId)?.name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${prod.stock === 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                      {prod.stock} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
