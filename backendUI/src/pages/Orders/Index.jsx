import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import OrderDetailModal from './OrderDetailModal';

const Orders = ({ selectedOrderId, setSelectedOrderId, isOpen, setIsOpen }) => {
  const { orders, orderDetails, customers, products, updateOrderStatus } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
      return new Date(year, month - 1, day, hour, minute, second).toLocaleString();
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const cust = customers.find(c => c.id === o.customerId);
    const customerName = cust ? cust.fullname.toLowerCase() : '';
    const matchesSearch = String(o.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.orderCode && o.orderCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      customerName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open Order Detail modal
  const handleOpenDetail = (id) => {
    setSelectedOrderId(id);
    setIsOpen(true);
  };

  // Status Styling Badge
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

  // Find active order details
  const activeOrder = orders.find(o => o.id === selectedOrderId);
  const activeCustomer = activeOrder ? customers.find(c => c.id === activeOrder.customerId) : null;
  const activeItems = activeOrder ? orderDetails.filter(d => d.orderId === activeOrder.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Orders Registry</h2>
        <p className="text-xs text-slate-400">Total orders tracked: {orders.length} checkouts</p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0F1224]/30 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap gap-1 border border-white/5 rounded-lg p-1 bg-white/[0.02]">
            {['all', 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all
                  ${statusFilter === status
                    ? 'bg-purple-600/30 text-purple-300'
                    : 'text-slate-500 hover:text-slate-300'}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <GlassCard hoverEffect={false}>
        <div className="overflow-x-auto glass-scrollbar -mx-5 px-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-medium">
                <th className="py-3">Order ID</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Order Date</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Payment</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const cust = customers.find(c => c.id === order.customerId);
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 font-mono text-purple-400 font-bold text-sm">
                        {order.id}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <img src={cust?.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-white">{cust ? cust.fullname : 'Unknown'}</p>
                            <p className="text-[10px] text-slate-500">{cust?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="py-3.5 font-bold text-white">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-slate-400 font-medium text-[11px]">
                        {order.paymentMethod}
                      </td>
                      <td className="py-3.5">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleOpenDetail(order.id)}
                          className="glass-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:border-purple-500/40 hover:text-purple-300 ml-auto"
                        >
                          <Eye size={12} /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Order Details Modal */}
      <OrderDetailModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        activeOrder={activeOrder}
        activeCustomer={activeCustomer}
        activeItems={activeItems}
        products={products}
        updateOrderStatus={updateOrderStatus}
        formatDate={formatDate}
      />
    </div>
  );
};

export default Orders;
