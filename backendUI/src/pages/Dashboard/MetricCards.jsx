import React from 'react';
import GlassCard from '../../components/GlassCard';
import { ShoppingCart, Package, Users2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const MetricCards = ({ totalRevenue, processingOrdersCount, totalProducts, lowStockCount, activeCustomersCount, totalCustomers, formatPrice }) => {
  const activeRate = totalCustomers ? Math.round((activeCustomersCount / totalCustomers) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1 */}
      <GlassCard hoverEffect={true} className="relative overflow-hidden">
        <div className="absolute right-3 bottom-0 translate-y-3 opacity-[0.03] text-purple-500 font-extrabold text-7xl select-none font-mono">
          VND
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold font-mono">
            VND
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</h3>
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
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Processing Orders</span>
          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Clock size={18} />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-white">{processingOrdersCount}</h3>
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
          <h3 className="text-2xl font-bold text-white">{totalProducts}</h3>
          <p className="text-xs text-amber-400 flex items-center gap-1 mt-1 font-semibold">
            <AlertTriangle size={12} />
            <span>{lowStockCount} low-stock items</span>
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
            <span>{activeRate}% active rate</span>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default MetricCards;
