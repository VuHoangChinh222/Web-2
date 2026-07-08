import React from 'react';
import GlassCard from '../../components/GlassCard';

const RecentOrdersTable = ({ mappedOrders, mappedCustomers, formatDate, formatPrice, getStatusBadge, onOpenInvoice }) => {
  return (
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
            {mappedOrders.slice(0, 4).map((order) => {
              const cust = mappedCustomers.find(c => c.id === order.customerId);
              return (
                <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3 pr-2 font-mono text-purple-400 font-semibold">{order.id}</td>
                  <td className="py-3 font-medium text-white">{cust ? cust.fullname : 'Unknown'}</td>
                  <td className="py-3 text-slate-400">{formatDate(order.orderDate)}</td>
                  <td className="py-3 font-semibold text-white">{formatPrice(order.totalAmount)}</td>
                  <td className="py-3">{getStatusBadge(order.status)}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onOpenInvoice(order)}
                      className="glass-btn px-2.5 py-1 rounded-md text-[11px] font-semibold hover:border-purple-500/40 hover:text-purple-300"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};

export default RecentOrdersTable;
