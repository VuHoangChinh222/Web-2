import React, { useState } from 'react';
import { Search, Eye, Edit3, ShoppingBag, MapPin, CreditCard, Calendar, RefreshCw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';

const Orders = ({ selectedOrderId, setSelectedOrderId, isOpen, setIsOpen }) => {
  const { orders, orderDetails, customers, products, updateOrderStatus } = useAdmin();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const cust = customers.find(c => c.id === o.customerId);
    const customerName = cust ? cust.fullname.toLowerCase() : '';
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
                        {new Date(order.orderDate).toLocaleString()}
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
      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={activeOrder ? `Invoice: ${activeOrder.id}` : 'Order Detail'}
        maxWidth="max-w-2xl"
      >
        {activeOrder && activeCustomer && (
          <div className="space-y-6">
            {/* Split Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Contact */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <ShoppingBag size={10} className="text-purple-400" /> Customer Information
                </h4>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">{activeCustomer.fullname}</p>
                  <p className="text-[11px] text-slate-400">{activeCustomer.email}</p>
                  <p className="text-[11px] text-slate-400">Phone: {activeCustomer.phone}</p>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <MapPin size={10} className="text-purple-400" /> Shipping Destination
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeOrder.shippingAddress}
                </p>
              </div>
            </div>

            {/* Status and Payment Information */}
            <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="text-slate-400">
                  <CreditCard size={16} />
                </div>
                <div className="text-xs">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Payment Method</p>
                  <p className="font-semibold text-slate-200">{activeOrder.paymentMethod}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-slate-400">
                  <Calendar size={16} />
                </div>
                <div className="text-xs">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Checkout Date</p>
                  <p className="font-semibold text-slate-200">{new Date(activeOrder.orderDate).toLocaleString()}</p>
                </div>
              </div>

              {/* Dynamic Status Update */}
              <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status:</span>
                <select
                  value={activeOrder.status}
                  onChange={(e) => updateOrderStatus(activeOrder.id, e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-md glass-input bg-[#0F1224] border border-purple-500/20 text-purple-300 font-semibold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Order Items</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 glass-scrollbar">
                {activeItems.map((item) => {
                  const prod = products.find(p => p.id === item.productId);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-white/[0.01]">
                      <div className="flex items-center gap-3">
                        <img 
                          src={prod?.image} 
                          alt="" 
                          className="w-10 h-8 rounded object-cover border border-white/10" 
                        />
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[200px]">{prod ? prod.name : 'Deleted Product'}</p>
                          <p className="text-[10px] text-slate-500 font-mono">${item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white">${item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invoice Total Calculation */}
            <div className="border-t border-white/5 pt-4 flex flex-col items-end gap-2 text-xs">
              <div className="flex justify-between w-48 text-slate-400">
                <span>Subtotal:</span>
                <span>${activeOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-48 text-slate-400">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between w-48 text-slate-400">
                <span>Estimated Tax (8%):</span>
                <span>${(activeOrder.totalAmount * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-48 text-base font-bold text-white border-t border-white/5 pt-2 mt-1">
                <span>Grand Total:</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">${(activeOrder.totalAmount * 1.08).toFixed(2)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end pt-4 border-t border-white/5">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="glass-btn-primary px-6 py-2 rounded-xl text-xs font-semibold"
              >
                Close Invoice
              </button>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};

export default Orders;
